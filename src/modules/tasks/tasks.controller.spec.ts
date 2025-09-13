import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import type { Task } from './entities/task.entity';
import type { CreateTaskDto } from './dto/create-task.dto';
import type { UpdateTaskDto } from './dto/update-task.dto';
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
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
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

  describe('create', () => {
    it('should create a task with all fields provided', async () => {
      // Arrange
      const createTaskDto: CreateTaskDto = {
        summary: 'New test task',
        description: 'Detailed description',
        dueAt: '2025-09-15T10:00:00.000Z',
        isComplete: false,
      };

      const expectedTask: Task = {
        id: '550e8400-e29b-41d4-a716-446655440003',
        summary: 'New test task',
        description: 'Detailed description',
        dueAt: new Date('2025-09-15T10:00:00.000Z'),
        isComplete: false,
        createdAt: new Date('2025-09-12T08:00:00.000Z'),
        updatedAt: new Date('2025-09-12T08:00:00.000Z'),
      };

      mockTasksService.create.mockResolvedValue(expectedTask);

      // Act
      const result = await controller.create(createTaskDto);

      // Assert
      expect(mockTasksService.create).toHaveBeenCalledWith(createTaskDto);
      expect(result).toEqual(expectedTask);
    });

    it('should create a task with only required fields', async () => {
      // Arrange
      const createTaskDto: CreateTaskDto = {
        summary: 'Minimal test task',
      };

      const expectedTask: Task = {
        id: '550e8400-e29b-41d4-a716-446655440004',
        summary: 'Minimal test task',
        description: undefined,
        dueAt: undefined,
        isComplete: false,
        createdAt: new Date('2025-09-12T08:00:00.000Z'),
        updatedAt: new Date('2025-09-12T08:00:00.000Z'),
      };

      mockTasksService.create.mockResolvedValue(expectedTask);

      // Act
      const result = await controller.create(createTaskDto);

      // Assert
      expect(mockTasksService.create).toHaveBeenCalledWith(createTaskDto);
      expect(result).toEqual(expectedTask);
    });

    it('should create a task with isComplete defaulting to false when not provided', async () => {
      // Arrange
      const createTaskDto: CreateTaskDto = {
        summary: 'Task without isComplete',
        description: 'Some description',
      };

      const expectedTask: Task = {
        id: '550e8400-e29b-41d4-a716-446655440005',
        summary: 'Task without isComplete',
        description: 'Some description',
        dueAt: undefined,
        isComplete: false,
        createdAt: new Date('2025-09-12T08:00:00.000Z'),
        updatedAt: new Date('2025-09-12T08:00:00.000Z'),
      };

      mockTasksService.create.mockResolvedValue(expectedTask);

      // Act
      const result = await controller.create(createTaskDto);

      // Assert
      expect(mockTasksService.create).toHaveBeenCalledWith(createTaskDto);
      expect(result).toEqual(expectedTask);
    });

    it('should handle service errors gracefully', async () => {
      // Arrange
      const createTaskDto: CreateTaskDto = {
        summary: 'Task that will fail',
      };

      const serviceError = new Error('Database connection failed');
      mockTasksService.create.mockRejectedValue(serviceError);

      // Act & Assert
      await expect(controller.create(createTaskDto)).rejects.toThrow('Database connection failed');
      expect(mockTasksService.create).toHaveBeenCalledWith(createTaskDto);
    });
  });

  describe('update', () => {
    it('should update a task successfully', async () => {
      // Arrange
      const taskId = '550e8400-e29b-41d4-a716-446655440001';
      const updateTaskDto: UpdateTaskDto = {
        id: taskId,
        summary: 'Updated task summary',
        description: 'Updated description',
        isComplete: true,
      };

      const params = { taskId };
      const expectedTask: Task = {
        id: taskId,
        summary: updateTaskDto.summary!,
        description: updateTaskDto.description,
        dueAt: undefined,
        isComplete: updateTaskDto.isComplete!,
        createdAt: new Date('2025-09-01T08:00:00.000Z'),
        updatedAt: new Date('2025-09-13T10:00:00.000Z'),
      };

      mockTasksService.update.mockResolvedValue(expectedTask);

      // Act
      const result = await controller.update(params, updateTaskDto);

      // Assert
      expect(mockTasksService.update).toHaveBeenCalledWith(taskId, updateTaskDto);
      expect(result).toEqual(expectedTask);
    });

    it('should handle partial updates correctly', async () => {
      // Arrange
      const taskId = '550e8400-e29b-41d4-a716-446655440001';
      const updateTaskDto: UpdateTaskDto = {
        id: taskId,
        summary: 'Only summary updated',
      };

      const params = { taskId };
      const expectedTask: Task = {
        id: taskId,
        summary: updateTaskDto.summary!,
        description: 'Original description',
        dueAt: undefined,
        isComplete: false,
        createdAt: new Date('2025-09-01T08:00:00.000Z'),
        updatedAt: new Date('2025-09-13T10:00:00.000Z'),
      };

      mockTasksService.update.mockResolvedValue(expectedTask);

      // Act
      const result = await controller.update(params, updateTaskDto);

      // Assert
      expect(mockTasksService.update).toHaveBeenCalledWith(taskId, updateTaskDto);
      expect(result).toEqual(expectedTask);
    });

    it('should handle task not found error', async () => {
      // Arrange
      const taskId = 'non-existent-id';
      const updateTaskDto: UpdateTaskDto = {
        id: taskId,
        summary: 'Updated summary',
      };

      const params = { taskId };
      const notFoundError = new NotFoundException(`Task with ID ${taskId} not found`);
      mockTasksService.update.mockRejectedValue(notFoundError);

      // Act & Assert
      await expect(controller.update(params, updateTaskDto)).rejects.toThrow(NotFoundException);
      expect(mockTasksService.update).toHaveBeenCalledWith(taskId, updateTaskDto);
    });

    it('should handle service errors gracefully', async () => {
      // Arrange
      const taskId = '550e8400-e29b-41d4-a716-446655440001';
      const updateTaskDto: UpdateTaskDto = {
        id: taskId,
        summary: 'Task that will fail to update',
      };

      const params = { taskId };
      const serviceError = new Error('Database connection failed');
      mockTasksService.update.mockRejectedValue(serviceError);

      // Act & Assert
      await expect(controller.update(params, updateTaskDto)).rejects.toThrow('Database connection failed');
      expect(mockTasksService.update).toHaveBeenCalledWith(taskId, updateTaskDto);
    });
  });

  describe('remove', () => {
    it('should remove a task successfully when valid params are provided', async () => {
      // Arrange
      const taskId = '550e8400-e29b-41d4-a716-446655440001';
      const params = { taskId };
      mockTasksService.remove.mockResolvedValue(undefined);

      // Act
      const result = await controller.remove(params);

      // Assert
      expect(mockTasksService.remove).toHaveBeenCalledWith(taskId);
      expect(result).toBeUndefined();
    });

    it('should throw NotFoundException when task to remove is not found', async () => {
      // Arrange
      const taskId = '00000000-0000-0000-0000-000000000000';
      const params = { taskId };
      const notFoundError = new NotFoundException(`Task with ID ${taskId} not found`);
      mockTasksService.remove.mockRejectedValue(notFoundError);

      // Act & Assert
      await expect(controller.remove(params)).rejects.toThrow(NotFoundException);
      expect(mockTasksService.remove).toHaveBeenCalledWith(taskId);
    });

    it('should handle service errors gracefully', async () => {
      // Arrange
      const taskId = '550e8400-e29b-41d4-a716-446655440001';
      const params = { taskId };
      const serviceError = new Error('Database connection failed');
      mockTasksService.remove.mockRejectedValue(serviceError);

      // Act & Assert
      await expect(controller.remove(params)).rejects.toThrow('Database connection failed');
      expect(mockTasksService.remove).toHaveBeenCalledWith(taskId);
    });
  });
});
