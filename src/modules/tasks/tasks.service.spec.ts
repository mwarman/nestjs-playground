import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { TasksService } from './tasks.service';
import { Task } from './entities/task.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TaskPriorityService } from '../reference-data/task-priority.service';

describe('TasksService', () => {
  let service: TasksService;

  const mockTasks = [
    {
      id: '550e8400-e29b-41d4-a716-446655440001',
      summary: 'Complete project documentation',
      description: 'Write comprehensive documentation for the NestJS playground project',
      dueAt: new Date('2025-09-15T10:00:00.000Z'),
      isComplete: false,
      userId: 'user-123',
      taskPriorityCode: 'HIGH',
      createdAt: new Date('2025-09-01T08:00:00.000Z'),
      updatedAt: new Date('2025-09-02T09:30:00.000Z'),
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440002',
      summary: 'Review code quality',
      description: 'Perform code review and ensure adherence to coding standards',
      dueAt: null,
      isComplete: true,
      userId: 'user-123',
      taskPriorityCode: 'MEDIUM',
      createdAt: new Date('2025-08-28T14:00:00.000Z'),
      updatedAt: new Date('2025-09-01T16:45:00.000Z'),
    },
  ];

  const mockQueryBuilder = {
    delete: jest.fn().mockReturnThis(),
    from: jest.fn().mockReturnThis(),
    execute: jest.fn(),
  };

  const mockRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    delete: jest.fn(),
    createQueryBuilder: jest.fn(() => mockQueryBuilder),
  };

  const mockTaskPriorityService = {
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
        {
          provide: TaskPriorityService,
          useValue: mockTaskPriorityService,
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
    const userId = 'user-123';

    it('should return an array of tasks for a specific user', async () => {
      // Arrange
      mockRepository.find.mockResolvedValue(mockTasks);

      // Act
      const result = await service.findAll(userId);

      // Assert
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      expect(mockRepository.find).toHaveBeenCalledWith({ where: { userId } });
    });

    it('should return tasks with correct structure', async () => {
      // Arrange
      mockRepository.find.mockResolvedValue(mockTasks);

      // Act
      const result = await service.findAll(userId);
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
    const userId = 'user-123';

    it('should return a task when valid ID is provided', async () => {
      // Arrange
      const existingTask = mockTasks[0];
      mockRepository.findOne.mockResolvedValue(existingTask);

      // Act
      const result = await service.findOne(existingTask.id, userId);

      // Assert
      expect(result).toEqual(existingTask);
      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id: existingTask.id, userId } });
    });

    it('should throw NotFoundException when task is not found', async () => {
      // Arrange
      const nonExistentId = '00000000-0000-0000-0000-000000000000';
      mockRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.findOne(nonExistentId, userId)).rejects.toThrow(NotFoundException);
      await expect(service.findOne(nonExistentId, userId)).rejects.toThrow(`Task with ID ${nonExistentId} not found`);
    });

    it('should return task with all required properties', async () => {
      // Arrange
      const existingTask = mockTasks[0];
      const taskId = existingTask.id;
      mockRepository.findOne.mockResolvedValue(existingTask);

      // Act
      const result = await service.findOne(taskId, userId);

      // Assert
      expect(result).toHaveProperty('id', taskId);
      expect(result).toHaveProperty('summary');
      expect(result).toHaveProperty('isComplete');
      expect(result).toHaveProperty('createdAt');
    });
  });

  describe('create', () => {
    const userId = 'user-123';

    it('should create and return a new task with all fields', async () => {
      // Arrange
      const createTaskDto: CreateTaskDto = {
        summary: 'New test task',
        description: 'Test description',
        dueAt: '2025-09-15T10:00:00.000Z',
        isComplete: false,
        taskPriorityCode: 'HIGH',
      };

      const createdTask = {
        id: '550e8400-e29b-41d4-a716-446655440003',
        summary: createTaskDto.summary,
        description: createTaskDto.description,
        dueAt: new Date(createTaskDto.dueAt!),
        isComplete: createTaskDto.isComplete,
        taskPriorityCode: createTaskDto.taskPriorityCode,
        userId,
        createdAt: new Date('2025-09-12T08:00:00.000Z'),
        updatedAt: new Date('2025-09-12T08:00:00.000Z'),
      };

      const savedTask = { ...createdTask };

      mockRepository.create.mockReturnValue(createdTask);
      mockRepository.save.mockResolvedValue(savedTask);
      mockTaskPriorityService.findOne.mockResolvedValue({ code: 'HIGH', label: 'High Priority' });

      // Act
      const result = await service.create(createTaskDto, userId);

      // Assert
      expect(mockTaskPriorityService.findOne).toHaveBeenCalledWith('HIGH');
      expect(mockRepository.create).toHaveBeenCalledWith({ ...createTaskDto, userId });
      expect(mockRepository.save).toHaveBeenCalledWith(createdTask);
      expect(result).toEqual(savedTask);
    });

    it('should create a task with minimal required fields', async () => {
      // Arrange
      const createTaskDto: CreateTaskDto = {
        summary: 'Minimal task',
        taskPriorityCode: 'MEDIUM',
      };

      const createdTask = {
        id: '550e8400-e29b-41d4-a716-446655440004',
        summary: createTaskDto.summary,
        description: undefined,
        dueAt: undefined,
        isComplete: false,
        taskPriorityCode: createTaskDto.taskPriorityCode,
        userId,
        createdAt: new Date('2025-09-12T08:00:00.000Z'),
        updatedAt: new Date('2025-09-12T08:00:00.000Z'),
      };

      const savedTask = { ...createdTask };

      mockRepository.create.mockReturnValue(createdTask);
      mockRepository.save.mockResolvedValue(savedTask);
      mockTaskPriorityService.findOne.mockResolvedValue({ code: 'MEDIUM', label: 'Medium Priority' });

      // Act
      const result = await service.create(createTaskDto, userId);

      // Assert
      expect(mockTaskPriorityService.findOne).toHaveBeenCalledWith('MEDIUM');
      expect(mockRepository.create).toHaveBeenCalledWith({ ...createTaskDto, userId });
      expect(mockRepository.save).toHaveBeenCalledWith(createdTask);
      expect(result).toEqual(savedTask);
    });

    it('should handle repository save errors', async () => {
      // Arrange
      const createTaskDto: CreateTaskDto = {
        summary: 'Task that will fail to save',
        taskPriorityCode: 'LOW',
      };

      const createdTask = {
        summary: createTaskDto.summary,
        id: '550e8400-e29b-41d4-a716-446655440005',
        taskPriorityCode: createTaskDto.taskPriorityCode,
        userId,
      };

      const saveError = new Error('Database save failed');

      mockRepository.create.mockReturnValue(createdTask);
      mockRepository.save.mockRejectedValue(saveError);
      mockTaskPriorityService.findOne.mockResolvedValue({ code: 'LOW', label: 'Low Priority' });

      // Act & Assert
      await expect(service.create(createTaskDto, userId)).rejects.toThrow('Database save failed');
      expect(mockTaskPriorityService.findOne).toHaveBeenCalledWith('LOW');
      expect(mockRepository.create).toHaveBeenCalledWith({ ...createTaskDto, userId });
      expect(mockRepository.save).toHaveBeenCalledWith(createdTask);
    });

    it('should create task with default isComplete value when not provided', async () => {
      // Arrange
      const createTaskDto: CreateTaskDto = {
        summary: 'Task without isComplete',
        description: 'Some description',
        taskPriorityCode: 'MEDIUM',
      };

      const createdTask = {
        id: '550e8400-e29b-41d4-a716-446655440006',
        summary: createTaskDto.summary,
        description: createTaskDto.description,
        isComplete: false,
        taskPriorityCode: createTaskDto.taskPriorityCode,
        userId,
        createdAt: new Date('2025-09-12T08:00:00.000Z'),
        updatedAt: new Date('2025-09-12T08:00:00.000Z'),
      };

      const savedTask = { ...createdTask };

      mockRepository.create.mockReturnValue(createdTask);
      mockRepository.save.mockResolvedValue(savedTask);
      mockTaskPriorityService.findOne.mockResolvedValue({ code: 'MEDIUM', label: 'Medium Priority' });

      // Act
      const result = await service.create(createTaskDto, userId);

      // Assert
      expect(result.isComplete).toBe(false);
      expect(mockTaskPriorityService.findOne).toHaveBeenCalledWith('MEDIUM');
      expect(mockRepository.create).toHaveBeenCalledWith({ ...createTaskDto, userId });
      expect(mockRepository.save).toHaveBeenCalledWith(createdTask);
    });

    it('should throw BadRequestException when taskPriorityCode is invalid', async () => {
      // Arrange
      const createTaskDto: CreateTaskDto = {
        summary: 'Task with invalid priority',
        taskPriorityCode: 'INVALID_PRIORITY',
      };
      const userId = 'user-123';

      mockTaskPriorityService.findOne.mockRejectedValue(new NotFoundException('TaskPriority not found'));

      // Act & Assert
      await expect(service.create(createTaskDto, userId)).rejects.toThrow(BadRequestException);
      await expect(service.create(createTaskDto, userId)).rejects.toThrow(
        'Invalid task priority code: INVALID_PRIORITY',
      );
      expect(mockTaskPriorityService.findOne).toHaveBeenCalledWith('INVALID_PRIORITY');
      expect(mockRepository.create).not.toHaveBeenCalled();
      expect(mockRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('update', () => {
    const userId = 'user-123';

    it('should update a task successfully with all fields', async () => {
      // Arrange
      const taskId = '550e8400-e29b-41d4-a716-446655440001';
      const existingTask = mockTasks[0];
      const updateTaskDto: UpdateTaskDto = {
        id: taskId,
        summary: 'Updated task summary',
        description: 'Updated description',
        dueAt: '2025-09-20T10:00:00.000Z',
        isComplete: true,
        taskPriorityCode: 'LOW',
      };

      const updatedTask = {
        ...existingTask,
        summary: updateTaskDto.summary!,
        description: updateTaskDto.description,
        dueAt: new Date(updateTaskDto.dueAt!),
        isComplete: updateTaskDto.isComplete!,
        taskPriorityCode: updateTaskDto.taskPriorityCode!,
      };

      mockRepository.findOne.mockResolvedValueOnce(existingTask); // First call to verify task exists
      mockRepository.update.mockResolvedValue({ affected: 1 });
      mockRepository.findOne.mockResolvedValueOnce(updatedTask); // Second call to return updated task
      mockTaskPriorityService.findOne.mockResolvedValue({ code: 'LOW', label: 'Low Priority' });

      // Act
      const result = await service.update(taskId, updateTaskDto, userId);

      // Assert
      expect(mockRepository.findOne).toHaveBeenCalledTimes(2);
      expect(mockRepository.findOne).toHaveBeenNthCalledWith(1, { where: { id: taskId, userId } });
      expect(mockTaskPriorityService.findOne).toHaveBeenCalledWith('LOW');
      expect(mockRepository.update).toHaveBeenCalledWith(
        { id: taskId, userId },
        {
          summary: updateTaskDto.summary,
          description: updateTaskDto.description,
          dueAt: new Date(updateTaskDto.dueAt!),
          isComplete: updateTaskDto.isComplete,
          taskPriorityCode: updateTaskDto.taskPriorityCode,
        },
      );
      expect(mockRepository.findOne).toHaveBeenNthCalledWith(2, { where: { id: taskId, userId } });
      expect(result).toEqual(updatedTask);
    });

    it('should update a task with partial data', async () => {
      // Arrange
      const taskId = '550e8400-e29b-41d4-a716-446655440001';
      const existingTask = mockTasks[0];
      const updateTaskDto: UpdateTaskDto = {
        id: taskId,
        summary: 'Updated summary only',
      };

      const updatedTask = {
        ...existingTask,
        summary: updateTaskDto.summary!,
      };

      mockRepository.findOne.mockResolvedValueOnce(existingTask);
      mockRepository.update.mockResolvedValue({ affected: 1 });
      mockRepository.findOne.mockResolvedValueOnce(updatedTask);

      // Act
      const result = await service.update(taskId, updateTaskDto, userId);

      // Assert
      expect(mockRepository.findOne).toHaveBeenCalledTimes(2);
      expect(mockRepository.update).toHaveBeenCalledWith(
        { id: taskId, userId },
        {
          summary: updateTaskDto.summary,
        },
      );
      expect(result.summary).toBe(updateTaskDto.summary);
      expect(result.description).toBe(existingTask.description); // Should remain unchanged
    });

    it('should convert dueAt string to Date when provided', async () => {
      // Arrange
      const taskId = '550e8400-e29b-41d4-a716-446655440001';
      const existingTask = mockTasks[0];
      const updateTaskDto: UpdateTaskDto = {
        id: taskId,
        dueAt: '2025-12-25T00:00:00.000Z',
      };

      const updatedTask = {
        ...existingTask,
        dueAt: new Date(updateTaskDto.dueAt!),
      };

      mockRepository.findOne.mockResolvedValueOnce(existingTask);
      mockRepository.update.mockResolvedValue({ affected: 1 });
      mockRepository.findOne.mockResolvedValueOnce(updatedTask);

      // Act
      const result = await service.update(taskId, updateTaskDto, userId);

      // Assert
      expect(mockRepository.update).toHaveBeenCalledWith(
        { id: taskId, userId },
        {
          dueAt: new Date(updateTaskDto.dueAt!),
        },
      );
      expect(result.dueAt).toBeInstanceOf(Date);
      expect(result.dueAt).toEqual(new Date(updateTaskDto.dueAt!));
    });

    it('should not update dueAt when not provided', async () => {
      // Arrange
      const taskId = '550e8400-e29b-41d4-a716-446655440001';
      const existingTask = mockTasks[0];
      const updateTaskDto: UpdateTaskDto = {
        id: taskId,
        summary: 'Updated summary',
      };

      const updatedTask = {
        ...existingTask,
        summary: updateTaskDto.summary!,
      };

      mockRepository.findOne.mockResolvedValue(existingTask);
      mockRepository.update.mockResolvedValue({ affected: 1, generatedMaps: [], raw: [] });
      mockRepository.findOne
        .mockResolvedValueOnce(existingTask) // First call to check existence
        .mockResolvedValueOnce(updatedTask); // Second call to return updated task

      // Act
      const result = await service.update(taskId, updateTaskDto, userId);

      // Assert
      expect(result.dueAt).toBe(existingTask.dueAt); // Should remain unchanged
    });

    it('should throw NotFoundException when task does not exist', async () => {
      // Arrange
      const nonExistentId = 'non-existent-id';
      const updateTaskDto: UpdateTaskDto = {
        id: nonExistentId,
        summary: 'Updated summary',
      };

      mockRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.update(nonExistentId, updateTaskDto, userId)).rejects.toThrow(NotFoundException);
      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id: nonExistentId, userId } });
      expect(mockRepository.update).not.toHaveBeenCalled();
    });

    it('should handle repository update errors', async () => {
      // Arrange
      const taskId = '550e8400-e29b-41d4-a716-446655440001';
      const existingTask = mockTasks[0];
      const updateTaskDto: UpdateTaskDto = {
        id: taskId,
        summary: 'Updated summary',
      };

      const updateError = new Error('Database update failed');

      mockRepository.findOne.mockResolvedValue(existingTask);
      mockRepository.update.mockRejectedValue(updateError);

      // Act & Assert
      await expect(service.update(taskId, updateTaskDto, userId)).rejects.toThrow('Database update failed');
      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id: taskId, userId } });
      expect(mockRepository.update).toHaveBeenCalled();
    });

    it('should throw BadRequestException when updating with invalid taskPriorityCode', async () => {
      // Arrange
      const taskId = '550e8400-e29b-41d4-a716-446655440001';
      const existingTask = mockTasks[0];
      const updateTaskDto: UpdateTaskDto = {
        id: taskId,
        summary: 'Updated task summary',
        taskPriorityCode: 'INVALID_PRIORITY',
      };

      mockRepository.findOne.mockResolvedValue(existingTask);
      mockTaskPriorityService.findOne.mockRejectedValue(new NotFoundException('TaskPriority not found'));

      // Act & Assert
      await expect(service.update(taskId, updateTaskDto, userId)).rejects.toThrow(BadRequestException);
      await expect(service.update(taskId, updateTaskDto, userId)).rejects.toThrow(
        'Invalid task priority code: INVALID_PRIORITY',
      );
      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id: taskId, userId } });
      expect(mockTaskPriorityService.findOne).toHaveBeenCalledWith('INVALID_PRIORITY');
      expect(mockRepository.update).not.toHaveBeenCalled();
    });

    it('should update task without validating priority when taskPriorityCode is not provided', async () => {
      // Arrange
      const taskId = '550e8400-e29b-41d4-a716-446655440001';
      const existingTask = mockTasks[0];
      const updateTaskDto: UpdateTaskDto = {
        id: taskId,
        summary: 'Updated task summary without priority',
      };

      const updatedTask = {
        ...existingTask,
        summary: updateTaskDto.summary!,
      };

      mockRepository.findOne.mockResolvedValueOnce(existingTask);
      mockRepository.update.mockResolvedValue({ affected: 1 });
      mockRepository.findOne.mockResolvedValueOnce(updatedTask);

      // Act
      const result = await service.update(taskId, updateTaskDto, userId);

      // Assert
      expect(mockTaskPriorityService.findOne).not.toHaveBeenCalled();
      expect(mockRepository.update).toHaveBeenCalledWith(
        { id: taskId, userId },
        {
          summary: updateTaskDto.summary,
        },
      );
      expect(result).toEqual(updatedTask);
    });
  });

  describe('remove', () => {
    const userId = 'user-123';

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should remove a task successfully when task exists', async () => {
      // Arrange
      const taskId = '550e8400-e29b-41d4-a716-446655440001';
      const existingTask = mockTasks[0];
      mockRepository.findOne.mockResolvedValue(existingTask);
      mockRepository.remove.mockResolvedValue(existingTask);

      // Act
      const result = await service.remove(taskId, userId);

      // Assert
      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id: taskId, userId } });
      expect(mockRepository.remove).toHaveBeenCalledWith(existingTask);
      expect(result).toBeUndefined();
    });

    it('should throw NotFoundException when task to remove does not exist', async () => {
      // Arrange
      const taskId = '00000000-0000-0000-0000-000000000000';
      mockRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.remove(taskId, userId)).rejects.toThrow(NotFoundException);
      await expect(service.remove(taskId, userId)).rejects.toThrow(`Task with ID ${taskId} not found`);
      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id: taskId, userId } });
      expect(mockRepository.remove).not.toHaveBeenCalled();
    });

    it('should handle database errors during task removal', async () => {
      // Arrange
      const taskId = '550e8400-e29b-41d4-a716-446655440001';
      const existingTask = mockTasks[0];
      const removeError = new Error('Database removal failed');
      mockRepository.findOne.mockResolvedValue(existingTask);
      mockRepository.remove.mockRejectedValue(removeError);

      // Act & Assert
      await expect(service.remove(taskId, userId)).rejects.toThrow('Database removal failed');
      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id: taskId, userId } });
      expect(mockRepository.remove).toHaveBeenCalledWith(existingTask);
    });
  });

  describe('removeAll', () => {
    it('should successfully remove all tasks and return the count', async () => {
      // Arrange
      const expectedDeletedCount = 5;
      mockQueryBuilder.execute.mockResolvedValue({ affected: expectedDeletedCount });

      // Act
      const result = await service.removeAll();

      // Assert
      expect(result).toBe(expectedDeletedCount);
      expect(mockRepository.createQueryBuilder).toHaveBeenCalledWith();
      expect(mockQueryBuilder.delete).toHaveBeenCalledWith();
      expect(mockQueryBuilder.from).toHaveBeenCalledWith(Task);
      expect(mockQueryBuilder.execute).toHaveBeenCalledWith();
    });

    it('should return 0 when no tasks are deleted', async () => {
      // Arrange
      mockQueryBuilder.execute.mockResolvedValue({ affected: 0 });

      // Act
      const result = await service.removeAll();

      // Assert
      expect(result).toBe(0);
      expect(mockRepository.createQueryBuilder).toHaveBeenCalledWith();
      expect(mockQueryBuilder.delete).toHaveBeenCalledWith();
      expect(mockQueryBuilder.from).toHaveBeenCalledWith(Task);
      expect(mockQueryBuilder.execute).toHaveBeenCalledWith();
    });

    it('should handle undefined affected count and return 0', async () => {
      // Arrange
      mockQueryBuilder.execute.mockResolvedValue({ affected: undefined });

      // Act
      const result = await service.removeAll();

      // Assert
      expect(result).toBe(0);
      expect(mockRepository.createQueryBuilder).toHaveBeenCalledWith();
      expect(mockQueryBuilder.delete).toHaveBeenCalledWith();
      expect(mockQueryBuilder.from).toHaveBeenCalledWith(Task);
      expect(mockQueryBuilder.execute).toHaveBeenCalledWith();
    });

    it('should handle database errors during bulk removal', async () => {
      // Arrange
      const deleteError = new Error('Database deletion failed');
      mockQueryBuilder.execute.mockRejectedValue(deleteError);

      // Act & Assert
      await expect(service.removeAll()).rejects.toThrow('Database deletion failed');
      expect(mockRepository.createQueryBuilder).toHaveBeenCalledWith();
      expect(mockQueryBuilder.delete).toHaveBeenCalledWith();
      expect(mockQueryBuilder.from).toHaveBeenCalledWith(Task);
      expect(mockQueryBuilder.execute).toHaveBeenCalledWith();
    });
  });
});
