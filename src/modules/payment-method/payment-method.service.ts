import { Injectable } from '@nestjs/common';
import { PaymentMethodRepo } from './payment-method.repo';

@Injectable()
export class PaymentMethodService {

  constructor(private readonly paymentMethodRepo : PaymentMethodRepo){}

  findAll() {
    return this.paymentMethodRepo.findAll();
  }

  
}
