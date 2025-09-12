import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { TasksService } from './tasks.service';
import { Task } from './entities/task.entity';

describe('TasksService', () => {
  let service: TasksService;

  const mockTasks = [
    {
      id: '550e8400-e29b-41d4-a716-446655440001',
      summary: 'Complete project documentation',
      description: 'Write comprehensive documentation for the NestJS playground project',
      dueAt: new Date('2025-09-15T10:00:00.000Z'),
      isComplete: false,
      createdAt: new Date('2025-09-01T08:00:00.000Z'),
      updatedAt: new Date('2025-09-02T09:30:00.000Z'),
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440002',
      summary: 'Review code quality',
      description: 'Perform code review and ensure adherence to coding standards',
      dueAt: null,
      isComplete: true,
      createdAt: new Date('2025-08-28T14:00:00.000Z'),
      updatedAt: new Date('2025-09-01T16:45:00.000Z'),
    },
  ];

  const mockRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        {
          provide: getRepositoryToken(Task),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<TasksService>(TasksService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of tasks', async () => {
      // Arrange
      mockRepository.find.mockResolvedValue(mockTasks);

      // Act
      const result = await service.findAll();

      // Assert
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      expect(mockRepository.find).toHaveBeenCalled();
    });

    it('should return tasks with correct structure', async () => {
      // Arrange
      mockRepository.find.mockResolvedValue(mockTasks);

      // Act
      const result = await service.findAll();
      const task = result[0];

      // Assert
      expect(task).toHaveProperty('id');
      expect(task).toHaveProperty('summary');
      expect(task).toHaveProperty('isComplete');
      expect(task).toHaveProperty('createdAt');
      expect(typeof task.id).toBe('string');
      expect(typeof task.summary).toBe('string');
      expect(typeof task.isComplete).toBe('boolean');
    });
  });

  describe('findOne', () => {
    it('should return a task when valid ID is provided', async () => {
      // Arrange
      const existingTask = mockTasks[0];
      mockRepository.findOne.mockResolvedValue(existingTask);

      // Act
      const result = await service.findOne(existingTask.id);

      // Assert
      expect(result).toEqual(existingTask);
      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id: existingTask.id } });
    });

    it('should throw NotFoundException when task is not found', async () => {
      // Arrange
      const nonExistentId = '00000000-0000-0000-0000-000000000000';
      mockRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.findOne(nonExistentId)).rejects.toThrow(NotFoundException);
      await expect(service.findOne(nonExistentId)).rejects.toThrow(`Task with ID ${nonExistentId} not found`);
    });

    it('should return task with all required properties', async () => {
      // Arrange
      const existingTask = mockTasks[0];
      const taskId = existingTask.id;
      mockRepository.findOne.mockResolvedValue(existingTask);

      // Act
      const result = await service.findOne(taskId);

      // Assert
      expect(result).toHaveProperty('id', taskId);
      expect(result).toHaveProperty('summary');
      expect(result).toHaveProperty('isComplete');
      expect(result).toHaveProperty('createdAt');
    });
  });
});
