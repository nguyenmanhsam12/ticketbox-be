// src/users/users.repository.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseRepository } from 'src/common/base/base.repository';
import { Users } from 'src/database/entities/Users';

@Injectable()
export class UsersRepository extends BaseRepository<Users> {
  constructor(@InjectRepository(Users) repo: Repository<Users>) {
    super(repo);
  }

  findByEmail(email: string) {
    return this.repository.findOne({ where: { email } });
  }
}
