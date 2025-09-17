import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseRepository } from 'src/common/base/base.repository';
import { CartItems } from 'src/database/entities/CartItems';
import { Carts } from 'src/database/entities/Carts';
import { Tickets } from 'src/database/entities/Tickets';
import { EntityManager, Repository } from 'typeorm';
import { SocketEventsService } from '../events/socket-events.service';

@Injectable()
export class CartRepository extends BaseRepository<Carts> {
    constructor(
        @InjectRepository(Carts) private readonly cartRepo: Repository<Carts>,
        @InjectRepository(CartItems) private readonly cartItemRepo: Repository<CartItems>,
        @InjectRepository(Tickets) private readonly ticketRepo : Repository<Tickets>,
        private readonly socketEvents : SocketEventsService,
    ) {
        super(cartRepo);
    }

    // Find active cart for a given user+show with relations and lock (to be used inside transaction)
  async findActiveCartForUserShowForUpdate(manager: EntityManager, userId: number, showId: number) {
    return manager
      .createQueryBuilder(Carts, 'cart')
      .innerJoinAndSelect('cart.cart_items', 'cart_items')
      .innerJoinAndSelect('cart_items.ticket', 'ticket')
      .where('cart.user_id = :userId AND cart.show_id = :showId', { userId, showId })
      .getOne();
  }

  createWithManager(manager: EntityManager, partial: Partial<Carts>) {
    const entity = manager.create(Carts, partial);
    return manager.save(entity);
  }

  saveWithManager(manager: EntityManager, cart: Carts) {
    return manager.save(cart);
  }

  async softDeleteByBookingCode(
      bookingCode: string,
      manager?: EntityManager,
    ): Promise<void> {
      // Lấy repo trong transaction
      const repo = manager ? manager.getRepository(Carts) : this.cartRepo;
      await repo.update(
        { booking_code: bookingCode },
        { deleted_at: new Date() },
      );
    }

  // fetch final cart (outside transaction) with relations for returning to client
  findByIdWithRelations(cartId: number) {
    return this.cartRepo.findOne({ where: { id: cartId }, relations: ['cart_items', 'cart_items.ticket'] });
  }

  async getCartByBookingCode(bookingCode : string, showId : number, manager ?: EntityManager) {
    if(!bookingCode) throw new HttpException('Booking code is required', HttpStatus.BAD_REQUEST);
    const repo = manager ? manager.getRepository(Carts) : this.cartRepo
    return repo.findOne({ where: { booking_code: bookingCode, show: { id: showId },}, relations: ['cart_items', 'cart_items.ticket'] });
  }

  async updateStepCart(bookingCode : string, showId : number, body : any) {
    if(!bookingCode) throw new HttpException('Booking code is required', HttpStatus.BAD_REQUEST);
    const cart = await this.cartRepo.findOne({ where : { booking_code : bookingCode, show : { id : showId } } })
    if (!cart) {
      throw new HttpException('Cart Not Found', HttpStatus.NOT_FOUND )
    }
    cart.step = body.step;
    return this.cartRepo.save(cart);
  }

  async deleteCartByBookingCode ( bookingCode : string ) {
    const cart = await this.cartRepo.findOne({ where: { booking_code: bookingCode } , relations: ['cart_items', 'cart_items.ticket'] });
    if(!cart) throw new HttpException('Cart not found', HttpStatus.NOT_FOUND);

    for(const item of cart.cart_items ?? []) {
        if(item.ticket) {
            item.ticket.remaining_ticket = (item.ticket.remaining_ticket ?? item.ticket.total_ticket) + item.quantity;
            await this.ticketRepo.save(item.ticket);
        }
    }

    await this.cartItemRepo.delete({ cart: { id: cart.id } });

    await this.cartRepo.delete(cart.id);

    this.socketEvents.emitRemainingTicketsUpdated({ eventId : cart.event_id, showId : cart.show_id, tickets : cart.cart_items })

    return cart;
  }

  async findCartUserAndShowId(userId: number, showId: number) {
    return await this.cartRepo.findOne({
      where: { user: { id: userId }, show: { id: showId } },
      relations: ['cart_items', 'cart_items.ticket'],
    });
  }
}
