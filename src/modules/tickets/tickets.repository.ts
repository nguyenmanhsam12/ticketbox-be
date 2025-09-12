import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseRepository } from 'src/common/base/base.repository';
import { Tickets } from 'src/database/entities/Tickets';
import { DataSource, EntityManager, Repository } from 'typeorm';

@Injectable()
export class TicketsRepository extends BaseRepository<Tickets> {
  constructor(@InjectRepository(Tickets) repo: Repository<Tickets>) {
    super(repo);
  }

  async findOneForUpdate(manager: EntityManager, ticketId: number, showId: number) {
    return manager
      .createQueryBuilder(Tickets, 'ticket')
      .setLock('pessimistic_write')
      .where('ticket.id = :ticketId AND ticket.show_id = :showId', { ticketId, showId })
      .getOne();
  }

  // Save via manager (so it participates transaction)
  saveWithManager(manager: EntityManager, ticket: Tickets) {
    return manager.save(ticket);
  }

  async findTicketsAndBatchLock(manager: EntityManager, ticketIds : any[], showId : number ) {
    return manager
      .createQueryBuilder(Tickets, 't')
      .setLock('pessimistic_write')
      .where('t.show_id = :showId', { showId })
      .andWhere('t.id IN (:...ids)', { ids: ticketIds })
      .orderBy('t.id', 'ASC')
      .getMany();
  }
}
