import { IsEmail, IsNotEmpty, IsOptional, IsEnum, MinLength } from 'class-validator';
import { UserRole } from '@prisma/client';

export class CreateUserDto {
  @IsNotEmpty({ message: 'Username không được để trống' })
  username: string;

  @IsEmail({}, { message: 'Email không hợp lệ' })
  email: string;

  @IsNotEmpty({ message: 'Mật khẩu không được để trống' })
  @MinLength(6, { message: 'Mật khẩu phải có ít nhất 6 ký tự' })
  password: string;

  @IsNotEmpty({ message: 'Họ tên không được để trống' })
  fullName: string;

  @IsOptional()
  phone?: string;

  @IsEnum(UserRole, { message: 'Role không hợp lệ' })
  role: UserRole;
}
