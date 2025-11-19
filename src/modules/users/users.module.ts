import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from './entities/user.entity';

/**
 * Users module for managing user-related functionality.
 */
@Module({
  imports: [TypeOrmModule.forFeature([User]), TypeOrmModule.forFeature([User], 'read-only')],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
