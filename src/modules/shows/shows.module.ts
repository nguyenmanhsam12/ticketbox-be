import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ShowsController } from './shows.controller';
import { ShowsService } from './shows.service';
import { Shows } from 'src/database/entities/Shows';
import { TicketsModule } from '../tickets/tickets.module';
import { ShowsRepository } from './shows.repository';
import { EventsModule } from '../events/events.module';
import { EventsRepository } from '../events/repositories/events.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Shows]), TicketsModule, EventsModule],
  controllers: [ShowsController],
  providers: [ShowsService, ShowsRepository],
  exports: [ShowsService, ShowsRepository],
})
export class ShowsModule {}
