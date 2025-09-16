import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { OrderRepository } from './order.repo';
import { DataSource } from 'typeorm';
import { CartRepository } from '../cart/cart.repo';
import { Users } from 'src/database/entities/Users';
import { PaymentMethodService } from '../payment-method/payment-method.service';
import { PaymentTransactionRepo } from '../payment-transaction/payment-transaction.repo';
import { Orders } from 'src/database/entities/Orders';

@Injectable()
export class OrderService {
  constructor(
    private readonly orderRepo: OrderRepository,
    private readonly dataSource: DataSource,
    private readonly cartRepo: CartRepository,
    private readonly paymentService: PaymentMethodService,
    private readonly paymentTransactionRepo : PaymentTransactionRepo,
  ) {}

  async create(payload: any, clientIp: any, user: Users): Promise<any> {
    const { bookingCode, showId, paymentMethodId } = payload;
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

      const order = await this.orderRepo.createOrder(
        {
          user_id: user.id,
          phone: user.phone,
          email: user.email,
          orderCode: `ORD-${Date.now()}`,
          status: 'PENDING',
          total_amount: cart.total_amount,
          total_quantity: cart.total_quantity,
          payment_method_id: paymentMethodId,
          payment_status_id: 1,
          event_id: cart.event_id,
          show_id : payload.showId,
          created_at: new Date(),
          updated_at: new Date(),
        },
        queryRunner.manager,
      );

      if (!order) {
        throw new HttpException('Order Not Found', HttpStatus.NOT_FOUND);
      }

      const orderItems = cart.cart_items.map((item) => ({
        order_id: order.id,
        ticket_id: item.ticket.id,
        show_id: cart.show_id,
        ticket_name: item.name, // snapshot name
        price: item.price, // snapshot price
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
      }

      await queryRunner.commitTransaction();

      const vnPayUrl = this.paymentService.createVNPayUrl(
        order.orderCode,
        order.total_amount,
        clientIp,
      );
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

  // ✅ Xử lý IPN hoặc Return
  async handleVnpCallback(query: any) {
    const verified = this.paymentService.verifySignature(query)
    if (!verified) {
      throw new HttpException('Invalid signature',HttpStatus.BAD_REQUEST);
    }

    console.log('query',query);
  
    const orderCode = query['vnp_TxnRef'];
    const responseCode = query['vnp_ResponseCode']; // "00" = success
    const status = responseCode === '00' ? 'SUCCESS' : 'FAILED';
    const payment_status_id = responseCode === '00' ? 2 : 3;
    const message = responseCode === '00' ? 'Đặt vé thành công' : 'Đặt vé thất bại';

    //update payment_transaction
    await Promise.all([
      this.paymentTransactionRepo.updateStatus(orderCode, status),
      this.orderRepo.updateStatusByOrderCode(orderCode, payment_status_id),
    ]);

    const order = await this.orderRepo.findOne({ where : { orderCode }, relations : ['event'] })
    if(!order) {
      throw new HttpException('Order not found', HttpStatus.NOT_FOUND);
    }
    return order;
  }

  async getOrder(orderCode : string) : Promise<Orders | null> {
    console.log("🚀 ~ OrderService ~ getOrder ~ orderCode:", orderCode)
    
    return await this.orderRepo.findOne({ where : { orderCode }, relations : ['event'] })
  }
}
