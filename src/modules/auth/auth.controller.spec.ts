import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';

import { User } from '../users/entities/user.entity';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { SignInDto } from './dto/sign-in.dto';
import { SignInResultDto } from './dto/sign-in-result.dto';

// Mock uuid
jest.mock('uuid', () => ({
  v4: jest.fn(() => 'mocked-uuid-value'),
}));

describe('AuthController', () => {
  let controller: AuthController;

  const mockAuthService = {
    signIn: jest.fn(),
    register: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('signIn', () => {
    const signInDto: SignInDto = {
      username: 'johndoe',
      password: 'password123',
    };

    const expectedResult: SignInResultDto = {
      accessToken: 'jwt-token',
    };

    it('should return access token when credentials are valid', async () => {
      // Arrange
      mockAuthService.signIn.mockResolvedValue(expectedResult);

      // Act
      const result = await controller.signIn(signInDto);

      // Assert
      expect(result).toEqual(expectedResult);
      expect(mockAuthService.signIn).toHaveBeenCalledWith(signInDto);
    });

    it('should throw UnauthorizedException when AuthService throws any error', async () => {
      // Arrange
      mockAuthService.signIn.mockRejectedValue(new Error('Database error'));

      // Act & Assert
      await expect(controller.signIn(signInDto)).rejects.toThrow(UnauthorizedException);
      await expect(controller.signIn(signInDto)).rejects.toThrow('Invalid credentials');
      expect(mockAuthService.signIn).toHaveBeenCalledWith(signInDto);
    });

    it('should throw UnauthorizedException when AuthService throws UnauthorizedException', async () => {
      // Arrange
      mockAuthService.signIn.mockRejectedValue(new UnauthorizedException('Invalid credentials'));

      // Act & Assert
      await expect(controller.signIn(signInDto)).rejects.toThrow(UnauthorizedException);
      await expect(controller.signIn(signInDto)).rejects.toThrow('Invalid credentials');
      expect(mockAuthService.signIn).toHaveBeenCalledWith(signInDto);
    });
  });

  describe('register', () => {
    const registerDto: RegisterDto = {
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane.smith@example.com',
      username: 'janesmith',
      password: 'password123',
    };

    const expectedUser: User = {
      id: 'new-user-id',
      sub: 'new-user-sub',
      firstName: registerDto.firstName,
      lastName: registerDto.lastName,
      email: registerDto.email,
      username: registerDto.username,
      passwordSalt: 'password-salt',
      passwordHash: 'password-hash',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should return created user when registration is successful', async () => {
      // Arrange
      mockAuthService.register.mockResolvedValue(expectedUser);

      // Act
      const result = await controller.register(registerDto);

      // Assert
      expect(result).toEqual(expectedUser);
      expect(mockAuthService.register).toHaveBeenCalledWith(registerDto);
    });
  });
});
