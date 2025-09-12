// filepath: d:\work-space\base-project\project-base\src\modules\event-role-permission\event-role-permission.module.ts
import { Module } from '@nestjs/common';
import { EventRolePermissionService } from './event-role-permission.service';
import { EventRolePermissionController } from './event-role-permission.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventRolePermissions } from '../../database/entities/EventRolePermissions';
import { EventRolePermissionRepository } from './event-role-permission.repository';
import { PermissionEventModule } from '../permission-event/permission-event.module';
import { EventsModule } from '../events/events.module'; // Import EventsModule

@Module({
  imports: [
    TypeOrmModule.forFeature([EventRolePermissions]),
    PermissionEventModule,
    EventsModule,
  ],
  controllers: [EventRolePermissionController],
  providers: [EventRolePermissionService, EventRolePermissionRepository],
  exports: [EventRolePermissionService, EventRolePermissionRepository],
})
export class EventRolePermissionModule { }