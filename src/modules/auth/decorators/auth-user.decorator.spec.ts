import { ExecutionContext } from '@nestjs/common';

import { authUserFactory, AuthUser } from './auth-user.decorator';
import { JwtPayloadDto } from '../dto/jwt-payload.dto';

describe('AuthUser', () => {
  let mockExecutionContext: ExecutionContext;
  let mockRequest: { user?: JwtPayloadDto };

  beforeEach(() => {
    // Arrange - Create mock request
    mockRequest = {
      user: {
        id: '550e8400-e29b-41d4-a716-446655440001',
        sub: 'b7a9c8d5-e2f1-4a3b-9c7d-6e5f4a3b2c1d',
        username: 'johndoe',
      },
    };

    // Arrange - Create mock execution context
    mockExecutionContext = {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue(mockRequest),
      }),
    } as unknown as ExecutionContext;
  });

  it('should be defined', () => {
    // Arrange & Act
    const decorator = AuthUser();

    // Assert
    expect(decorator).toBeDefined();
    expect(typeof decorator).toBe('function');
  });

  it('should return the entire user object when no property is specified', () => {
    // Arrange & Act
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const result = authUserFactory(undefined, mockExecutionContext);

    // Assert
    expect(result).toEqual(mockRequest.user);
    expect(result).toHaveProperty('id');
    expect(result).toHaveProperty('sub');
    expect(result).toHaveProperty('username');
  });

  it('should return specific property when property name is provided', () => {
    // Arrange & Act
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const result = authUserFactory('id', mockExecutionContext);

    // Assert
    expect(result).toBe('550e8400-e29b-41d4-a716-446655440001');
  });

  it('should return username when username property is specified', () => {
    // Arrange & Act
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const result = authUserFactory('username', mockExecutionContext);

    // Assert
    expect(result).toBe('johndoe');
  });

  it('should return sub when sub property is specified', () => {
    // Arrange & Act
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const result = authUserFactory('sub', mockExecutionContext);

    // Assert
    expect(result).toBe('b7a9c8d5-e2f1-4a3b-9c7d-6e5f4a3b2c1d');
  });

  it('should return undefined when user is not present in request', () => {
    // Arrange
    mockRequest.user = undefined;

    // Act
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const result = authUserFactory(undefined, mockExecutionContext);

    // Assert
    expect(result).toBeUndefined();
  });

  it('should return undefined when accessing property on undefined user', () => {
    // Arrange
    mockRequest.user = undefined;

    // Act
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const result = authUserFactory('id', mockExecutionContext);

    // Assert
    expect(result).toBeUndefined();
  });

  it('should call switchToHttp on execution context', () => {
    // Arrange
    const switchToHttpSpy = jest.spyOn(mockExecutionContext, 'switchToHttp');

    // Act
    authUserFactory(undefined, mockExecutionContext);

    // Assert
    expect(switchToHttpSpy).toHaveBeenCalledTimes(1);
  });

  it('should call getRequest on http context', () => {
    // Arrange
    const httpContext = mockExecutionContext.switchToHttp();
    const getRequestSpy = jest.spyOn(httpContext, 'getRequest');

    // Act
    authUserFactory(undefined, mockExecutionContext);

    // Assert
    expect(getRequestSpy).toHaveBeenCalledTimes(1);
  });

  it('should handle partial user object', () => {
    // Arrange
    mockRequest.user = {
      id: '550e8400-e29b-41d4-a716-446655440001',
    } as JwtPayloadDto;

    // Act
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const resultUser = authUserFactory(undefined, mockExecutionContext);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const resultId = authUserFactory('id', mockExecutionContext);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const resultUsername = authUserFactory('username', mockExecutionContext);

    // Assert
    expect(resultUser).toEqual(mockRequest.user);
    expect(resultId).toBe('550e8400-e29b-41d4-a716-446655440001');
    expect(resultUsername).toBeUndefined();
  });
});
