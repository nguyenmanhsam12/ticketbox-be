import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { CartRepository } from './cart.repo';
import { TicketsRepository } from '../tickets/tickets.repository';
import { ShowsRepository } from '../shows/shows.repository';
import { CartItemRepository } from '../cart-item/cart-item.repo';
import { v4 as uuidv4 } from 'uuid'; 
import { SocketEventsService } from '../events/socket-events.service';

@Injectable()
export class CartService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly cartRepo: CartRepository,
    private readonly ticketRepo: TicketsRepository,
    private readonly showRepo: ShowsRepository,
    private readonly cartItemRepo: CartItemRepository,
    private readonly socketEvents : SocketEventsService,
  ) {}

  async addToCart(dto: any) {
    const show = await this.showRepo.findById(dto.showId);
    if (!show) throw new HttpException('Show not found', HttpStatus.NOT_FOUND);

    const now = new Date();

    // 1 Xoá/restore expired cart
    const existingCart = await this.cartRepo.findCartUserAndShowId(
      dto.userId,
      dto.showId,
    );

    if (
      existingCart &&
      existingCart.expired_at &&
      existingCart.expired_at <= now
    ) {
      for (const ci of existingCart.cart_items ?? []) {
        // lock related ticket
        const ticketRow = await this.ticketRepo.findOne({
          where: { id: ci.ticket.id, show: { id: dto.showId } },
        });
        if (ticketRow) {
          ticketRow.remaining_ticket =
            (ticketRow.remaining_ticket ?? ticketRow.total_ticket) +
            ci.quantity;
          await this.ticketRepo.save(ticketRow);
        }
        await this.cartItemRepo.delete(ci.id);
      }

      await this.cartRepo.delete(existingCart.id);
    }

    // 2) PREP: gom items by ticketId and sort ticketIds to avoid deadlock
    const itemsMap = new Map<number, { ticketId: number; quantity: number }>();
    for (const it of dto.items) {
      const id = Number(it.ticketId);
      const qty = Number(it.quantity);
      const existing = itemsMap.get(id);
      if (existing) existing.quantity += qty;
      else itemsMap.set(id, { ticketId: id, quantity: qty });
    }
    const mergedItems = Array.from(itemsMap.values());
    // sort by ticketId to ensure consistent locking order
    mergedItems.sort((a, b) => a.ticketId - b.ticketId);

    // Start transaction
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      //3 batch lock
      const ticketIds = mergedItems.map((i) => i.ticketId);
      const tickets = await this.ticketRepo.findTicketsAndBatchLock(
        queryRunner.manager,
        ticketIds,
        dto.showId,
      );
      if (tickets.length !== mergedItems.length) {
        throw new HttpException('Some tickets not found', HttpStatus.NOT_FOUND);
      }

      //4 validate * update remaining_ticket
      for (const it of mergedItems) {
        const ticket = tickets.find((t) => t.id === it.ticketId)!;
        const remaining = ticket.remaining_ticket ?? ticket.total_ticket;

        if (remaining < it.quantity) {
          throw new HttpException(
            `Not enough tickets for ticketId ${it.ticketId}. requested ${it.quantity}, remaining ${remaining}`,
            HttpStatus.BAD_REQUEST,
          );
        }
        if (it.quantity < (ticket.min_ticket ?? 1)) {
          throw new HttpException(
            `Minimum quantity for ticket ${it.ticketId} is ${ticket.min_ticket}`,
            HttpStatus.BAD_REQUEST,
          );
        }
        if (it.quantity > ticket.max_ticket) {
          throw new HttpException(
            `Maximum quantity for ticket ${it.ticketId} is ${ticket.max_ticket}`,
            HttpStatus.BAD_REQUEST,
          );
        }

        // update remaining
        ticket.remaining_ticket = remaining - it.quantity;
      }

      await queryRunner.manager.save(tickets);

      //5 tạo cart
      const cart = await this.cartRepo.createWithManager(queryRunner.manager, {
        user: { id: dto.userId } as any,
        show: { id: dto.showId } as any,
        event: { id: dto.eventId } as any,
        expired_at: new Date(now.getTime() + 15 * 60 * 1000),
        total_quantity: 0,
        booking_code:
          'BOOK' + uuidv4().replace(/-/g, '').slice(0, 12).toUpperCase(),
        total_amount: 0,
      });

      let totalAmount = 0;
      let totalQuantity = 0;

      for (const it of mergedItems) {
        const ticket = tickets.find((t) => t.id === it.ticketId)!;

        await this.cartItemRepo.createWithManager(
          queryRunner.manager,
          {
            cart: { id: cart.id } as any,
            ticket: { id: ticket.id } as any,
            quantity: it.quantity,
            price : ticket.price,
            name : ticket.name,
            is_free: ticket.price === 0 ? true : null,
          },
        );

        totalAmount += it.quantity * Number(ticket.price ?? 0);
        totalQuantity += it.quantity;
      }

      cart.total_amount = totalAmount;
      cart.total_quantity = totalQuantity;
      await this.cartRepo.saveWithManager(queryRunner.manager, cart);

      await queryRunner.commitTransaction();
      // 6) return fresh cart with relations
      const result = await this.cartRepo.findByIdWithRelations(cart.id);
    
      if(!result) throw new HttpException('Cart Not found',HttpStatus.NOT_FOUND);
      this.socketEvents.emitRemainingTicketsUpdated({ eventId : result.event_id , showId : result.show_id, tickets : result?.cart_items  })

      return result;
    } catch (error) {
      console.error(error.stack);
      await queryRunner.rollbackTransaction();
      if (error instanceof HttpException) {
        throw error; // giữ nguyên exception, không wrap lại
      }
      throw new HttpException(
        'Internal server error: ' + error.message,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    } finally {
      await queryRunner.release();
    }
  }

  async getCartByBookingCode(bookingCode: string, showId: number) {
    return this.cartRepo.getCartByBookingCode(bookingCode, showId);
  }

  async updateStepCart(bookingCode: string, showId: number, body: any) {
    return this.cartRepo.updateStepCart(bookingCode, showId, body);
  }

  async deleteCartByBookingCode(bookingCode: string) {
    if (!bookingCode)
      throw new HttpException(
        'Booking code is required',
        HttpStatus.BAD_REQUEST,
      );
    return this.cartRepo.deleteCartByBookingCode(bookingCode);
  }
}
