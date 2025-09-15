import { Module } from '@nestjs/common';
import { OrderItemService } from './order-item.service';
import { OrderItemController } from './order-item.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderItems } from 'src/database/entities/OrderItem';
import { OrderItemRepository } from './order-item.repo';

@Module({
  imports : [TypeOrmModule.forFeature([OrderItems])],
  controllers: [OrderItemController],
  providers: [OrderItemService, OrderItemRepository],
  exports : [OrderItemService, OrderItemRepository],
})
export class OrderItemModule {}
