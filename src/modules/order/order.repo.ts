import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseRepository } from 'src/common/base/base.repository';
import { Orders } from 'src/database/entities/Orders';
import { EntityManager, Repository } from 'typeorm';

@Injectable()
export class OrderRepository extends BaseRepository<Orders> {
  constructor(
    @InjectRepository(Orders) private readonly orderRepo: Repository<Orders>,
  ) {
    super(orderRepo);
  }

  async createOrder(payload, manager: EntityManager): Promise<any> {
    const repo = manager ? manager.getRepository(Orders) : this.orderRepo;
    const order = repo.create(payload);
    return repo.save(order);
  }

  async updateStatusByOrderCode(
    orderCode: string,
    payment_status_id: number,
    manager ?: EntityManager,
  ): Promise<any> {

    const repo = manager ? manager.getRepository(Orders) : this.orderRepo;

    return await repo.update(
      {
        orderCode,
      },
      {
        payment_status_id,
      },
    );
  }

  async getOrderStatus(status : string, timeline : string, user : any) {

    const now = new Date();

    const query = await this.orderRepo
      .createQueryBuilder('order')
      .innerJoinAndSelect('order.show','show')
      .innerJoinAndSelect('order.event','event')
      .where('order.user_id = :userId', { userId : user.id });

    if(status !== 'all') {
      query.andWhere('order.status =:status', { status });
    }

    if (timeline === 'upcoming') {
      query.andWhere('show.time_start > :now', { now });
    } else if (timeline === 'ended') {
      query.andWhere('show.time_start < :now', { now });
    }

    return query.orderBy('show.time_start', 'ASC').getRawMany();
  }
}
