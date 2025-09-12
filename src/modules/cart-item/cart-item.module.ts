import { Module } from '@nestjs/common';
import { CartItemService } from './cart-item.service';
import { CartItemController } from './cart-item.controller';
import { CartItems } from 'src/database/entities/CartItems';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CartItemRepository } from './cart-item.repo';

@Module({
  imports: [TypeOrmModule.forFeature([CartItems])],
  controllers: [CartItemController],
  providers: [CartItemService,CartItemRepository],
  exports: [CartItemService,CartItemRepository],
})
export class CartItemModule {}
