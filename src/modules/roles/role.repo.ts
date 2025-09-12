import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseRepository } from 'src/common/base/base.repository';
import { Repository } from 'typeorm';
import { Roles } from '../../database/entities/Roles';

@Injectable()
export class RoleRepo extends BaseRepository<Roles> {
  constructor(
    @InjectRepository(Roles)
    private readonly rolesRepository: Repository<Roles>,
  ) {
    super(rolesRepository);
  }
  async checkPermissionUser(
    userId: number,
    permissionCode: string,
  ): Promise<boolean> {
    const result = await this.rolesRepository
      .createQueryBuilder('roles')
      .innerJoin('roles.userRolePermissions', 'urp')
      .innerJoin('urp.permission', 'permission')
      .innerJoin('users', 'users', 'users.role_id = roles.id')
      .where('users.id = :userId', { userId })
      .andWhere('permission.code = :permissionCode', { permissionCode })
      .getOne();
    return !!result;
  }
}
