// src/auth/auth.controller.ts
import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtAccessGuard } from './guards/jwt-access.guard';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';

@Controller('auth')
export class AuthController {
  constructor(
    private auth: AuthService,
    private users: UsersService,
  ) {}

  @Post('register')
  async register(@Body() dto: RegisterDto) {
    const user = await this.users.create({
      email: dto.email,
      password: dto.password,
    });
    return { id: user.id, email: user.email };
  }

  @HttpCode(200)
  @Post('login')
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    // passthrough: true keep format resoponse if use  res.setHeade/res.cookie/res.status
    const user = await this.auth.validateUser(dto.email, dto.password);
    const { access_token, refresh_token } = this.auth.signTokens(user);

    res.cookie('refresh_token', refresh_token, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    return { access_token, refresh_token };
  }

  @UseGuards(JwtRefreshGuard)
  @Post('refresh')
  refresh(@Req() req: any, @Res({ passthrough: true }) res: Response) {
    const payload = req.user;
    const { access_token, refresh_token } = this.auth.signTokens({
      id: payload.sub,
      email: payload.email,
    } as any);
    res.cookie('refresh_token', refresh_token, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    return { access_token };
  }

  @UseGuards(JwtAccessGuard)
  @Get('me')
  me(@Req() req: any) {
    return req.user;
  }

  @Post('logout')
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('refresh_token');
    return { success: true };
  }
}
