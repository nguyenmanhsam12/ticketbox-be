import { Injectable } from '@nestjs/common';
import { Tickets } from 'src/database/entities/Tickets';
import { TicketsRepository } from './tickets.repository';

@Injectable()
export class TicketsService {
  constructor(private readonly ticketsRepo: TicketsRepository) {}

  async delete(id: number): Promise<void> {
    await this.ticketsRepo.delete(id);
  }
}
