import { forwardRef, Module } from '@nestjs/common';
import { EventMembershipService } from './event-membership.service';
import { EventMembershipController } from './event-membership.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventMemberships } from 'src/database/entities/EventMemberships';
import { EventMembershipRepository } from './event-membership.repository';
import { EventsModule } from '../events/events.module';
import { UsersModule } from '../users/users.module';
import { EventRoleModule } from '../event-role/event-role.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([EventMemberships]),
    EventsModule,
    UsersModule,
    forwardRef(() => EventRoleModule)
  ],
  controllers: [EventMembershipController],
  providers: [EventMembershipService, EventMembershipRepository],
  exports: [EventMembershipService, EventMembershipRepository],
})
export class EventMembershipModule { }
