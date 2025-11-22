import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

import { CreateTaskDto } from './create-task.dto';

describe('CreateTaskDto', () => {
  describe('summary', () => {
    it('should pass validation with valid summary', async () => {
      // Arrange
      const dto = plainToInstance(CreateTaskDto, {
        summary: 'Complete project documentation',
        taskPriorityCode: 'HIGH',
      });

      // Act
      const errors = await validate(dto);

      // Assert
      expect(errors.length).toBe(0);
    });

    it('should fail validation when summary is missing', async () => {
      // Arrange
      const dto = plainToInstance(CreateTaskDto, {
        taskPriorityCode: 'HIGH',
      });

      // Act
      const errors = await validate(dto);

      // Assert
      expect(errors.length).toBeGreaterThan(0);
      const summaryError = errors.find((error) => error.property === 'summary');
      expect(summaryError).toBeDefined();
      expect(summaryError?.constraints).toHaveProperty('isNotEmpty');
    });

    it('should fail validation when summary is empty string', async () => {
      // Arrange
      const dto = plainToInstance(CreateTaskDto, {
        summary: '',
        taskPriorityCode: 'HIGH',
      });

      // Act
      const errors = await validate(dto);

      // Assert
      expect(errors.length).toBeGreaterThan(0);
      const summaryError = errors.find((error) => error.property === 'summary');
      expect(summaryError).toBeDefined();
      expect(summaryError?.constraints).toHaveProperty('isNotEmpty');
    });

    it('should fail validation when summary is not a string', async () => {
      // Arrange
      const dto = plainToInstance(CreateTaskDto, {
        summary: 12345,
        taskPriorityCode: 'HIGH',
      });

      // Act
      const errors = await validate(dto);

      // Assert
      expect(errors.length).toBeGreaterThan(0);
      const summaryError = errors.find((error) => error.property === 'summary');
      expect(summaryError).toBeDefined();
      expect(summaryError?.constraints).toHaveProperty('isString');
    });

    it('should fail validation when summary exceeds 500 characters', async () => {
      // Arrange
      const dto = plainToInstance(CreateTaskDto, {
        summary: 'a'.repeat(501),
        taskPriorityCode: 'HIGH',
      });

      // Act
      const errors = await validate(dto);

      // Assert
      expect(errors.length).toBeGreaterThan(0);
      const summaryError = errors.find((error) => error.property === 'summary');
      expect(summaryError).toBeDefined();
      expect(summaryError?.constraints).toHaveProperty('maxLength');
    });
  });

  describe('description', () => {
    it('should pass validation with valid description', async () => {
      // Arrange
      const dto = plainToInstance(CreateTaskDto, {
        summary: 'Complete project documentation',
        description: 'Write comprehensive documentation for the NestJS playground project',
        taskPriorityCode: 'HIGH',
      });

      // Act
      const errors = await validate(dto);

      // Assert
      expect(errors.length).toBe(0);
    });

    it('should pass validation when description is not provided', async () => {
      // Arrange
      const dto = plainToInstance(CreateTaskDto, {
        summary: 'Complete project documentation',
        taskPriorityCode: 'HIGH',
      });

      // Act
      const errors = await validate(dto);

      // Assert
      expect(errors.length).toBe(0);
    });

    it('should fail validation when description is not a string', async () => {
      // Arrange
      const dto = plainToInstance(CreateTaskDto, {
        summary: 'Complete project documentation',
        description: 12345,
        taskPriorityCode: 'HIGH',
      });

      // Act
      const errors = await validate(dto);

      // Assert
      expect(errors.length).toBeGreaterThan(0);
      const descriptionError = errors.find((error) => error.property === 'description');
      expect(descriptionError).toBeDefined();
      expect(descriptionError?.constraints).toHaveProperty('isString');
    });
  });

  describe('dueAt', () => {
    it('should pass validation with valid ISO 8601 date string', async () => {
      // Arrange
      const dto = plainToInstance(CreateTaskDto, {
        summary: 'Complete project documentation',
        dueAt: '2025-09-15T10:00:00.000Z',
        taskPriorityCode: 'HIGH',
      });

      // Act
      const errors = await validate(dto);

      // Assert
      expect(errors.length).toBe(0);
    });

    it('should pass validation when dueAt is not provided', async () => {
      // Arrange
      const dto = plainToInstance(CreateTaskDto, {
        summary: 'Complete project documentation',
        taskPriorityCode: 'HIGH',
      });

      // Act
      const errors = await validate(dto);

      // Assert
      expect(errors.length).toBe(0);
    });

    it('should fail validation when dueAt is not a valid ISO 8601 date string', async () => {
      // Arrange
      const dto = plainToInstance(CreateTaskDto, {
        summary: 'Complete project documentation',
        dueAt: 'invalid-date',
        taskPriorityCode: 'HIGH',
      });

      // Act
      const errors = await validate(dto);

      // Assert
      expect(errors.length).toBeGreaterThan(0);
      const dueAtError = errors.find((error) => error.property === 'dueAt');
      expect(dueAtError).toBeDefined();
      expect(dueAtError?.constraints).toHaveProperty('isDateString');
    });
  });

  describe('isComplete', () => {
    it('should pass validation with valid boolean value true', async () => {
      // Arrange
      const dto = plainToInstance(CreateTaskDto, {
        summary: 'Complete project documentation',
        isComplete: true,
        taskPriorityCode: 'HIGH',
      });

      // Act
      const errors = await validate(dto);

      // Assert
      expect(errors.length).toBe(0);
    });

    it('should pass validation with valid boolean value false', async () => {
      // Arrange
      const dto = plainToInstance(CreateTaskDto, {
        summary: 'Complete project documentation',
        isComplete: false,
        taskPriorityCode: 'HIGH',
      });

      // Act
      const errors = await validate(dto);

      // Assert
      expect(errors.length).toBe(0);
    });

    it('should pass validation when isComplete is not provided', async () => {
      // Arrange
      const dto = plainToInstance(CreateTaskDto, {
        summary: 'Complete project documentation',
        taskPriorityCode: 'HIGH',
      });

      // Act
      const errors = await validate(dto);

      // Assert
      expect(errors.length).toBe(0);
    });

    it('should fail validation when isComplete is not a boolean', async () => {
      // Arrange
      const dto = plainToInstance(CreateTaskDto, {
        summary: 'Complete project documentation',
        isComplete: 'yes',
        taskPriorityCode: 'HIGH',
      });

      // Act
      const errors = await validate(dto);

      // Assert
      expect(errors.length).toBeGreaterThan(0);
      const isCompleteError = errors.find((error) => error.property === 'isComplete');
      expect(isCompleteError).toBeDefined();
      expect(isCompleteError?.constraints).toHaveProperty('isBoolean');
    });
  });

  describe('taskPriorityCode', () => {
    it('should pass validation with valid taskPriorityCode', async () => {
      // Arrange
      const dto = plainToInstance(CreateTaskDto, {
        summary: 'Complete project documentation',
        taskPriorityCode: 'HIGH',
      });

      // Act
      const errors = await validate(dto);

      // Assert
      expect(errors.length).toBe(0);
    });

    it('should fail validation when taskPriorityCode is missing', async () => {
      // Arrange
      const dto = plainToInstance(CreateTaskDto, {
        summary: 'Complete project documentation',
      });

      // Act
      const errors = await validate(dto);

      // Assert
      expect(errors.length).toBeGreaterThan(0);
      const taskPriorityCodeError = errors.find((error) => error.property === 'taskPriorityCode');
      expect(taskPriorityCodeError).toBeDefined();
      expect(taskPriorityCodeError?.constraints).toHaveProperty('isNotEmpty');
    });

    it('should fail validation when taskPriorityCode is empty string', async () => {
      // Arrange
      const dto = plainToInstance(CreateTaskDto, {
        summary: 'Complete project documentation',
        taskPriorityCode: '',
      });

      // Act
      const errors = await validate(dto);

      // Assert
      expect(errors.length).toBeGreaterThan(0);
      const taskPriorityCodeError = errors.find((error) => error.property === 'taskPriorityCode');
      expect(taskPriorityCodeError).toBeDefined();
      expect(taskPriorityCodeError?.constraints).toHaveProperty('isNotEmpty');
    });

    it('should fail validation when taskPriorityCode is not a string', async () => {
      // Arrange
      const dto = plainToInstance(CreateTaskDto, {
        summary: 'Complete project documentation',
        taskPriorityCode: 123,
      });

      // Act
      const errors = await validate(dto);

      // Assert
      expect(errors.length).toBeGreaterThan(0);
      const taskPriorityCodeError = errors.find((error) => error.property === 'taskPriorityCode');
      expect(taskPriorityCodeError).toBeDefined();
      expect(taskPriorityCodeError?.constraints).toHaveProperty('isString');
    });

    it('should fail validation when taskPriorityCode exceeds 32 characters', async () => {
      // Arrange
      const dto = plainToInstance(CreateTaskDto, {
        summary: 'Complete project documentation',
        taskPriorityCode: 'a'.repeat(33),
      });

      // Act
      const errors = await validate(dto);

      // Assert
      expect(errors.length).toBeGreaterThan(0);
      const taskPriorityCodeError = errors.find((error) => error.property === 'taskPriorityCode');
      expect(taskPriorityCodeError).toBeDefined();
      expect(taskPriorityCodeError?.constraints).toHaveProperty('maxLength');
    });
  });
});
