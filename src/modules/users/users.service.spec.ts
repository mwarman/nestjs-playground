import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { UsersService } from './users.service';
import { User } from './entities/user.entity';

describe('UsersService', () => {
  let service: UsersService;

  const mockUserRepository = {
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
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      const userId = 'test-id';

      // Act
      const result = await service.findOne(userId);

      // Assert
      expect(result).toEqual(mockUser);
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { id: userId },
      });
    });

    it('should return null when user not found', async () => {
      // Arrange
      mockUserRepository.findOne.mockResolvedValue(null);
      const userId = 'non-existent-id';

      // Act
      const result = await service.findOne(userId);

      // Assert
      expect(result).toBeNull();
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { id: userId },
      });
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
});
