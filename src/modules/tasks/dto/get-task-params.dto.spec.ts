import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

import { GetTaskParamsDto } from './get-task-params.dto';

describe('GetTaskParamsDto', () => {
  describe('taskId', () => {
    it('should pass validation with valid UUID', async () => {
      // Arrange
      const dto = plainToInstance(GetTaskParamsDto, {
        taskId: '550e8400-e29b-41d4-a716-446655440001',
      });

      // Act
      const errors = await validate(dto);

      // Assert
      expect(errors.length).toBe(0);
    });

    it('should fail validation when taskId is missing', async () => {
      // Arrange
      const dto = plainToInstance(GetTaskParamsDto, {});

      // Act
      const errors = await validate(dto);

      // Assert
      expect(errors.length).toBeGreaterThan(0);
      const taskIdError = errors.find((error) => error.property === 'taskId');
      expect(taskIdError).toBeDefined();
      expect(taskIdError?.constraints).toHaveProperty('isNotEmpty');
    });

    it('should fail validation when taskId is empty string', async () => {
      // Arrange
      const dto = plainToInstance(GetTaskParamsDto, {
        taskId: '',
      });

      // Act
      const errors = await validate(dto);

      // Assert
      expect(errors.length).toBeGreaterThan(0);
      const taskIdError = errors.find((error) => error.property === 'taskId');
      expect(taskIdError).toBeDefined();
      expect(taskIdError?.constraints).toHaveProperty('isNotEmpty');
    });

    it('should fail validation when taskId is not a valid UUID', async () => {
      // Arrange
      const dto = plainToInstance(GetTaskParamsDto, {
        taskId: 'invalid-uuid',
      });

      // Act
      const errors = await validate(dto);

      // Assert
      expect(errors.length).toBeGreaterThan(0);
      const taskIdError = errors.find((error) => error.property === 'taskId');
      expect(taskIdError).toBeDefined();
      expect(taskIdError?.constraints).toHaveProperty('isUuid');
    });

    it('should fail validation when taskId is a number', async () => {
      // Arrange
      const dto = plainToInstance(GetTaskParamsDto, {
        taskId: 12345,
      });

      // Act
      const errors = await validate(dto);

      // Assert
      expect(errors.length).toBeGreaterThan(0);
      const taskIdError = errors.find((error) => error.property === 'taskId');
      expect(taskIdError).toBeDefined();
      expect(taskIdError?.constraints).toHaveProperty('isUuid');
    });

    it('should fail validation with UUID v1', async () => {
      // Arrange
      const dto = plainToInstance(GetTaskParamsDto, {
        taskId: 'a0eebc99-9c0b-11d1-9b6d-00c04fd430c8', // UUID v1
      });

      // Act
      const errors = await validate(dto);

      // Assert
      expect(errors.length).toBeGreaterThan(0);
      const taskIdError = errors.find((error) => error.property === 'taskId');
      expect(taskIdError).toBeDefined();
      expect(taskIdError?.constraints).toHaveProperty('isUuid');
    });

    it('should pass validation with UUID v4', async () => {
      // Arrange
      const dto = plainToInstance(GetTaskParamsDto, {
        taskId: 'f47ac10b-58cc-4372-a567-0e02b2c3d479', // UUID v4
      });

      // Act
      const errors = await validate(dto);

      // Assert
      expect(errors.length).toBe(0);
    });
  });
});
