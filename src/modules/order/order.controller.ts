import { Controller, Post, Body, Req, UseGuards, Get, Query, Res, Param } from '@nestjs/common';
import { OrderService } from './order.service';
import { Request, Response } from 'express';
import { AuthGuard } from 'src/common/guard/auth.guard';
import { vnpConfig } from 'src/config/vnpay.config';


@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @UseGuards(AuthGuard)
  @Post('create')
  create(@Body() payload, @Req() req : Request) {
    const user = req['user'];
    const clientIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    return this.orderService.create(payload,clientIp,user);
  }
  
  @Get('vnpay_return')
  async vnpayRetrun(@Query() query, @Res() res : Response) {
    const order = await this.orderService.handleVnpCallback(query);
    return res.redirect(`${vnpConfig.frontend_Success_Url}/events/${order.event_id}/bookings/${order.show_id}/thankyou-${order.orderCode}`);
  }

  @Get(':orderCode')
  async getOrder(@Param() params ) {
    return await this.orderService.getOrder(params.orderCode);
  }

  @UseGuards(AuthGuard)
  @Get()
  async getOrderStatus(
    @Query('status') status : string,
    @Query('timeline') timeline : string,
    @Req() req : Request,
  ) {
    const user = req['user'];
    return this.orderService.getOrderStatus(status,timeline,user);
  }   
  
}
