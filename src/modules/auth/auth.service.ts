// src/auth/auth.service.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './types/jwt-payload';
import { Users } from 'src/database/entities/Users';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwt: JwtService,
  ) {}

  async validateUser(email: string, pass: string): Promise<Users> {
    const user = await this.usersService.findByEmail(email);
    if (!user) throw new UnauthorizedException('Invalid credentials');
    const ok = await bcrypt.compare(pass, user.password);
    if (!ok) throw new UnauthorizedException('Invalid credentials');
    return user;
  }

  signTokens(user: Users) {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
    };
    const access_token = this.jwt.sign(payload, {
      secret: process.env.JWT_SECRET,
      expiresIn: process.env.JWT_ACCESS_EXPIRES || '15m',
    });
    const refresh_token = this.jwt.sign(payload, {
      secret: process.env.JWT_SECRET,
      expiresIn: process.env.JWT_REFRESH_EXPIRES || '7d',
    });
    return { access_token, refresh_token };
  }
}
