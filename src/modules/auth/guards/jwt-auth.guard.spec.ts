import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { JwtAuthGuard } from './jwt-auth.guard';

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;

  const mockJwtService = {
    verifyAsync: jest.fn(),
  };

  const mockExecutionContext = {
    switchToHttp: jest.fn().mockReturnThis(),
    getRequest: jest.fn(),
  } as unknown as ExecutionContext;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtAuthGuard,
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    guard = module.get<JwtAuthGuard>(JwtAuthGuard);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  describe('canActivate', () => {
    const mockPayload = {
      sub: 'test-sub',
      username: 'johndoe',
    };

    it('should return true and add user to request when token is valid', async () => {
      // Arrange
      const mockRequest = {
        headers: {
          authorization: 'Bearer valid-token',
        },
      };
      (mockExecutionContext.switchToHttp().getRequest as jest.Mock).mockReturnValue(mockRequest);
      mockJwtService.verifyAsync.mockResolvedValue(mockPayload);

      // Act
      const result = await guard.canActivate(mockExecutionContext);

      // Assert
      expect(result).toBe(true);
      expect(mockRequest['user']).toEqual(mockPayload);
      expect(mockJwtService.verifyAsync).toHaveBeenCalledWith('valid-token');
    });

    it('should throw UnauthorizedException when no authorization header', async () => {
      // Arrange
      const mockRequest = {
        headers: {},
      };
      (mockExecutionContext.switchToHttp().getRequest as jest.Mock).mockReturnValue(mockRequest);

      // Act & Assert
      await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(UnauthorizedException);
      await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow('Access token is required');
      expect(mockJwtService.verifyAsync).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException when authorization header is malformed', async () => {
      // Arrange
      const mockRequest = {
        headers: {
          authorization: 'InvalidFormat token',
        },
      };
      (mockExecutionContext.switchToHttp().getRequest as jest.Mock).mockReturnValue(mockRequest);

      // Act & Assert
      await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(UnauthorizedException);
      await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow('Access token is required');
      expect(mockJwtService.verifyAsync).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException when token verification fails', async () => {
      // Arrange
      const mockRequest = {
        headers: {
          authorization: 'Bearer invalid-token',
        },
      };
      (mockExecutionContext.switchToHttp().getRequest as jest.Mock).mockReturnValue(mockRequest);
      mockJwtService.verifyAsync.mockRejectedValue(new Error('Invalid token'));

      // Act & Assert
      await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(UnauthorizedException);
      await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow('Invalid access token');
      expect(mockJwtService.verifyAsync).toHaveBeenCalledWith('invalid-token');
    });

    it('should handle authorization header with no token', async () => {
      // Arrange
      const mockRequest = {
        headers: {
          authorization: 'Bearer',
        },
      };
      (mockExecutionContext.switchToHttp().getRequest as jest.Mock).mockReturnValue(mockRequest);

      // Act & Assert
      await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(UnauthorizedException);
      await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow('Access token is required');
      expect(mockJwtService.verifyAsync).not.toHaveBeenCalled();
    });

    it('should handle empty authorization header', async () => {
      // Arrange
      const mockRequest = {
        headers: {
          authorization: '',
        },
      };
      (mockExecutionContext.switchToHttp().getRequest as jest.Mock).mockReturnValue(mockRequest);

      // Act & Assert
      await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(UnauthorizedException);
      await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow('Access token is required');
      expect(mockJwtService.verifyAsync).not.toHaveBeenCalled();
    });
  });
});
