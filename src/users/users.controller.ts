import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ValidationPipe,
  Query,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';

@Controller('users')
@UseGuards(JwtAuthGuard) // Tất cả endpoints cần đăng nhập
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // POST /api/users - Tạo user mới (CHỈ ADMIN)
  @UseGuards(RolesGuard)
  @Roles(UserRole.admin)
  @Post()
  async create(@Body(ValidationPipe) createUserDto: CreateUserDto, @CurrentUser() user: any) {
    return this.usersService.create(createUserDto);
  }

  // GET /api/users - Lấy tất cả users (ADMIN & STAFF)
  @UseGuards(RolesGuard)
  @Roles(UserRole.admin, UserRole.staff)
  @Get()
  async findAll(@CurrentUser() user: any) {
    return this.usersService.findAll();
  }

  // GET /api/users/role/:role - Lấy users theo role (CHỈ ADMIN)
  @UseGuards(RolesGuard)
  @Roles(UserRole.admin)
  @Get('role/:role')
  async findByRole(@Param('role') role: string, @CurrentUser() user: any) {
    return this.usersService.findByRole(role);
  }

  // GET /api/users/me - Lấy thông tin bản thân (TẤT CẢ USER)
  @Get('me')
  async getMyProfile(@CurrentUser() user: any) {
    return this.usersService.findOne(user.id);
  }

  // GET /api/users/:id - Lấy user theo ID (ADMIN, STAFF, hoặc chính mình)
  @Get(':id')
  async findOne(@Param('id') id: string, @CurrentUser() user: any) {
    // Kiểm tra quyền: Admin/Staff có thể xem tất cả, User chỉ xem được chính mình
    if (user.role !== UserRole.admin && user.role !== UserRole.staff && user.id !== id) {
      throw new ForbiddenException('Bạn không có quyền xem thông tin này');
    }

    return this.usersService.findOne(id);
  }

  // PATCH /api/users/:id - Cập nhật user (ADMIN hoặc chính mình)
  @Patch(':id')
  async update(@Param('id') id: string, @Body(ValidationPipe) updateUserDto: UpdateUserDto, @CurrentUser() user: any) {
    // Kiểm tra quyền: Admin có thể sửa tất cả, User chỉ sửa được chính mình
    if (user.role !== UserRole.admin && user.id !== id) {
      throw new ForbiddenException('Bạn không có quyền cập nhật thông tin này');
    }

    // User thường không được thay đổi role
    if (user.role !== UserRole.admin && updateUserDto.role) {
      delete updateUserDto.role;
    }

    return this.usersService.update(id, updateUserDto);
  }

  // PATCH /api/users/:id/password - Đổi mật khẩu (ADMIN hoặc chính mình)
  @Patch(':id/password')
  async changePassword(
    @Param('id') id: string,
    @Body(ValidationPipe) changePasswordDto: ChangePasswordDto,
    @CurrentUser() user: any,
  ) {
    // Kiểm tra quyền: Admin có thể đổi pass tất cả, User chỉ đổi được của mình
    if (user.role !== UserRole.admin && user.id !== id) {
      throw new ForbiddenException('Bạn không có quyền đổi mật khẩu này');
    }

    return this.usersService.changePassword(id, changePasswordDto);
  }

  // PATCH /api/users/:id/deactivate - Vô hiệu hóa user (CHỈ ADMIN)
  @UseGuards(RolesGuard)
  @Roles(UserRole.admin)
  @Patch(':id/deactivate')
  async deactivate(@Param('id') id: string, @CurrentUser() user: any) {
    // Không cho phép admin tự vô hiệu hóa chính mình
    if (user.id === id) {
      throw new BadRequestException('Không thể vô hiệu hóa chính mình');
    }

    return this.usersService.deactivate(id);
  }

  // PATCH /api/users/:id/activate - Kích hoạt lại user (CHỈ ADMIN)
  @UseGuards(RolesGuard)
  @Roles(UserRole.admin)
  @Patch(':id/activate')
  async activate(@Param('id') id: string, @CurrentUser() user: any) {
    return this.usersService.activate(id);
  }
}
