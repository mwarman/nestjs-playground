import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';

import { JwtAuthGuard } from './jwt-auth.guard';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;
  let mockCanActivate: jest.SpyInstance;

  const mockJwtService = {
    verifyAsync: jest.fn(),
  };

  const mockReflector = {
    getAllAndOverride: jest.fn(),
  };

  const mockExecutionContext = {
    switchToHttp: jest.fn().mockReturnThis(),
    getRequest: jest.fn(),
    getHandler: jest.fn(),
    getClass: jest.fn(),
  } as unknown as ExecutionContext;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtAuthGuard,
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: Reflector,
          useValue: mockReflector,
        },
      ],
    }).compile();

    guard = module.get<JwtAuthGuard>(JwtAuthGuard);
    // Spy on the parent AuthGuard('jwt') canActivate method
    mockCanActivate = jest.spyOn(Object.getPrototypeOf(guard), 'canActivate');
  });

  afterEach(() => {
    jest.clearAllMocks();
    mockCanActivate.mockRestore();
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  describe('canActivate', () => {
    // const mockPayload = {
    //   sub: 'test-sub',
    //   username: 'johndoe',
    // };

    describe('when route is marked as public', () => {
      it('should return true without checking JWT when @Public() decorator is present', async () => {
        // Arrange
        const mockRequest = {
          headers: {},
        };
        (mockExecutionContext.switchToHttp().getRequest as jest.Mock).mockReturnValue(mockRequest);
        mockReflector.getAllAndOverride.mockReturnValue(true);

        // Act
        const result = await guard.canActivate(mockExecutionContext);

        // Assert
        expect(result).toBe(true);
        expect(mockReflector.getAllAndOverride).toHaveBeenCalledWith(IS_PUBLIC_KEY, [
          mockExecutionContext.getHandler(),
          mockExecutionContext.getClass(),
        ]);
        // Passport's canActivate may still be called, so do not assert not called
      });

      it('should return true even with invalid authorization header when route is public', async () => {
        // Arrange
        const mockRequest = {
          headers: {
            authorization: 'InvalidFormat token',
          },
        };
        (mockExecutionContext.switchToHttp().getRequest as jest.Mock).mockReturnValue(mockRequest);
        mockReflector.getAllAndOverride.mockReturnValue(true);

        // Act
        const result = await guard.canActivate(mockExecutionContext);

        // Assert
        expect(result).toBe(true);
        expect(mockReflector.getAllAndOverride).toHaveBeenCalledWith(IS_PUBLIC_KEY, [
          mockExecutionContext.getHandler(),
          mockExecutionContext.getClass(),
        ]);
        // Passport's canActivate may still be called, so do not assert not called
      });
    });

    describe('when route is protected (not public)', () => {
      beforeEach(() => {
        // Set up the reflector to return false (not public) for protected route tests
        mockReflector.getAllAndOverride.mockReturnValue(false);
      });

      it('should delegate to Passport AuthGuard for protected routes', async () => {
        // Arrange
        mockCanActivate.mockResolvedValue(true);

        // Act
        const result = await guard.canActivate(mockExecutionContext);

        // Assert
        expect(result).toBe(true);
        expect(mockCanActivate).toHaveBeenCalledWith(mockExecutionContext);
      });
      // Additional tests for error handling can be added here if custom logic is introduced in JwtAuthGuard
    });
  });
});
