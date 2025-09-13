import { Module } from '@nestjs/common';
import { CartService } from './cart.service';
import { CartController } from './cart.controller';
import { ShowsModule } from '../shows/shows.module';
import { TicketsModule } from '../tickets/tickets.module';
import { CartRepository } from './cart.repo';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Carts } from 'src/database/entities/Carts';
import { CartItemModule } from '../cart-item/cart-item.module';
import { CartItems } from 'src/database/entities/CartItems';
import { Tickets } from 'src/database/entities/Tickets';
import { EventsModule } from '../events/events.module';

@Module({
  imports: [
    ShowsModule,
    TicketsModule,
    TypeOrmModule.forFeature([Carts, CartItems, Tickets]),
    CartItemModule,
    EventsModule,
  ],
  controllers: [CartController],
  providers: [
    CartService,
    CartRepository,
  ],
})
export class CartModule { }
