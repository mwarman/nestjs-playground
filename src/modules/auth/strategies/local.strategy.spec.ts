import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';

import { AuthService } from '../auth.service';
import { LocalStrategy } from './local.strategy';
import { User } from '../../users/entities/user.entity';

describe('LocalStrategy', () => {
  let strategy: LocalStrategy;
  let mockAuthService: Partial<AuthService>;

  beforeEach(async () => {
    mockAuthService = {
      verifyCredentials: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LocalStrategy,
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    strategy = module.get<LocalStrategy>(LocalStrategy);
  });

  it('should be defined', () => {
    expect(strategy).toBeDefined();
  });

  it('should return user when credentials are valid', async () => {
    // Arrange
    const user: User = {
      id: 'id',
      sub: 'sub',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      username: 'johndoe',
      passwordSalt: 'salt',
      passwordHash: 'hash',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    (mockAuthService.verifyCredentials as jest.Mock).mockResolvedValue(user);

    // Act
    const result = await strategy.validate('johndoe', 'password123');

    // Assert
    expect(result).toEqual(user);
    expect(mockAuthService.verifyCredentials).toHaveBeenCalledWith({ username: 'johndoe', password: 'password123' });
  });

  it('should throw UnauthorizedException when credentials are invalid', async () => {
    // Arrange
    (mockAuthService.verifyCredentials as jest.Mock).mockResolvedValue(null);

    // Act & Assert
    await expect(strategy.validate('johndoe', 'wrongpassword')).rejects.toThrow(UnauthorizedException);
    expect(mockAuthService.verifyCredentials).toHaveBeenCalledWith({ username: 'johndoe', password: 'wrongpassword' });
  });
});
