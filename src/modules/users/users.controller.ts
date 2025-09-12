// src/users/users.controller.ts
import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAccessGuard } from '../auth/guards/jwt-access.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Roles } from 'src/common/decorators/roles.decorator';

@Controller('users')
@UseGuards(JwtAccessGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // @Post()
  // createUser(@Body() dto: CreateUserDto) {
  //   return this.usersService.create(dto);
  // }

  // @Get()
  // listUsers() {
  //   return this.usersService.findAll();
  // }

  // @Get(':id')
  // getUserById(@Param('id', ParseIntPipe) id: number) {
  //   return this.usersService.findById(id);
  // }

  // @Patch(':id')
  // updateUser(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateUserDto) {
  //   return this.usersService.update(id, dto);
  // }

  // @Delete(':id')
  // deleteUser(@Param('id', ParseIntPipe) userId: number) {
  //   return this.usersService.delete(userId);
  // }
}
