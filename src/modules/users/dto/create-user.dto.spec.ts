import { validate } from 'class-validator';
import { CreateUserDto } from './create-user.dto';

describe('CreateUserDto', () => {
  it('should validate a correct DTO', async () => {
    // Arrange
    const dto = new CreateUserDto();
    dto.firstName = 'John';
    dto.lastName = 'Doe';
    dto.email = 'john.doe@example.com';
    dto.username = 'johndoe';
    dto.passwordHash = 'hashedpassword';
    dto.passwordSalt = 'somesalt';

    // Act
    const errors = await validate(dto);

    // Assert
    expect(errors.length).toBe(0);
  });

  it('should fail if required fields are missing', async () => {
    // Arrange
    const dto = new CreateUserDto();

    // Act
    const errors = await validate(dto);

    // Assert
    expect(errors.length).toBeGreaterThan(0);
    const errorProps = errors.map((e) => e.property);
    expect(errorProps).toEqual(
      expect.arrayContaining(['firstName', 'lastName', 'email', 'username', 'passwordHash', 'passwordSalt']),
    );
  });

  it('should fail for invalid email', async () => {
    // Arrange
    const dto = new CreateUserDto();
    dto.firstName = 'John';
    dto.lastName = 'Doe';
    dto.email = 'not-an-email';
    dto.username = 'johndoe';
    dto.passwordHash = 'hashedpassword';
    dto.passwordSalt = 'somesalt';

    // Act
    const errors = await validate(dto);

    // Assert
    expect(errors.some((e) => e.property === 'email')).toBe(true);
  });

  it('should fail for short username', async () => {
    // Arrange
    const dto = new CreateUserDto();
    dto.firstName = 'John';
    dto.lastName = 'Doe';
    dto.email = 'john.doe@example.com';
    dto.username = 'jd';
    dto.passwordHash = 'hashedpassword';
    dto.passwordSalt = 'somesalt';

    // Act
    const errors = await validate(dto);

    // Assert
    expect(errors.some((e) => e.property === 'username')).toBe(true);
  });

  it('should fail for long username', async () => {
    // Arrange
    const dto = new CreateUserDto();
    dto.firstName = 'John';
    dto.lastName = 'Doe';
    dto.email = 'john.doe@example.com';
    dto.username = 'a'.repeat(51);
    dto.passwordHash = 'hashedpassword';
    dto.passwordSalt = 'somesalt';

    // Act
    const errors = await validate(dto);

    // Assert
    expect(errors.some((e) => e.property === 'username')).toBe(true);
  });

  it('should fail for long firstName', async () => {
    // Arrange
    const dto = new CreateUserDto();
    dto.firstName = 'J'.repeat(101);
    dto.lastName = 'Doe';
    dto.email = 'john.doe@example.com';
    dto.username = 'johndoe';
    dto.passwordHash = 'hashedpassword';
    dto.passwordSalt = 'somesalt';

    // Act
    const errors = await validate(dto);

    // Assert
    expect(errors.some((e) => e.property === 'firstName')).toBe(true);
  });

  it('should fail for long lastName', async () => {
    // Arrange
    const dto = new CreateUserDto();
    dto.firstName = 'John';
    dto.lastName = 'D'.repeat(101);
    dto.email = 'john.doe@example.com';
    dto.username = 'johndoe';
    dto.passwordHash = 'hashedpassword';
    dto.passwordSalt = 'somesalt';

    // Act
    const errors = await validate(dto);

    // Assert
    expect(errors.some((e) => e.property === 'lastName')).toBe(true);
  });

  it('should fail for long email', async () => {
    // Arrange
    const dto = new CreateUserDto();
    dto.firstName = 'John';
    dto.lastName = 'Doe';
    dto.email = 'a'.repeat(256) + '@example.com';
    dto.username = 'johndoe';
    dto.passwordHash = 'hashedpassword';
    dto.passwordSalt = 'somesalt';

    // Act
    const errors = await validate(dto);

    // Assert
    expect(errors.some((e) => e.property === 'email')).toBe(true);
  });
});
