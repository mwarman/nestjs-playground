import { Test, TestingModule } from '@nestjs/testing';
import { ClassSerializerInterceptor, NotFoundException } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';

import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';

describe('UsersController', () => {
  let controller: UsersController;

  const mockUser: User = {
    id: '550e8400-e29b-41d4-a716-446655440001',
    sub: 'b7a9c8d5-e2f1-4a3b-9c7d-6e5f4a3b2c1d',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    username: 'johndoe',
    passwordSalt: 'salt',
    passwordHash: 'hash',
    createdAt: new Date('2023-01-01T00:00:00.000Z'),
    updatedAt: new Date('2023-01-01T00:00:00.000Z'),
  };

  const mockUsersService = {
    findOne: jest.fn(),
    findOneBySub: jest.fn(),
    findOneByUsername: jest.fn(),
    create: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: APP_INTERCEPTOR,
          useClass: ClassSerializerInterceptor,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getProfile', () => {
    it('should be defined', () => {
      // Arrange, Act & Assert
      expect(controller).toBeDefined();
    });

    it('should return the user profile when user exists', async () => {
      // Arrange
      const userId = mockUser.id;
      mockUsersService.findOne.mockResolvedValue(mockUser);

      // Act
      const result = await controller.getProfile(userId);

      // Assert
      expect(result).toEqual(mockUser);
      expect(mockUsersService.findOne).toHaveBeenCalledWith(userId);
      expect(mockUsersService.findOne).toHaveBeenCalledTimes(1);
    });

    it('should return null when user does not exist', async () => {
      // Arrange
      const userId = 'non-existent-id';
      mockUsersService.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(controller.getProfile(userId)).rejects.toThrow(NotFoundException);
      expect(mockUsersService.findOne).toHaveBeenCalledWith(userId);
      expect(mockUsersService.findOne).toHaveBeenCalledTimes(1);
    });

    it('should call UsersService.findOne with the correct user ID', async () => {
      // Arrange
      const userId = '123e4567-e89b-12d3-a456-426614174000';
      mockUsersService.findOne.mockResolvedValue(mockUser);

      // Act
      await controller.getProfile(userId);

      // Assert
      expect(mockUsersService.findOne).toHaveBeenCalledWith(userId);
    });
  });
});
