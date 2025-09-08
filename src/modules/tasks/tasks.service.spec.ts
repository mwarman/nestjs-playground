import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { TasksService } from './tasks.service';

describe('TasksService', () => {
  let service: TasksService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TasksService],
    }).compile();

    service = module.get<TasksService>(TasksService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of tasks', () => {
      // Arrange
      // No additional setup needed

      // Act
      const result = service.findAll();

      // Assert
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });

    it('should return tasks with correct structure', () => {
      // Arrange
      // No additional setup needed

      // Act
      const result = service.findAll();
      const task = result[0];

      // Assert
      expect(task).toHaveProperty('id');
      expect(task).toHaveProperty('summary');
      expect(task).toHaveProperty('isComplete');
      expect(task).toHaveProperty('createdAt');
      expect(typeof task.id).toBe('string');
      expect(typeof task.summary).toBe('string');
      expect(typeof task.isComplete).toBe('boolean');
      expect(typeof task.createdAt).toBe('string');
    });
  });

  describe('findOne', () => {
    it('should return a task when valid ID is provided', () => {
      // Arrange
      const tasks = service.findAll();
      const existingTask = tasks[0];

      // Act
      const result = service.findOne(existingTask.id);

      // Assert
      expect(result).toEqual(existingTask);
    });

    it('should throw NotFoundException when task is not found', () => {
      // Arrange
      const nonExistentId = '00000000-0000-0000-0000-000000000000';

      // Act & Assert
      expect(() => service.findOne(nonExistentId)).toThrow(NotFoundException);
      expect(() => service.findOne(nonExistentId)).toThrow(`Task with ID ${nonExistentId} not found`);
    });

    it('should return task with all required properties', () => {
      // Arrange
      const tasks = service.findAll();
      const taskId = tasks[0].id;

      // Act
      const result = service.findOne(taskId);

      // Assert
      expect(result).toHaveProperty('id', taskId);
      expect(result).toHaveProperty('summary');
      expect(result).toHaveProperty('isComplete');
      expect(result).toHaveProperty('createdAt');
    });
  });
});
