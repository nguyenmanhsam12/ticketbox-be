import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { OrderRepository } from './order.repo';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Orders } from 'src/database/entities/Orders';
import { CartModule } from '../cart/cart.module';
import { PaymentMethodModule } from '../payment-method/payment-method.module';

@Module({
  imports : [TypeOrmModule.forFeature([Orders]),
  CartModule,
  PaymentMethodModule,
  ],
  controllers: [OrderController],
  providers: [OrderService, OrderRepository],
  exports : [OrderService, OrderRepository]
})
export class OrderModule {}
