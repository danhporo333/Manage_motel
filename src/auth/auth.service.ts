import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    // Kiểm tra email và username đã tồn tại
    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [{ email: registerDto.email }, { username: registerDto.username }],
      },
    });

    if (existingUser) {
      throw new ConflictException('Email hoặc username đã tồn tại');
    }

    // Mã hóa mật khẩu
    const hashedPassword = await bcrypt.hash(registerDto.password, 12);

    // Tạo người dùng mới
    const newUser = await this.prisma.user.create({
      data: {
        username: registerDto.username,
        email: registerDto.email,
        passwordHash: hashedPassword,
        fullName: registerDto.fullName,
        phone: registerDto.phone,
        role: registerDto.role || 'staff', // Sửa từ 'tenant' thành 'staff'
      },
    });

    // Tạo token JWT
    const payload = {
      sub: newUser.id,
      email: newUser.email,
      username: newUser.username,
      role: newUser.role,
    };

    return {
      message: 'Đăng ký thành công',
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        fullName: newUser.fullName,
        role: newUser.role,
      },
      access_token: this.jwtService.sign(payload),
    };
  }

  async login(loginDto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: loginDto.email },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Email hoặc mật khẩu không đúng');
    }

    // Kiểm tra password
    const isPasswordValid = await bcrypt.compare(loginDto.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Email hoặc mật khẩu không đúng');
    }

    // Tạo JWT token
    const payload = {
      sub: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
    };

    return {
      message: 'Đăng nhập thành công',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
      },
      access_token: this.jwtService.sign(payload),
    };
  }

  async validateUser(payload: any) {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        username: true,
        email: true,
        fullName: true,
        role: true,
        isActive: true,
      },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('User không hợp lệ');
    }

    return user;
  }

  async getAllUsers() {
    const users = await this.prisma.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        fullName: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        createdAt: 'desc', // Sắp xếp theo thời gian tạo mới nhất
      },
    });

    return {
      message: 'Lấy danh sách tài khoản thành công',
      total: users.length,
      users: users,
    };
  }
}
