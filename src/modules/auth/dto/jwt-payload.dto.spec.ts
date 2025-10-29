import { validate } from 'class-validator';

import { JwtPayloadDto } from './jwt-payload.dto';

describe('JwtPayloadDto', () => {
  it('should validate a correct payload', async () => {
    // Arrange
    const dto = new JwtPayloadDto();
    dto.username = 'johndoe';
    dto.sub = 'b7a9c8d5-e2f1-4a3b-9c7d-6e5f4a3b2c1d';
    dto.id = '550e8400-e29b-41d4-a716-446655440001';

    // Act
    const errors = await validate(dto);

    // Assert
    expect(errors.length).toBe(0);
  });

  it('should fail validation for missing username', async () => {
    // Arrange
    const dto = new JwtPayloadDto();
    dto.sub = 'b7a9c8d5-e2f1-4a3b-9c7d-6e5f4a3b2c1d';
    dto.id = '550e8400-e29b-41d4-a716-446655440001';

    // Act
    const errors = await validate(dto);

    // Assert
    expect(errors.some((e) => e.property === 'username')).toBe(true);
  });

  it('should fail validation for short username', async () => {
    // Arrange
    const dto = new JwtPayloadDto();
    dto.username = 'ab';
    dto.sub = 'b7a9c8d5-e2f1-4a3b-9c7d-6e5f4a3b2c1d';
    dto.id = '550e8400-e29b-41d4-a716-446655440001';

    // Act
    const errors = await validate(dto);

    // Assert
    expect(errors.some((e) => e.property === 'username')).toBe(true);
  });

  it('should fail validation for missing sub', async () => {
    // Arrange
    const dto = new JwtPayloadDto();
    dto.username = 'johndoe';
    dto.id = '550e8400-e29b-41d4-a716-446655440001';

    // Act
    const errors = await validate(dto);

    // Assert
    expect(errors.some((e) => e.property === 'sub')).toBe(true);
  });

  it('should fail validation for missing id', async () => {
    // Arrange
    const dto = new JwtPayloadDto();
    dto.username = 'johndoe';
    dto.sub = 'b7a9c8d5-e2f1-4a3b-9c7d-6e5f4a3b2c1d';

    // Act
    const errors = await validate(dto);

    // Assert
    expect(errors.some((e) => e.property === 'id')).toBe(true);
  });
});
