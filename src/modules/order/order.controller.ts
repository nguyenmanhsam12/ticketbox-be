import { Controller, Post, Body, Req, UseGuards } from '@nestjs/common';
import { OrderService } from './order.service';
import { Request } from 'express';
import { AuthGuard } from 'src/common/guard/auth.guard';

@UseGuards(AuthGuard)
@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post('create')
  create(@Body() payload, @Req() req : Request ) {
    const user = req['user'];
    const clientIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    return this.orderService.create(payload,clientIp,user);
  }

  
}
