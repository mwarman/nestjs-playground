import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { TaskPriorityService } from './task-priority.service';
import { TaskPriority } from './entities/task-priority.entity';

describe('TaskPriorityService', () => {
  let service: TaskPriorityService;

  const mockTaskPriorities = [
    {
      code: 'HIGH',
      label: 'High Priority',
      description: 'Tasks that require immediate attention and should be completed first',
      ordinal: 1,
    },
    {
      code: 'MEDIUM',
      label: 'Medium Priority',
      description: 'Tasks with moderate importance that should be completed after high priority items',
      ordinal: 2,
    },
    {
      code: 'LOW',
      label: 'Low Priority',
      description: 'Tasks that can be completed when time permits',
      ordinal: 3,
    },
  ];

  const mockRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TaskPriorityService,
        {
          provide: getRepositoryToken(TaskPriority),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<TaskPriorityService>(TaskPriorityService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of task priorities', async () => {
      // Arrange
      mockRepository.find.mockResolvedValue(mockTaskPriorities);

      // Act
      const result = await service.findAll();

      // Assert
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(3);
      expect(mockRepository.find).toHaveBeenCalledWith({
        order: { ordinal: 'ASC', code: 'ASC' },
      });
    });

    it('should return task priorities with correct structure', async () => {
      // Arrange
      mockRepository.find.mockResolvedValue(mockTaskPriorities);

      // Act
      const result = await service.findAll();
      const taskPriority = result[0];

      // Assert
      expect(taskPriority).toHaveProperty('code');
      expect(taskPriority).toHaveProperty('label');
      expect(taskPriority).toHaveProperty('description');
      expect(taskPriority).toHaveProperty('ordinal');
      expect(typeof taskPriority.code).toBe('string');
      expect(typeof taskPriority.label).toBe('string');
      expect(typeof taskPriority.description).toBe('string');
      expect(typeof taskPriority.ordinal).toBe('number');
    });

    it('should return empty array when no task priorities exist', async () => {
      // Arrange
      mockRepository.find.mockResolvedValue([]);

      // Act
      const result = await service.findAll();

      // Assert
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(0);
      expect(mockRepository.find).toHaveBeenCalledWith({
        order: { ordinal: 'ASC', code: 'ASC' },
      });
    });

    it('should sort task priorities by ordinal ascending then by code ascending', async () => {
      // Arrange
      const unsortedTaskPriorities = [
        { code: 'LOW', label: 'Low Priority', description: 'Low priority tasks', ordinal: 3 },
        { code: 'HIGH', label: 'High Priority', description: 'High priority tasks', ordinal: 1 },
        { code: 'MEDIUM', label: 'Medium Priority', description: 'Medium priority tasks', ordinal: 2 },
      ];
      mockRepository.find.mockResolvedValue(unsortedTaskPriorities);

      // Act
      const result = await service.findAll();

      // Assert
      expect(mockRepository.find).toHaveBeenCalledWith({
        order: { ordinal: 'ASC', code: 'ASC' },
      });
      expect(result).toBe(unsortedTaskPriorities); // The repository handles the sorting
    });
  });

  describe('findOne', () => {
    it('should return a task priority when found', async () => {
      // Arrange
      const expectedTaskPriority = mockTaskPriorities[0];
      mockRepository.findOne.mockResolvedValue(expectedTaskPriority);

      // Act
      const result = await service.findOne('HIGH');

      // Assert
      expect(result).toEqual(expectedTaskPriority);
      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { code: 'HIGH' } });
    });

    it('should throw NotFoundException when task priority is not found', async () => {
      // Arrange
      mockRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.findOne('INVALID')).rejects.toThrow(NotFoundException);
      await expect(service.findOne('INVALID')).rejects.toThrow('TaskPriority with code INVALID not found');
      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { code: 'INVALID' } });
    });

    it('should find task priority by exact code match', async () => {
      // Arrange
      const expectedTaskPriority = mockTaskPriorities[1];
      mockRepository.findOne.mockResolvedValue(expectedTaskPriority);

      // Act
      const result = await service.findOne('MEDIUM');

      // Assert
      expect(result).toEqual(expectedTaskPriority);
      expect(result.code).toBe('MEDIUM');
      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { code: 'MEDIUM' } });
    });

    it('should handle case-sensitive code lookup', async () => {
      // Arrange
      mockRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.findOne('high')).rejects.toThrow(NotFoundException);
      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { code: 'high' } });
    });
  });
});
