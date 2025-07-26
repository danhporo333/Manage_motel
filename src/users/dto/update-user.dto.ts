import { IsEmail, IsOptional, IsEnum, IsNotEmpty } from 'class-validator';
import { UserRole } from '@prisma/client';

export class UpdateUserDto {
  @IsOptional()
  @IsNotEmpty({ message: 'Username không được để trống' })
  username?: string;

  @IsOptional()
  @IsEmail({}, { message: 'Email không hợp lệ' })
  email?: string;

  @IsOptional()
  @IsNotEmpty({ message: 'Họ tên không được để trống' })
  fullName?: string;

  @IsOptional()
  phone?: string;

  @IsOptional()
  @IsEnum(UserRole, { message: 'Role không hợp lệ' })
  role?: UserRole;

  @IsOptional()
  isActive?: boolean;
}
