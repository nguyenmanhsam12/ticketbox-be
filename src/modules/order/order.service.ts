import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { OrderRepository } from './order.repo';
import { DataSource } from 'typeorm';
import { CartRepository } from '../cart/cart.repo';
import { Users } from 'src/database/entities/Users';
import { PaymentMethodService } from '../payment-method/payment-method.service';

@Injectable()
export class OrderService {

  constructor(private readonly orderRepo : OrderRepository,
    private readonly dataSource: DataSource,
    private readonly cartRepo : CartRepository,
    private readonly paymentService : PaymentMethodService
  ){
    
  }

  async create(payload : any ,clientIp : any, user : Users ) : Promise<any> {
    const { bookingCode, showId, paymentMethodId  } = payload;
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const cart = await this.cartRepo.getCartByBookingCode(bookingCode,showId,queryRunner.manager);
      if(!cart || new Date() > cart.expired_at) {
        throw new HttpException('Cart not found or expired',HttpStatus.BAD_REQUEST);
      }

      const order = await this.orderRepo.createOrder( {
        user_id : user.id,
        phone : user.phone,
        email : user.email,
        orderCode : `ORD-${Date.now()}`,
        status : 'PENDING',
        total_amount : cart.total_amount,
        total_quantity : cart.total_quantity,
        payment_method_id : paymentMethodId,
        payment_status_id : 1,
        event_id : cart.event_id,
        created_at: new Date(),
        updated_at: new Date(),
      } ,queryRunner.manager)

      if(!order) {
        throw new HttpException('Order Not Found',HttpStatus.NOT_FOUND);
      }

    const orderItems = cart.cart_items.map((item) => ({
        order_id: order.id,
        ticket_id: item.ticket.id,
        show_id: cart.show_id,
        ticket_name: item.name, // snapshot name
        price: item.price,      // snapshot price
        quantity: item.quantity,
        created_at: new Date(),
        updated_at: new Date(),
      }));

    // 🚀 4. Bulk insert để tránh loop insert nhiều lần
    await queryRunner.manager
      .createQueryBuilder()
      .insert()
      .into('order_items')
      .values(orderItems)
      .execute();

      await queryRunner.commitTransaction();

      const vnPayUrl = this.paymentService.createVNPayUrl(order.orderCode,order.total_amount,clientIp)
      return vnPayUrl;
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
}
