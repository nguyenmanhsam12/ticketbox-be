import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { AuthGuard } from 'src/common/guard/auth.guard';
import { Request } from 'express';

@UseGuards(AuthGuard)
@Controller('carts')
export class CartController {
  constructor(private readonly cartService: CartService) { }

  @Post('add')
  async addToCart(@Body() createCartDto: any, @Req() req: Request) {
    const user = req['user'];
    return this.cartService.addToCart({ ...createCartDto, userId: user.id });
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
    @Body() body: any
  ) {
    return this.cartService.updateStepCart(bookingCode, Number(showId), body);
  }

  @Delete('/delete/:bookingCode')
  async deleteCartByBookingCode(@Param('bookingCode') bookingCode: string) {
    return this.cartService.deleteCartByBookingCode(bookingCode);
  }
}
