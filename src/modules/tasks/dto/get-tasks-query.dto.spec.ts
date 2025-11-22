import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

import { GetTasksQueryDto } from './get-tasks-query.dto';

describe('GetTasksQueryDto', () => {
  describe('page', () => {
    it('should pass validation with valid page number', async () => {
      // Arrange
      const dto = plainToInstance(GetTasksQueryDto, {
        page: 1,
      });

      // Act
      const errors = await validate(dto);

      // Assert
      expect(errors.length).toBe(0);
    });

    it('should pass validation when page is not provided', async () => {
      // Arrange
      const dto = plainToInstance(GetTasksQueryDto, {});

      // Act
      const errors = await validate(dto);

      // Assert
      expect(errors.length).toBe(0);
    });

    it('should transform string to number for valid page', async () => {
      // Arrange
      const dto = plainToInstance(GetTasksQueryDto, {
        page: '5',
      });

      // Act
      const errors = await validate(dto);

      // Assert
      expect(errors.length).toBe(0);
      expect(dto.page).toBe(5);
      expect(typeof dto.page).toBe('number');
    });

    it('should fail validation when page is less than 1', async () => {
      // Arrange
      const dto = plainToInstance(GetTasksQueryDto, {
        page: 0,
      });

      // Act
      const errors = await validate(dto);

      // Assert
      expect(errors.length).toBeGreaterThan(0);
      const pageError = errors.find((error) => error.property === 'page');
      expect(pageError).toBeDefined();
      expect(pageError?.constraints).toHaveProperty('min');
    });

    it('should fail validation when page is negative', async () => {
      // Arrange
      const dto = plainToInstance(GetTasksQueryDto, {
        page: -1,
      });

      // Act
      const errors = await validate(dto);

      // Assert
      expect(errors.length).toBeGreaterThan(0);
      const pageError = errors.find((error) => error.property === 'page');
      expect(pageError).toBeDefined();
      expect(pageError?.constraints).toHaveProperty('min');
    });

    it('should fail validation when page is not an integer', async () => {
      // Arrange
      const dto = plainToInstance(GetTasksQueryDto, {
        page: 1.5,
      });

      // Act
      const errors = await validate(dto);

      // Assert
      expect(errors.length).toBeGreaterThan(0);
      const pageError = errors.find((error) => error.property === 'page');
      expect(pageError).toBeDefined();
      expect(pageError?.constraints).toHaveProperty('isInt');
    });

    it('should fail validation when page is not a valid number string', async () => {
      // Arrange
      const dto = plainToInstance(GetTasksQueryDto, {
        page: 'invalid',
      });

      // Act
      const errors = await validate(dto);

      // Assert
      expect(errors.length).toBeGreaterThan(0);
      const pageError = errors.find((error) => error.property === 'page');
      expect(pageError).toBeDefined();
    });
  });

  describe('pageSize', () => {
    it('should pass validation with valid pageSize', async () => {
      // Arrange
      const dto = plainToInstance(GetTasksQueryDto, {
        pageSize: 10,
      });

      // Act
      const errors = await validate(dto);

      // Assert
      expect(errors.length).toBe(0);
    });

    it('should pass validation when pageSize is not provided', async () => {
      // Arrange
      const dto = plainToInstance(GetTasksQueryDto, {});

      // Act
      const errors = await validate(dto);

      // Assert
      expect(errors.length).toBe(0);
    });

    it('should transform string to number for valid pageSize', async () => {
      // Arrange
      const dto = plainToInstance(GetTasksQueryDto, {
        pageSize: '20',
      });

      // Act
      const errors = await validate(dto);

      // Assert
      expect(errors.length).toBe(0);
      expect(dto.pageSize).toBe(20);
      expect(typeof dto.pageSize).toBe('number');
    });

    it('should fail validation when pageSize is less than 1', async () => {
      // Arrange
      const dto = plainToInstance(GetTasksQueryDto, {
        pageSize: 0,
      });

      // Act
      const errors = await validate(dto);

      // Assert
      expect(errors.length).toBeGreaterThan(0);
      const pageSizeError = errors.find((error) => error.property === 'pageSize');
      expect(pageSizeError).toBeDefined();
      expect(pageSizeError?.constraints).toHaveProperty('min');
    });

    it('should fail validation when pageSize is negative', async () => {
      // Arrange
      const dto = plainToInstance(GetTasksQueryDto, {
        pageSize: -5,
      });

      // Act
      const errors = await validate(dto);

      // Assert
      expect(errors.length).toBeGreaterThan(0);
      const pageSizeError = errors.find((error) => error.property === 'pageSize');
      expect(pageSizeError).toBeDefined();
      expect(pageSizeError?.constraints).toHaveProperty('min');
    });

    it('should fail validation when pageSize is not an integer', async () => {
      // Arrange
      const dto = plainToInstance(GetTasksQueryDto, {
        pageSize: 10.5,
      });

      // Act
      const errors = await validate(dto);

      // Assert
      expect(errors.length).toBeGreaterThan(0);
      const pageSizeError = errors.find((error) => error.property === 'pageSize');
      expect(pageSizeError).toBeDefined();
      expect(pageSizeError?.constraints).toHaveProperty('isInt');
    });

    it('should fail validation when pageSize is not a valid number string', async () => {
      // Arrange
      const dto = plainToInstance(GetTasksQueryDto, {
        pageSize: 'invalid',
      });

      // Act
      const errors = await validate(dto);

      // Assert
      expect(errors.length).toBeGreaterThan(0);
      const pageSizeError = errors.find((error) => error.property === 'pageSize');
      expect(pageSizeError).toBeDefined();
    });
  });

  describe('combined validation', () => {
    it('should pass validation with both page and pageSize', async () => {
      // Arrange
      const dto = plainToInstance(GetTasksQueryDto, {
        page: 2,
        pageSize: 25,
      });

      // Act
      const errors = await validate(dto);

      // Assert
      expect(errors.length).toBe(0);
    });

    it('should pass validation with page but without pageSize', async () => {
      // Arrange
      const dto = plainToInstance(GetTasksQueryDto, {
        page: 3,
      });

      // Act
      const errors = await validate(dto);

      // Assert
      expect(errors.length).toBe(0);
    });

    it('should pass validation with pageSize but without page', async () => {
      // Arrange
      const dto = plainToInstance(GetTasksQueryDto, {
        pageSize: 50,
      });

      // Act
      const errors = await validate(dto);

      // Assert
      expect(errors.length).toBe(0);
    });
  });
});
