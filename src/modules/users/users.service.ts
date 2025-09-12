// src/users/users.service.ts
import { Injectable, BadRequestException } from '@nestjs/common';
import { UsersRepository } from './users.repository';
import * as bcrypt from 'bcrypt';
import { BaseService } from 'src/common/base/base.service';
import { Users } from 'src/database/entities/Users';
import { Roles } from '../../common/constants/roles.constant';
import { RoleRepo } from '../roles/role.repo';

@Injectable()
export class UsersService extends BaseService<Users> {
  constructor(
    private readonly usersRepo: UsersRepository,
    private readonly roleRepository: RoleRepo,
  ) {
    super(usersRepo);
  }

  findByEmail(email: string) {
    return this.usersRepo.findByEmail(email);
  }

  async create(dto: Partial<Users>) {
    const exists = await this.findByEmail(dto.email!);
    if (exists) throw new BadRequestException('Email already registered');
    if (dto.password) dto.password = await bcrypt.hash(dto.password, 10);
    const defaultRole = await this.roleRepository.findOne({
      where: { code: Roles.USER },
    });
    if (!defaultRole) throw new BadRequestException('Default role not found');
    dto.role_id = defaultRole?.id;
    return super.create({ ...dto });
  }

  async update(id: number, dto: Partial<Users>) {
    if (dto.email) {
      const exists = await this.findByEmail(dto.email);
      if (exists && exists.id !== id) {
        throw new BadRequestException('Email already registered');
      }
    }
    if (dto.password) dto.password = await bcrypt.hash(dto.password, 10);
    return super.update(id, dto);
  }
}
