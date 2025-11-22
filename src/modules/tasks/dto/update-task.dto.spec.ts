import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

import { UpdateTaskDto } from './update-task.dto';

describe('UpdateTaskDto', () => {
  describe('id', () => {
    it('should pass validation with valid UUID', async () => {
      // Arrange
      const dto = plainToInstance(UpdateTaskDto, {
        id: '550e8400-e29b-41d4-a716-446655440001',
      });

      // Act
      const errors = await validate(dto);

      // Assert
      expect(errors.length).toBe(0);
    });

    it('should fail validation when id is missing', async () => {
      // Arrange
      const dto = plainToInstance(UpdateTaskDto, {
        summary: 'Updated task summary',
      });

      // Act
      const errors = await validate(dto);

      // Assert
      expect(errors.length).toBeGreaterThan(0);
      const idError = errors.find((error) => error.property === 'id');
      expect(idError).toBeDefined();
      expect(idError?.constraints).toHaveProperty('isNotEmpty');
    });

    it('should fail validation when id is empty string', async () => {
      // Arrange
      const dto = plainToInstance(UpdateTaskDto, {
        id: '',
      });

      // Act
      const errors = await validate(dto);

      // Assert
      expect(errors.length).toBeGreaterThan(0);
      const idError = errors.find((error) => error.property === 'id');
      expect(idError).toBeDefined();
      expect(idError?.constraints).toHaveProperty('isNotEmpty');
    });

    it('should fail validation when id is not a string', async () => {
      // Arrange
      const dto = plainToInstance(UpdateTaskDto, {
        id: 12345,
      });

      // Act
      const errors = await validate(dto);

      // Assert
      expect(errors.length).toBeGreaterThan(0);
      const idError = errors.find((error) => error.property === 'id');
      expect(idError).toBeDefined();
      expect(idError?.constraints).toHaveProperty('isString');
    });

    it('should fail validation when id is not a valid UUID', async () => {
      // Arrange
      const dto = plainToInstance(UpdateTaskDto, {
        id: 'invalid-uuid',
      });

      // Act
      const errors = await validate(dto);

      // Assert
      expect(errors.length).toBeGreaterThan(0);
      const idError = errors.find((error) => error.property === 'id');
      expect(idError).toBeDefined();
      expect(idError?.constraints).toHaveProperty('isUuid');
    });

    it('should fail validation with UUID v1', async () => {
      // Arrange
      const dto = plainToInstance(UpdateTaskDto, {
        id: 'a0eebc99-9c0b-11d1-9b6d-00c04fd430c8', // UUID v1
      });

      // Act
      const errors = await validate(dto);

      // Assert
      expect(errors.length).toBeGreaterThan(0);
      const idError = errors.find((error) => error.property === 'id');
      expect(idError).toBeDefined();
      expect(idError?.constraints).toHaveProperty('isUuid');
    });
  });

  describe('summary', () => {
    it('should pass validation with valid summary', async () => {
      // Arrange
      const dto = plainToInstance(UpdateTaskDto, {
        id: '550e8400-e29b-41d4-a716-446655440001',
        summary: 'Updated task summary',
      });

      // Act
      const errors = await validate(dto);

      // Assert
      expect(errors.length).toBe(0);
    });

    it('should pass validation when summary is not provided', async () => {
      // Arrange
      const dto = plainToInstance(UpdateTaskDto, {
        id: '550e8400-e29b-41d4-a716-446655440001',
      });

      // Act
      const errors = await validate(dto);

      // Assert
      expect(errors.length).toBe(0);
    });

    it('should fail validation when summary is empty string', async () => {
      // Arrange
      const dto = plainToInstance(UpdateTaskDto, {
        id: '550e8400-e29b-41d4-a716-446655440001',
        summary: '',
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
      const dto = plainToInstance(UpdateTaskDto, {
        id: '550e8400-e29b-41d4-a716-446655440001',
        summary: 12345,
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
      const dto = plainToInstance(UpdateTaskDto, {
        id: '550e8400-e29b-41d4-a716-446655440001',
        summary: 'a'.repeat(501),
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
      const dto = plainToInstance(UpdateTaskDto, {
        id: '550e8400-e29b-41d4-a716-446655440001',
        description: 'Updated detailed description',
      });

      // Act
      const errors = await validate(dto);

      // Assert
      expect(errors.length).toBe(0);
    });

    it('should pass validation when description is not provided', async () => {
      // Arrange
      const dto = plainToInstance(UpdateTaskDto, {
        id: '550e8400-e29b-41d4-a716-446655440001',
      });

      // Act
      const errors = await validate(dto);

      // Assert
      expect(errors.length).toBe(0);
    });

    it('should fail validation when description is not a string', async () => {
      // Arrange
      const dto = plainToInstance(UpdateTaskDto, {
        id: '550e8400-e29b-41d4-a716-446655440001',
        description: 12345,
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
      const dto = plainToInstance(UpdateTaskDto, {
        id: '550e8400-e29b-41d4-a716-446655440001',
        dueAt: '2025-12-31T23:59:59.000Z',
      });

      // Act
      const errors = await validate(dto);

      // Assert
      expect(errors.length).toBe(0);
    });

    it('should pass validation when dueAt is not provided', async () => {
      // Arrange
      const dto = plainToInstance(UpdateTaskDto, {
        id: '550e8400-e29b-41d4-a716-446655440001',
      });

      // Act
      const errors = await validate(dto);

      // Assert
      expect(errors.length).toBe(0);
    });

    it('should fail validation when dueAt is not a valid ISO 8601 date string', async () => {
      // Arrange
      const dto = plainToInstance(UpdateTaskDto, {
        id: '550e8400-e29b-41d4-a716-446655440001',
        dueAt: 'invalid-date',
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
      const dto = plainToInstance(UpdateTaskDto, {
        id: '550e8400-e29b-41d4-a716-446655440001',
        isComplete: true,
      });

      // Act
      const errors = await validate(dto);

      // Assert
      expect(errors.length).toBe(0);
    });

    it('should pass validation with valid boolean value false', async () => {
      // Arrange
      const dto = plainToInstance(UpdateTaskDto, {
        id: '550e8400-e29b-41d4-a716-446655440001',
        isComplete: false,
      });

      // Act
      const errors = await validate(dto);

      // Assert
      expect(errors.length).toBe(0);
    });

    it('should pass validation when isComplete is not provided', async () => {
      // Arrange
      const dto = plainToInstance(UpdateTaskDto, {
        id: '550e8400-e29b-41d4-a716-446655440001',
      });

      // Act
      const errors = await validate(dto);

      // Assert
      expect(errors.length).toBe(0);
    });

    it('should fail validation when isComplete is not a boolean', async () => {
      // Arrange
      const dto = plainToInstance(UpdateTaskDto, {
        id: '550e8400-e29b-41d4-a716-446655440001',
        isComplete: 'yes',
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
      const dto = plainToInstance(UpdateTaskDto, {
        id: '550e8400-e29b-41d4-a716-446655440001',
        taskPriorityCode: 'MEDIUM',
      });

      // Act
      const errors = await validate(dto);

      // Assert
      expect(errors.length).toBe(0);
    });

    it('should pass validation when taskPriorityCode is not provided', async () => {
      // Arrange
      const dto = plainToInstance(UpdateTaskDto, {
        id: '550e8400-e29b-41d4-a716-446655440001',
      });

      // Act
      const errors = await validate(dto);

      // Assert
      expect(errors.length).toBe(0);
    });

    it('should fail validation when taskPriorityCode is empty string', async () => {
      // Arrange
      const dto = plainToInstance(UpdateTaskDto, {
        id: '550e8400-e29b-41d4-a716-446655440001',
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
      const dto = plainToInstance(UpdateTaskDto, {
        id: '550e8400-e29b-41d4-a716-446655440001',
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
      const dto = plainToInstance(UpdateTaskDto, {
        id: '550e8400-e29b-41d4-a716-446655440001',
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

  describe('combined validation', () => {
    it('should pass validation with all optional fields provided', async () => {
      // Arrange
      const dto = plainToInstance(UpdateTaskDto, {
        id: '550e8400-e29b-41d4-a716-446655440001',
        summary: 'Updated summary',
        description: 'Updated description',
        dueAt: '2025-12-31T23:59:59.000Z',
        isComplete: true,
        taskPriorityCode: 'HIGH',
      });

      // Act
      const errors = await validate(dto);

      // Assert
      expect(errors.length).toBe(0);
    });

    it('should pass validation with only required field (id)', async () => {
      // Arrange
      const dto = plainToInstance(UpdateTaskDto, {
        id: '550e8400-e29b-41d4-a716-446655440001',
      });

      // Act
      const errors = await validate(dto);

      // Assert
      expect(errors.length).toBe(0);
    });

    it('should pass validation with partial optional fields', async () => {
      // Arrange
      const dto = plainToInstance(UpdateTaskDto, {
        id: '550e8400-e29b-41d4-a716-446655440001',
        summary: 'Updated summary',
        isComplete: false,
      });

      // Act
      const errors = await validate(dto);

      // Assert
      expect(errors.length).toBe(0);
    });
  });
});
