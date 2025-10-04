import { User } from './user.entity';

describe('User', () => {
  it('should be defined', () => {
    expect(User).toBeDefined();
  });

  it('should create a User instance', () => {
    // Arrange
    // (no setup needed)

    // Act
    const user = new User();

    // Assert
    expect(user).toBeInstanceOf(User);
  });

  it('should have all required properties', () => {
    // Arrange
    const user = new User();

    // Act
    // (no action needed)

    // Assert
    expect(user).toHaveProperty('id');
    expect(user).toHaveProperty('sub');
    expect(user).toHaveProperty('firstName');
    expect(user).toHaveProperty('lastName');
    expect(user).toHaveProperty('email');
    expect(user).toHaveProperty('username');
    expect(user).toHaveProperty('passwordSalt');
    expect(user).toHaveProperty('passwordHash');
    expect(user).toHaveProperty('createdAt');
    expect(user).toHaveProperty('updatedAt');
  });

  it('should allow setting and getting properties', () => {
    // Arrange
    const user = new User();
    const testData = {
      id: 'test-id',
      sub: 'test-sub',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      username: 'johndoe',
      passwordSalt: 'test-salt',
      passwordHash: 'test-hash',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Act
    Object.assign(user, testData);

    // Assert
    expect(user.id).toBe(testData.id);
    expect(user.sub).toBe(testData.sub);
    expect(user.firstName).toBe(testData.firstName);
    expect(user.lastName).toBe(testData.lastName);
    expect(user.email).toBe(testData.email);
    expect(user.username).toBe(testData.username);
    expect(user.passwordSalt).toBe(testData.passwordSalt);
    expect(user.passwordHash).toBe(testData.passwordHash);
    expect(user.createdAt).toBe(testData.createdAt);
    expect(user.updatedAt).toBe(testData.updatedAt);
  });
});
