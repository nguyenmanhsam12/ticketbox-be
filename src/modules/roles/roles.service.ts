import { Injectable } from '@nestjs/common';
import { BaseService } from '../../common/base/base.service';
import { Roles } from '../../database/entities/Roles';
import { RoleRepo } from './role.repo';
import { In } from 'typeorm';
import { PermissionRepo } from '../permissions/permission.repo';
import { AddOrUpdatePermissionInRoleDto } from './dto/add-or-update-permission-in-role.dto';
import { UserRolePermissionsRepository } from '../user-role-permission/user-role-permisson.repo';

@Injectable()
export class RolesService extends BaseService<Roles> {
  constructor(
    private readonly roleRepo: RoleRepo,
    private readonly permissionRepo: PermissionRepo,
    private readonly userRolePermissionsRepository: UserRolePermissionsRepository,
  ) {
    super(roleRepo);
  }
  async addOrUpdatePermissions(
    id: number,
    dataDto: AddOrUpdatePermissionInRoleDto,
  ) {
    const { permissionIds } = dataDto;
    const role = await this.roleRepo.findOne({
      where: { id },
      relations: ['userRolePermissions'],
    });
    if (!role) {
      throw new Error('Role not found');
    }
    const checkedPermissions = await this.permissionRepo.findAll({
      where: { id: In(permissionIds) },
    });
    if (checkedPermissions.length !== permissionIds.length) {
      throw new Error('Some permissions not found');
    }
    const existingPermissionIds = role.userRolePermissions.map(
      ({ permission_id }) => permission_id,
    );
    const newPermissionIds = permissionIds.filter(
      (pid) => !existingPermissionIds.includes(pid),
    );
    if (newPermissionIds.length) {
      const newPermissions = newPermissionIds.map((pid) => ({
        role_id: id,
        permission_id: pid,
      }));
      await this.userRolePermissionsRepository.save(newPermissions);
    }
    const removedPermissionIds = existingPermissionIds.filter(
      (pid) => !permissionIds.includes(pid),
    );
    if (removedPermissionIds.length) {
      await this.userRolePermissionsRepository.deleteMany({
        role_id: id,
        permission_id: In(removedPermissionIds),
      });
    }
    return this.roleRepo.findOne({
      where: { id },
      relations: ['userRolePermissions', 'userRolePermissions.permission'],
    });
  }
  async detail(id: number) {
    const roles = await this.roleRepo.findOne({
      where: { id },
      relations: ['userRolePermissions', 'userRolePermissions.permission'],
    });
    if (!roles) {
      throw new Error('Role not found');
    }
    return {
      ...roles,
      userRolePermissions: roles.userRolePermissions.map(
        (urp) => urp.permission,
      ),
    };
  }

  async checkPermissionUser(
    userId: number,
    permissionCode: string,
  ): Promise<boolean> {
    return this.roleRepo.checkPermissionUser(userId, permissionCode);
  }
}
