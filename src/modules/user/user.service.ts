import { Injectable } from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserRepository } from './user.repo';
import { Users } from 'src/database/entities/Users';

@Injectable()
export class UserService {

  constructor(private readonly userRepo: UserRepository) { }

  create(payload: { email: string, password: string, role_id: number }): Promise<Users> {
    return this.userRepo.create(payload);
  }

  findAll() {
    return `This action returns all user`;
  }

  async findOneByEmail(email: string): Promise<Users | null> {
    return await this.userRepo.findOne({ where: { email } });
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
