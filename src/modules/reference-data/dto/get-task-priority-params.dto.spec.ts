import { validate } from 'class-validator';
import { GetTaskPriorityParamsDto } from './get-task-priority-params.dto';

describe('GetTaskPriorityParamsDto', () => {
  it('should be valid with a proper code', async () => {
    // Arrange
    const dto = new GetTaskPriorityParamsDto();
    dto.code = 'HIGH';

    // Act
    const errors = await validate(dto);

    // Assert
    expect(errors).toHaveLength(0);
  });

  it('should be valid with uppercase letters, numbers, underscores, and hyphens', async () => {
    // Arrange
    const dto = new GetTaskPriorityParamsDto();
    dto.code = 'HIGH_PRIORITY-1';

    // Act
    const errors = await validate(dto);

    // Assert
    expect(errors).toHaveLength(0);
  });

  it('should fail validation when code is empty', async () => {
    // Arrange
    const dto = new GetTaskPriorityParamsDto();
    dto.code = '';

    // Act
    const errors = await validate(dto);

    // Assert
    expect(errors).toHaveLength(1);
    expect(errors[0].property).toBe('code');
    expect(errors[0].constraints).toHaveProperty('isNotEmpty');
  });

  it('should fail validation when code is not provided', async () => {
    // Arrange
    const dto = new GetTaskPriorityParamsDto();

    // Act
    const errors = await validate(dto);

    // Assert
    expect(errors).toHaveLength(1);
    expect(errors[0].property).toBe('code');
    expect(errors[0].constraints).toHaveProperty('isNotEmpty');
  });

  it('should fail validation when code exceeds maximum length', async () => {
    // Arrange
    const dto = new GetTaskPriorityParamsDto();
    dto.code = 'A'.repeat(33); // 33 characters, exceeds limit of 32

    // Act
    const errors = await validate(dto);

    // Assert
    expect(errors).toHaveLength(1);
    expect(errors[0].property).toBe('code');
    expect(errors[0].constraints).toHaveProperty('maxLength');
  });

  it('should fail validation when code contains invalid characters', async () => {
    // Arrange
    const dto = new GetTaskPriorityParamsDto();
    dto.code = 'high-priority'; // lowercase not allowed

    // Act
    const errors = await validate(dto);

    // Assert
    expect(errors).toHaveLength(1);
    expect(errors[0].property).toBe('code');
    expect(errors[0].constraints).toHaveProperty('matches');
  });

  it('should fail validation when code contains spaces', async () => {
    // Arrange
    const dto = new GetTaskPriorityParamsDto();
    dto.code = 'HIGH PRIORITY';

    // Act
    const errors = await validate(dto);

    // Assert
    expect(errors).toHaveLength(1);
    expect(errors[0].property).toBe('code');
    expect(errors[0].constraints).toHaveProperty('matches');
  });

  it('should fail validation when code is not a string', async () => {
    // Arrange
    const dto = new GetTaskPriorityParamsDto();
    (dto as any).code = 123;

    // Act
    const errors = await validate(dto);

    // Assert
    expect(errors).toHaveLength(1);
    expect(errors[0].property).toBe('code');
    expect(errors[0].constraints).toHaveProperty('isString');
  });
});
