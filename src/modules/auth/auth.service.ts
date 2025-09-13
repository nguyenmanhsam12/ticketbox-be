// src/auth/auth.service.ts

import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { UserService } from "../user/user.service";
import * as bcrypt from 'bcrypt';
import { Users } from "src/database/entities/Users";
import { JwtService } from '@nestjs/jwt';


@Injectable()
export class AuthService {
  constructor(private readonly userService: UserService,
    private readonly jwtService: JwtService
  ) {

  }

  async signUp(registerDto: { email: string, password: string }): Promise<Users> {
    const { email, password } = registerDto;
    const user = await this.userService.findOneByEmail(email);
    if (user) {
      throw new HttpException('User already exists', HttpStatus.BAD_REQUEST);
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await this.userService.create({ email, password: hashedPassword, role_id: 2 });
    return newUser;
  }

  async signIn(email: string, pass: string): Promise<any> {
    const user = await this.userService.findOneByEmail(email);
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    const isMatch = await bcrypt.compare(pass, user.password);
    if (!isMatch) {
      throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);
    }
    const { password, ...result } = user;

    const payload = { id: result.id, email: result.email, role_id: result.role_id };
    const access_token = await this.jwtService.signAsync(payload);
    return { access_token, user: result };
  }
}
