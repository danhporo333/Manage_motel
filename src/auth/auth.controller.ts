import { Controller, Post, Get, Body, UseGuards, ValidationPipe, Param } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import { Roles } from './decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body(ValidationPipe) registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  async login(@Body(ValidationPipe) loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @UseGuards(JwtAuthGuard) // Bảo vệ route - phải có JWT token hợp lệ
  @Get('profile')
  async getProfile(@CurrentUser() user: any) {
    return {
      message: 'Thông tin người dùng',
      user: user,
    };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.admin) // Chỉ user có role 'admin' mới truy cập được
  @Get('admin-only')
  async adminOnly(@CurrentUser() user: any) {
    return {
      message: 'Chỉ admin mới truy cập được',
      user: user,
    };
  }

  @Post('logout')
  async logout() {
    return {
      message: 'Đăng xuất thành công',
    };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.admin) // Chỉ user có role 'admin' mới truy cập được
  @Get('alluser')
  async getAllUsers(@CurrentUser() user: any) {
    return this.authService.getAllUsers();
  }
}
