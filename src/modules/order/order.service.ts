import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { OrderRepository } from './order.repo';
import { DataSource, EntityManager } from 'typeorm';
import { CartRepository } from '../cart/cart.repo';
import { Users } from 'src/database/entities/Users';
import { PaymentMethodService } from '../payment-method/payment-method.service';
import { PaymentTransactionRepo } from '../payment-transaction/payment-transaction.repo';
import { Orders } from 'src/database/entities/Orders';
import { Carts } from 'src/database/entities/Carts';
import { CartItemRepository } from '../cart-item/cart-item.repo';

@Injectable()
export class OrderService {
  constructor(
    private readonly orderRepo: OrderRepository,
    private readonly dataSource: DataSource,
    private readonly cartRepo: CartRepository,
    private readonly paymentService: PaymentMethodService,
    private readonly paymentTransactionRepo: PaymentTransactionRepo,
    private readonly cartItemRepo: CartItemRepository,
  ) {}

  async create(payload: any, clientIp: any, user: Users): Promise<any> {
    const { bookingCode, showId, paymentMethodId, isFreeMethod } = payload;
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const cart = await this.cartRepo.getCartByBookingCode(
        bookingCode,
        showId,
        queryRunner.manager,
      );
      if (!cart || new Date() > cart.expired_at) {
        throw new HttpException(
          'Cart not found or expired',
          HttpStatus.BAD_REQUEST,
        );
      }
      
      console.log('paymentMethodId',paymentMethodId);
      

      if (paymentMethodId) {
        const order = await this.createOrderService(
          user,
          cart,
          payload,
          queryRunner.manager,
        );

        if (!order) {
          throw new HttpException('Order Not Found', HttpStatus.NOT_FOUND);
        }

        await this.createOrderItemService(
          cart.cart_items,
          order,
          queryRunner.manager,
        );

        //vnpay
        if (order.payment_method_id === 1) {
          const paymentTransaction = queryRunner.manager.create(
            'payment_transactions',
            {
              order_code: order.orderCode,
              user_id: user.id,
              payment_gateway: 'vnpay',
              amount: order.total_amount,
              status: 'PENDING',
              ip_address: clientIp,
              request_data: null, // có thể điền JSON.stringify của params nếu muốn lưu
            },
          );
          await queryRunner.manager.save(
            'payment_transactions',
            paymentTransaction,
          );

          const vnPayUrl = this.paymentService.createVNPayUrl(
            order.orderCode,
            order.total_amount,
            clientIp,
          );
          await queryRunner.commitTransaction();
          return { url: vnPayUrl };
        }
      }

      console.log(2133333);
      
      const order = await this.createOrderService(
        user,
        cart,
        payload,
        queryRunner.manager,
      );

      if (!order) {
        throw new HttpException('Order Not Found', HttpStatus.NOT_FOUND);
      }

      await this.createOrderItemService(
        cart.cart_items,
        order,
        queryRunner.manager,
      );

      await this.cartItemRepo.softDeleteByCartId(cart.id, queryRunner.manager);
      await this.cartRepo.softDeleteByBookingCode(
        order.booking_code,
        queryRunner.manager,
      );

      //free
      await queryRunner.commitTransaction();
      return { order };
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

  // ✅ Xử lý IPN hoặc Return
  async handleVnpCallback(query: any) {
    const verified = this.paymentService.verifySignature(query);
    if (!verified) {
      throw new HttpException('Invalid signature', HttpStatus.BAD_REQUEST);
    }

    const orderCode = query['vnp_TxnRef'];
    const responseCode = query['vnp_ResponseCode']; // "00" = success
    const status = responseCode === '00' ? 'SUCCESS' : 'FAILED';
    const payment_status_id = responseCode === '00' ? 2 : 3;

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const updatePayment = await this.paymentTransactionRepo.updateStatus(
        orderCode,
        status,
        queryRunner.manager,
      );
      if (!updatePayment.affected) {
        throw new HttpException(
          'Payment transaction not found',
          HttpStatus.NOT_FOUND,
        );
      }

      const updatedOrder = await this.orderRepo.updateStatusByOrderCode(
        orderCode,
        payment_status_id,
        queryRunner.manager,
      );
      if (!updatedOrder.affected) {
        throw new HttpException('Order not found', HttpStatus.NOT_FOUND);
      }

      const order = await queryRunner.manager.findOne(Orders, {
        where: { orderCode },
        relations: ['event'],
      });

      if (!order) {
        throw new HttpException('Order not found', HttpStatus.NOT_FOUND);
      }

      const cart = await queryRunner.manager.getRepository(Carts).findOne({
        where: { booking_code: order.booking_code },
      });
      if (!cart) throw new NotFoundException('Cart not found');

      // soft delete
      await this.cartItemRepo.softDeleteByCartId(cart.id, queryRunner.manager);
      await this.cartRepo.softDeleteByBookingCode(
        order.booking_code,
        queryRunner.manager,
      );

      await queryRunner.commitTransaction();
      return order;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error('handleVnpCallback error:', error);
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        'Internal server error: ' + error.message,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    } finally {
      await queryRunner.release();
    }
  }

  async getOrder(orderCode: string): Promise<Orders | null> {
    return await this.orderRepo.findOne({
      where: { orderCode },
      relations: ['event'],
    });
  }

  // hàm tách createOrder
  private async createOrderService(
    user: any,
    cart: any,
    payload: any,
    manager: EntityManager,
  ) {
    const order = await this.orderRepo.createOrder(
      {
        user_id: user.id,
        phone: user.phone,
        email: user.email,
        orderCode: `ORD-${Date.now()}`,
        status: payload.paymentMethodId ? 'PENDING' : 'CONFIRMED',
        total_amount: cart.total_amount,
        total_quantity: cart.total_quantity,
        payment_method_id: payload.paymentMethodId,
        payment_status_id: 1,
        paymentMethod: payload.isFreeMethod,
        event_id: cart.event_id,
        show_id: payload.showId,
        booking_code: cart.booking_code,
        created_at: new Date(),
        updated_at: new Date(),
      },
      manager,
    );

    return order;
  }

  private async createOrderItemService(
    cart_items: any,
    order: any,
    manager: EntityManager,
  ) {
    const orderItems = cart_items.map((item) => ({
      order_id: order.id,
      ticket_id: item.ticket.id,
      show_id: order.show_id,
      ticket_name: item.name, // snapshot name
      price: item.price, // snapshot price
      quantity: item.quantity,
      created_at: new Date(),
      updated_at: new Date(),
    }));

    // 🚀 4. Bulk insert để tránh loop insert nhiều lần
    await manager
      .createQueryBuilder()
      .insert()
      .into('order_items')
      .values(orderItems)
      .execute();
  }
}
