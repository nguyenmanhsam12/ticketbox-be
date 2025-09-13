// src/auth/auth.controller.ts
import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private auth: AuthService,
  ) { }

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.auth.signUp(registerDto);
  }

  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(@Body() signInDto: LoginDto): Promise<any> {
    return this.auth.signIn(signInDto.email, signInDto.password);
  }
}
