import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseRepository } from 'src/common/base/base.repository';
import { PaymentTransactions } from 'src/database/entities/PaymentTransaction';
import { Repository } from 'typeorm';

@Injectable()
export class PaymentTransactionRepo extends BaseRepository<PaymentTransactions> {
  constructor(
    @InjectRepository(PaymentTransactions)
    private readonly paymentTransactionRepo: Repository<PaymentTransactions>,
  ) {
    super(paymentTransactionRepo);
  }

  async updateStatus(orderCode : string, status : string) : Promise<any> { 
    return await this.paymentTransactionRepo.update({ order_code : orderCode }, {
        status : status as any,
    })
  }
}
