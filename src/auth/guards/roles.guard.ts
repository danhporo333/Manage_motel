import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '@prisma/client';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Method này quyết định có cho phép truy cập không
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);
    // Lấy list roles cần thiết từ @Roles() decorator

    if (!requiredRoles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    const hasRole = requiredRoles.some((role) => user.role === role);

    if (!hasRole) {
      throw new ForbiddenException({
        statusCode: 403,
        message: 'Bạn không có quyền truy cập',
        userRole: user.role,
      });
    }
    return true;
  }
}
