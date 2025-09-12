// src/users/users.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { UsersRepository } from './users.repository';
import { Users } from 'src/database/entities/Users';
import { RolesModule } from '../roles/roles.module';

@Module({
  imports: [TypeOrmModule.forFeature([Users]), RolesModule],
  providers: [UsersRepository, UsersService],
  controllers: [UsersController],
  exports: [UsersService, UsersRepository],
})
export class UsersModule { }
