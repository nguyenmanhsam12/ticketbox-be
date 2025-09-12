import { Module } from '@nestjs/common';
import { RolesService } from './roles.service';
import { RolesController } from './roles.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Roles } from '../../database/entities/Roles';
import { RoleRepo } from './role.repo';
import { PermissionsModule } from '../permissions/permissions.module';
import { UserRolePermissionModule } from '../user-role-permission/user-role-permission.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Roles]),
    PermissionsModule,
    UserRolePermissionModule,
  ],
  controllers: [RolesController],
  providers: [RolesService, RoleRepo],
  exports: [RolesService, RoleRepo],
})
export class RolesModule {}
