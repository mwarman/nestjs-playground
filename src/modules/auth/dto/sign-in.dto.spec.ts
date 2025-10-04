import { validate } from 'class-validator';
import { SignInDto } from './sign-in.dto';

describe('SignInDto', () => {
  it('should validate a correct DTO', async () => {
    // Arrange
    const dto = new SignInDto();
    dto.username = 'johndoe';
    dto.password = 'password123';

    // Act
    const errors = await validate(dto);

    // Assert
    expect(errors.length).toBe(0);
  });

  it('should fail if required fields are missing', async () => {
    // Arrange
    const dto = new SignInDto();

    // Act
    const errors = await validate(dto);

    // Assert
    expect(errors.length).toBeGreaterThan(0);
    const errorProps = errors.map((e) => e.property);
    expect(errorProps).toEqual(expect.arrayContaining(['username', 'password']));
  });

  it('should fail for short username', async () => {
    // Arrange
    const dto = new SignInDto();
    dto.username = 'jd';
    dto.password = 'password123';

    // Act
    const errors = await validate(dto);

    // Assert
    expect(errors.some((e) => e.property === 'username')).toBe(true);
  });

  it('should fail for short password', async () => {
    // Arrange
    const dto = new SignInDto();
    dto.username = 'johndoe';
    dto.password = 'short';

    // Act
    const errors = await validate(dto);

    // Assert
    expect(errors.some((e) => e.property === 'password')).toBe(true);
  });

  it('should fail for long username', async () => {
    // Arrange
    const dto = new SignInDto();
    dto.username = 'a'.repeat(51);
    dto.password = 'password123';

    // Act
    const errors = await validate(dto);

    // Assert
    expect(errors.some((e) => e.property === 'username')).toBe(true);
  });

  it('should fail for long password', async () => {
    // Arrange
    const dto = new SignInDto();
    dto.username = 'johndoe';
    dto.password = 'a'.repeat(101);

    // Act
    const errors = await validate(dto);

    // Assert
    expect(errors.some((e) => e.property === 'password')).toBe(true);
  });
});
