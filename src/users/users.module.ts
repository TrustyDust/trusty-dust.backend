import { Module } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [UsersService, ThrottlerGuard],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
