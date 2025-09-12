import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventRoleService } from './event-role.service';
import { EventRoleController } from './event-role.controller';
import { EventRoles } from '../../database/entities/EventRoles';
import { EventRoleRepository } from './event-role.repository';
import { EventRolePermissionModule } from '../event-role-permission/event-role-permission.module';
import { EventMembershipModule } from '../event-membership/event-membership.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([EventRoles]),
    EventRolePermissionModule,
    forwardRef(() => EventMembershipModule), 
  ],
  controllers: [EventRoleController],
  providers: [EventRoleService, EventRoleRepository],
  exports: [EventRoleService],
})
export class EventRoleModule { }