import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import type { Task } from './entities/task.entity';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';

describe('TasksController', () => {
  let controller: TasksController;

  const mockTasks: Task[] = [
    {
      id: '550e8400-e29b-41d4-a716-446655440001',
      summary: 'Test task 1',
      description: 'Test description 1',
      dueAt: new Date('2025-09-15T10:00:00.000Z'),
      isComplete: false,
      createdAt: new Date('2025-09-01T08:00:00.000Z'),
      updatedAt: new Date('2025-09-02T09:30:00.000Z'),
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440002',
      summary: 'Test task 2',
      description: undefined,
      dueAt: undefined,
      isComplete: true,
      createdAt: new Date('2025-09-02T08:00:00.000Z'),
      updatedAt: new Date('2025-09-02T08:00:00.000Z'),
    },
  ];

  const mockTasksService = {
    findAll: jest.fn().mockResolvedValue(mockTasks),
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TasksController],
      providers: [
        {
          provide: TasksService,
          useValue: mockTasksService,
        },
      ],
    }).compile();

    controller = module.get<TasksController>(TasksController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    // Arrange
    // Setup completed in beforeEach

    // Act
    // No action needed for existence check

    // Assert
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of tasks', async () => {
      // Arrange
      // Mock setup completed in beforeEach

      // Act
      const result = await controller.findAll();

      // Assert
      expect(mockTasksService.findAll).toHaveBeenCalled();
      expect(result).toEqual(mockTasks);
    });

    it('should return empty array when no tasks exist', async () => {
      // Arrange
      mockTasksService.findAll.mockResolvedValueOnce([]);

      // Act
      const result = await controller.findAll();

      // Assert
      expect(mockTasksService.findAll).toHaveBeenCalled();
      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return a task when valid params are provided', async () => {
      // Arrange
      const taskId = '550e8400-e29b-41d4-a716-446655440001';
      const expectedTask = mockTasks[0];
      mockTasksService.findOne.mockResolvedValue(expectedTask);

      // Act
      const result = await controller.findOne({ taskId });

      // Assert
      expect(mockTasksService.findOne).toHaveBeenCalledWith(taskId);
      expect(result).toEqual(expectedTask);
    });

    it('should throw NotFoundException when task is not found', async () => {
      // Arrange
      const taskId = '00000000-0000-0000-0000-000000000000';
      const notFoundError = new NotFoundException(`Task with ID ${taskId} not found`);
      mockTasksService.findOne.mockRejectedValue(notFoundError);

      // Act & Assert
      await expect(controller.findOne({ taskId })).rejects.toThrow(NotFoundException);
      expect(mockTasksService.findOne).toHaveBeenCalledWith(taskId);
    });
  });
});
