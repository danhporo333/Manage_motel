import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule], // Import để sử dụng PrismaService
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService], // Export để module khác có thể sử dụng
})
export class UsersModule {}
