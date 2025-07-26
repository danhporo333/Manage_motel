import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  // TẠO USER MỚI (CHỈ ADMIN)
  async create(createUserDto: CreateUserDto) {
    // Kiểm tra email và username đã tồn tại
    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [{ email: createUserDto.email }, { username: createUserDto.username }],
      },
    });

    if (existingUser) {
      throw new ConflictException('Email hoặc username đã tồn tại');
    }

    // Mã hóa mật khẩu
    const hashedPassword = await bcrypt.hash(createUserDto.password, 12);

    // Tạo user mới
    const newUser = await this.prisma.user.create({
      data: {
        username: createUserDto.username,
        email: createUserDto.email,
        passwordHash: hashedPassword,
        fullName: createUserDto.fullName,
        phone: createUserDto.phone,
        role: createUserDto.role,
      },
      select: {
        id: true,
        username: true,
        email: true,
        fullName: true,
        phone: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });

    return {
      message: 'Tạo tài khoản thành công',
      user: newUser,
    };
  }

  // LẤY TẤT CẢ USERS
  async findAll() {
    const users = await this.prisma.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        fullName: true,
        phone: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return {
      message: 'Lấy danh sách người dùng thành công',
      total: users.length,
      data: users,
    };
  }

  // LẤY USER THEO ID
  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        email: true,
        fullName: true,
        phone: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('Không tìm thấy người dùng');
    }

    return {
      message: 'Lấy thông tin người dùng thành công',
      data: user,
    };
  }

  // CẬP NHẬT USER
  async update(id: string, updateUserDto: UpdateUserDto) {
    // Kiểm tra user tồn tại
    const existingUser = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      throw new NotFoundException('Không tìm thấy người dùng');
    }

    // Kiểm tra email/username trùng lặp (nếu có thay đổi)
    if (updateUserDto.email || updateUserDto.username) {
      const duplicateUser = await this.prisma.user.findFirst({
        where: {
          AND: [
            { id: { not: id } }, // Không phải user hiện tại
            {
              OR: [{ email: updateUserDto.email }, { username: updateUserDto.username }],
            },
          ],
        },
      });

      if (duplicateUser) {
        throw new ConflictException('Email hoặc username đã tồn tại');
      }
    }

    // Cập nhật user
    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: updateUserDto,
      select: {
        id: true,
        username: true,
        email: true,
        fullName: true,
        phone: true,
        role: true,
        isActive: true,
        updatedAt: true,
      },
    });

    return {
      message: 'Cập nhật thông tin thành công',
      data: updatedUser,
    };
  }

  // ĐỔI MẬT KHẨU
  async changePassword(id: string, changePasswordDto: ChangePasswordDto) {
    const { currentPassword, newPassword, confirmPassword } = changePasswordDto;

    // Kiểm tra mật khẩu mới và xác nhận khớp nhau
    if (newPassword !== confirmPassword) {
      throw new BadRequestException('Mật khẩu mới và xác nhận không khớp');
    }

    // Tìm user
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('Không tìm thấy người dùng');
    }

    // Kiểm tra mật khẩu cũ
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isCurrentPasswordValid) {
      throw new BadRequestException('Mật khẩu hiện tại không đúng');
    }

    // Mã hóa mật khẩu mới
    const hashedNewPassword = await bcrypt.hash(newPassword, 12);

    // Cập nhật mật khẩu
    await this.prisma.user.update({
      where: { id },
      data: { passwordHash: hashedNewPassword },
    });

    return {
      message: 'Đổi mật khẩu thành công',
    };
  }

  // VÔ HIỆU HÓA USER (SOFT DELETE)
  async deactivate(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('Không tìm thấy người dùng');
    }

    await this.prisma.user.update({
      where: { id },
      data: { isActive: false },
    });

    return {
      message: 'Vô hiệu hóa tài khoản thành công',
    };
  }

  // KÍCH HOẠT LẠI USER
  async activate(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('Không tìm thấy người dùng');
    }

    await this.prisma.user.update({
      where: { id },
      data: { isActive: true },
    });

    return {
      message: 'Kích hoạt tài khoản thành công',
    };
  }

  // LẤY USER THEO ROLE
  async findByRole(role: string) {
    const users = await this.prisma.user.findMany({
      where: { role: role as any },
      select: {
        id: true,
        username: true,
        email: true,
        fullName: true,
        phone: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });

    return {
      message: `Danh sách ${role}`,
      total: users.length,
      data: users,
    };
  }
}
