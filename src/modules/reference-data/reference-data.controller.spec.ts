import { NotFoundException } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { Test, TestingModule } from '@nestjs/testing';

import type { TaskPriority } from './entities/task-priority.entity';
import { ReferenceDataController } from './reference-data.controller';
import { TaskPriorityService } from './task-priority.service';

describe('ReferenceDataController', () => {
  let controller: ReferenceDataController;

  const mockTaskPriorities: TaskPriority[] = [
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

  const mockTaskPriorityService = {
    findAll: jest.fn().mockResolvedValue(mockTaskPriorities),
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [CacheModule.register()],
      controllers: [ReferenceDataController],
      providers: [
        {
          provide: TaskPriorityService,
          useValue: mockTaskPriorityService,
        },
      ],
    }).compile();

    controller = module.get<ReferenceDataController>(ReferenceDataController);
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

  describe('getTaskPriorities', () => {
    it('should return an array of task priorities', async () => {
      // Arrange
      // Mock setup completed in beforeEach

      // Act
      const result = await controller.getTaskPriorities();

      // Assert
      expect(mockTaskPriorityService.findAll).toHaveBeenCalled();
      expect(result).toEqual(mockTaskPriorities);
    });

    it('should return empty array when no task priorities exist', async () => {
      // Arrange
      mockTaskPriorityService.findAll.mockResolvedValueOnce([]);

      // Act
      const result = await controller.getTaskPriorities();

      // Assert
      expect(mockTaskPriorityService.findAll).toHaveBeenCalled();
      expect(result).toEqual([]);
    });

    it('should call service method exactly once', async () => {
      // Arrange
      // Mock setup completed in beforeEach

      // Act
      await controller.getTaskPriorities();

      // Assert
      expect(mockTaskPriorityService.findAll).toHaveBeenCalledTimes(1);
    });
  });

  describe('getTaskPriority', () => {
    it('should return a task priority when valid params are provided', async () => {
      // Arrange
      const code = 'HIGH';
      const expectedTaskPriority = mockTaskPriorities[0];
      const params = { code };
      mockTaskPriorityService.findOne.mockResolvedValueOnce(expectedTaskPriority);

      // Act
      const result = await controller.getTaskPriority(params);

      // Assert
      expect(mockTaskPriorityService.findOne).toHaveBeenCalledWith(code);
      expect(result).toEqual(expectedTaskPriority);
    });

    it('should throw NotFoundException when task priority does not exist', async () => {
      // Arrange
      const code = 'INVALID';
      const params = { code };
      mockTaskPriorityService.findOne.mockRejectedValueOnce(
        new NotFoundException(`TaskPriority with code ${code} not found`),
      );

      // Act & Assert
      await expect(controller.getTaskPriority(params)).rejects.toThrow(NotFoundException);
      expect(mockTaskPriorityService.findOne).toHaveBeenCalledWith(code);
    });

    it('should return correct task priority for different codes', async () => {
      // Arrange
      const mediumTaskPriority = mockTaskPriorities[1];
      const params = { code: 'MEDIUM' };
      mockTaskPriorityService.findOne.mockResolvedValueOnce(mediumTaskPriority);

      // Act
      const result = await controller.getTaskPriority(params);

      // Assert
      expect(mockTaskPriorityService.findOne).toHaveBeenCalledWith('MEDIUM');
      expect(result).toEqual(mediumTaskPriority);
      expect(result.code).toBe('MEDIUM');
    });

    it('should call service method exactly once with correct parameters', async () => {
      // Arrange
      const code = 'LOW';
      const params = { code };
      const expectedTaskPriority = mockTaskPriorities[2];
      mockTaskPriorityService.findOne.mockResolvedValueOnce(expectedTaskPriority);

      // Act
      await controller.getTaskPriority(params);

      // Assert
      expect(mockTaskPriorityService.findOne).toHaveBeenCalledTimes(1);
      expect(mockTaskPriorityService.findOne).toHaveBeenCalledWith(code);
    });

    it('should handle case-sensitive code lookup', async () => {
      // Arrange
      const code = 'high'; // lowercase
      const params = { code };
      mockTaskPriorityService.findOne.mockRejectedValueOnce(
        new NotFoundException(`TaskPriority with code ${code} not found`),
      );

      // Act & Assert
      await expect(controller.getTaskPriority(params)).rejects.toThrow(NotFoundException);
      expect(mockTaskPriorityService.findOne).toHaveBeenCalledWith(code);
    });
  });
});
