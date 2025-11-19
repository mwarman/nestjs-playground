import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { CreateUserDto } from './dto/create-user.dto';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';

// Mock uuid
jest.mock('uuid', () => ({
  v4: jest.fn(() => 'mocked-uuid-value'),
}));

describe('UsersService', () => {
  let service: UsersService;

  const mockUserRepository = {
    findOne: jest.fn(),
    save: jest.fn(),
  };

  const mockUserRepositoryReadOnly = {
    findOne: jest.fn(),
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
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: getRepositoryToken(User, 'read-only'),
          useValue: mockUserRepositoryReadOnly,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findOne', () => {
    it('should return a user when found', async () => {
      // Arrange
      mockUserRepositoryReadOnly.findOne.mockResolvedValue(mockUser);
      const userId = 'test-id';

      // Act
      const result = await service.findOne(userId);

      // Assert
      expect(result).toEqual(mockUser);
      expect(mockUserRepositoryReadOnly.findOne).toHaveBeenCalledWith({
        where: { id: userId },
      });
    });

    it('should return null when user not found', async () => {
      // Arrange
      mockUserRepositoryReadOnly.findOne.mockResolvedValue(null);
      const userId = 'non-existent-id';

      // Act
      const result = await service.findOne(userId);

      // Assert
      expect(result).toBeNull();
      expect(mockUserRepositoryReadOnly.findOne).toHaveBeenCalledWith({
        where: { id: userId },
      });
    });

    it('should use the read-only repository', async () => {
      // Arrange
      mockUserRepositoryReadOnly.findOne.mockResolvedValue(mockUser);
      const userId = 'test-id';

      // Act
      await service.findOne(userId);

      // Assert
      expect(mockUserRepositoryReadOnly.findOne).toHaveBeenCalledTimes(1);
      expect(mockUserRepository.findOne).not.toHaveBeenCalled();
    });
  });

  describe('findOneBySub', () => {
    it('should return a user when found by sub', async () => {
      // Arrange
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      const sub = 'test-sub';

      // Act
      const result = await service.findOneBySub(sub);

      // Assert
      expect(result).toEqual(mockUser);
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { sub },
      });
    });

    it('should return null when user not found by sub', async () => {
      // Arrange
      mockUserRepository.findOne.mockResolvedValue(null);
      const sub = 'non-existent-sub';

      // Act
      const result = await service.findOneBySub(sub);

      // Assert
      expect(result).toBeNull();
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { sub },
      });
    });
  });

  describe('findOneByUsername', () => {
    it('should return a user when found by username', async () => {
      // Arrange
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      const username = 'johndoe';

      // Act
      const result = await service.findOneByUsername(username);

      // Assert
      expect(result).toEqual(mockUser);
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { username },
      });
    });

    it('should return null when user not found by username', async () => {
      // Arrange
      mockUserRepository.findOne.mockResolvedValue(null);
      const username = 'non-existent-user';

      // Act
      const result = await service.findOneByUsername(username);

      // Assert
      expect(result).toBeNull();
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { username },
      });
    });
  });

  describe('create', () => {
    it('should create and return a new user', async () => {
      // Arrange
      const createUserDto: CreateUserDto = {
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@example.com',
        username: 'janesmith',
        passwordHash: 'hashed-password',
        passwordSalt: 'password-salt',
      };

      const expectedUser: User = {
        id: 'new-user-id',
        sub: 'new-sub-uuid',
        firstName: createUserDto.firstName,
        lastName: createUserDto.lastName,
        email: createUserDto.email,
        username: createUserDto.username,
        passwordHash: createUserDto.passwordHash,
        passwordSalt: createUserDto.passwordSalt,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockUserRepository.save.mockResolvedValue(expectedUser);

      // Act
      const result = await service.create(createUserDto);

      // Assert
      expect(result).toEqual(expectedUser);
      expect(mockUserRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          firstName: createUserDto.firstName,
          lastName: createUserDto.lastName,
          email: createUserDto.email,
          username: createUserDto.username,
          passwordHash: createUserDto.passwordHash,
          passwordSalt: createUserDto.passwordSalt,
        }),
      );
      // Check sub is set to mocked UUID
      const savedUser = mockUserRepository.save.mock.calls[0][0] as User;
      expect(savedUser.sub).toBe('mocked-uuid-value');
    });
  });
});
