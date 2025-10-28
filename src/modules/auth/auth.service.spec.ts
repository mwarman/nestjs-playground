import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { SignInDto } from './dto/sign-in.dto';
import { User } from '../users/entities/user.entity';

// Mock bcrypt
jest.mock('bcrypt', () => ({
  hash: jest.fn(),
  genSalt: jest.fn(),
}));

// Mock uuid
jest.mock('uuid', () => ({
  v4: jest.fn(() => 'mocked-uuid-value'),
}));

const mockBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

describe('AuthService', () => {
  let service: AuthService;

  const mockUsersService = {
    findOneByUsername: jest.fn(),
    create: jest.fn(),
  };

  const mockJwtService = {
    signAsync: jest.fn(),
  };

  const mockUser: User = {
    id: 'test-id',
    sub: 'test-sub',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    username: 'johndoe',
    passwordSalt: 'test-salt',
    passwordHash: 'test-hash',
    createdAt: new Date('2023-01-01T00:00:00.000Z'),
    updatedAt: new Date('2023-01-01T00:00:00.000Z'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('verifyCredentials', () => {
    const signInDto: SignInDto = {
      username: 'johndoe',
      password: 'password123',
    };

    it('should return user when credentials are valid', async () => {
      // Arrange
      mockUsersService.findOneByUsername.mockResolvedValue(mockUser);
      mockBcrypt.hash.mockResolvedValue('test-hash' as never);

      // Act
      const result = await service.verifyCredentials(signInDto);

      // Assert
      expect(result).toEqual(mockUser);
      expect(mockUsersService.findOneByUsername).toHaveBeenCalledWith('johndoe');
      expect(mockBcrypt.hash).toHaveBeenCalledWith('password123', 'test-salt');
    });

    it('should throw UnauthorizedException when user not found', async () => {
      // Arrange
      mockUsersService.findOneByUsername.mockResolvedValue(null);

      // Act & Assert
      await expect(service.verifyCredentials(signInDto)).rejects.toThrow(UnauthorizedException);
      await expect(service.verifyCredentials(signInDto)).rejects.toThrow('Invalid credentials');
      expect(mockUsersService.findOneByUsername).toHaveBeenCalledWith('johndoe');
      expect(mockBcrypt.hash).not.toHaveBeenCalled();
    });

    it('should return null when password is invalid', async () => {
      // Arrange
      mockUsersService.findOneByUsername.mockResolvedValue(mockUser);
      mockBcrypt.hash.mockResolvedValue('wrong-hash' as never);

      // Act
      const result = await service.verifyCredentials(signInDto);

      // Assert
      expect(result).toBeNull();
      expect(mockUsersService.findOneByUsername).toHaveBeenCalledWith('johndoe');
      expect(mockBcrypt.hash).toHaveBeenCalledWith('password123', 'test-salt');
    });
  });

  describe('signIn', () => {
    const signInDto: SignInDto = {
      username: 'johndoe',
      password: 'password123',
    };

    it('should return access token when credentials are valid', async () => {
      // Arrange
      const expectedToken = 'jwt-token';
      mockUsersService.findOneByUsername.mockResolvedValue(mockUser);
      mockBcrypt.hash.mockResolvedValue('test-hash' as never);
      mockJwtService.signAsync.mockResolvedValue(expectedToken);

      // Act
      const result = await service.signIn(signInDto);

      // Assert
      expect(result).toEqual({ accessToken: expectedToken });
      expect(mockUsersService.findOneByUsername).toHaveBeenCalledWith('johndoe');
      expect(mockBcrypt.hash).toHaveBeenCalledWith('password123', 'test-salt');
      expect(mockJwtService.signAsync).toHaveBeenCalledWith({
        sub: 'test-sub',
        username: 'johndoe',
        id: 'test-id',
      });
    });

    it('should throw UnauthorizedException when user not found', async () => {
      // Arrange
      mockUsersService.findOneByUsername.mockResolvedValue(null);

      // Act & Assert
      await expect(service.signIn(signInDto)).rejects.toThrow(UnauthorizedException);
      await expect(service.signIn(signInDto)).rejects.toThrow('Invalid credentials');
      expect(mockUsersService.findOneByUsername).toHaveBeenCalledWith('johndoe');
      expect(mockBcrypt.hash).not.toHaveBeenCalled();
      expect(mockJwtService.signAsync).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException when password is invalid', async () => {
      // Arrange
      mockUsersService.findOneByUsername.mockResolvedValue(mockUser);
      mockBcrypt.hash.mockResolvedValue('wrong-hash' as never);

      // Act & Assert
      await expect(service.signIn(signInDto)).rejects.toThrow(UnauthorizedException);
      await expect(service.signIn(signInDto)).rejects.toThrow('Invalid credentials');
      expect(mockUsersService.findOneByUsername).toHaveBeenCalledWith('johndoe');
      expect(mockBcrypt.hash).toHaveBeenCalledWith('password123', 'test-salt');
      expect(mockJwtService.signAsync).not.toHaveBeenCalled();
    });
  });

  describe('hashPassword', () => {
    it('should hash password with default salt rounds', async () => {
      // Arrange
      const password = 'password123';
      const expectedSalt = 'generated-salt';
      const expectedHash = 'generated-hash';
      mockBcrypt.genSalt.mockResolvedValue(expectedSalt as never);
      mockBcrypt.hash.mockResolvedValue(expectedHash as never);

      // Act
      const result = await service.hashPassword(password);

      // Assert
      expect(result).toEqual({
        salt: expectedSalt,
        hash: expectedHash,
      });
      expect(mockBcrypt.genSalt).toHaveBeenCalledWith(10);
      expect(mockBcrypt.hash).toHaveBeenCalledWith(password, expectedSalt);
    });

    it('should hash password with custom salt rounds', async () => {
      // Arrange
      const password = 'password123';
      const saltRounds = 12;
      const expectedSalt = 'generated-salt';
      const expectedHash = 'generated-hash';
      mockBcrypt.genSalt.mockResolvedValue(expectedSalt as never);
      mockBcrypt.hash.mockResolvedValue(expectedHash as never);

      // Act
      const result = await service.hashPassword(password, saltRounds);

      // Assert
      expect(result).toEqual({
        salt: expectedSalt,
        hash: expectedHash,
      });
      expect(mockBcrypt.genSalt).toHaveBeenCalledWith(saltRounds);
      expect(mockBcrypt.hash).toHaveBeenCalledWith(password, expectedSalt);
    });
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      // Arrange
      const registerDto: RegisterDto = {
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@example.com',
        username: 'janesmith',
        password: 'password123',
      };

      const expectedSalt = 'generated-salt';
      const expectedHash = 'generated-hash';
      const createdUser: User = {
        id: 'new-user-id',
        sub: 'new-user-sub',
        firstName: registerDto.firstName,
        lastName: registerDto.lastName,
        email: registerDto.email,
        username: registerDto.username,
        passwordSalt: expectedSalt,
        passwordHash: expectedHash,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockBcrypt.genSalt.mockResolvedValue(expectedSalt as never);
      mockBcrypt.hash.mockResolvedValue(expectedHash as never);
      mockUsersService.create.mockResolvedValue(createdUser);

      // Act
      const result = await service.register(registerDto);

      // Assert
      expect(result).toEqual(createdUser);
      expect(mockBcrypt.genSalt).toHaveBeenCalledWith(10);
      expect(mockBcrypt.hash).toHaveBeenCalledWith(registerDto.password, expectedSalt);
      expect(mockUsersService.create).toHaveBeenCalledWith({
        firstName: registerDto.firstName,
        lastName: registerDto.lastName,
        email: registerDto.email,
        username: registerDto.username,
        passwordSalt: expectedSalt,
        passwordHash: expectedHash,
      });
    });
  });
});
