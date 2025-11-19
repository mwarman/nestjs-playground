import {
  ClassSerializerInterceptor,
  Controller,
  Get,
  Logger,
  NotFoundException,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

import { AuthUser } from '../auth/decorators/auth-user.decorator';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';

/**
 * Controller for managing user-related operations.
 */
@ApiTags('Users')
@ApiBearerAuth()
@UseInterceptors(ClassSerializerInterceptor)
@Controller({ path: 'users', version: '1' })
export class UsersController {
  private readonly logger = new Logger(UsersController.name);

  constructor(private readonly usersService: UsersService) {}

  /**
   * Get the current user's profile.
   * @param userId - The user ID from the JWT token.
   * @returns The user profile.
   */
  @Get('profile')
  @ApiOperation({ summary: 'Get the current user profile' })
  @ApiOkResponse({ description: 'The user profile has been successfully retrieved', type: User })
  @ApiNotFoundResponse({ description: 'User not found' })
  async getProfile(@AuthUser('id') userId: string): Promise<User> {
    this.logger.debug(`UsersController::getProfile - userId: ${userId}`);

    const user = await this.usersService.findOne(userId);

    if (!user) {
      this.logger.warn(`User with ID ${userId} not found`);
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    return user;
  }
}
