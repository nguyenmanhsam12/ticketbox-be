import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { CartService } from './cart.service';

@Controller('carts')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Post('add')
  async addToCart(@Body() createCartDto: any) {
    return this.cartService.addToCart(createCartDto);
  }

  @Get('/quote')
  async getCartByBookingCode(
    @Query('booking_code') bookingCode: string,
    @Query('show_id') showId: string,
  ) {
    return this.cartService.getCartByBookingCode(bookingCode, Number(showId));
  }

  @Patch('/update-step')
  async updateStepCart(
    @Query('booking_code') bookingCode: string,
    @Query('show_id') showId: string,
    @Body() body : any
  ) {
    return this.cartService.updateStepCart(bookingCode, Number(showId), body);
  }

  @Delete('/delete/:bookingCode')
  async deleteCartByBookingCode(@Param('bookingCode') bookingCode: string) {
    return this.cartService.deleteCartByBookingCode(bookingCode);
  }
}
