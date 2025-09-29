/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { HealthCheckService, HealthCheckResult, HealthIndicatorResult } from '@nestjs/terminus';
import { TypeOrmHealthIndicator } from '@nestjs/terminus';

import { HealthController } from './health.controller';
import { VersionHealthIndicator } from './indicators/version.health';

describe('HealthController', () => {
  let controller: HealthController;
  let healthCheckService: HealthCheckService;
  let typeOrmHealthIndicator: TypeOrmHealthIndicator;
  let versionHealthIndicator: VersionHealthIndicator;

  beforeEach(async () => {
    const healthCheckServiceMock = {
      check: jest.fn(),
    };

    const typeOrmHealthIndicatorMock = {
      pingCheck: jest.fn(),
    };

    const versionHealthIndicatorMock = {
      isHealthy: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        { provide: HealthCheckService, useValue: healthCheckServiceMock },
        { provide: TypeOrmHealthIndicator, useValue: typeOrmHealthIndicatorMock },
        { provide: VersionHealthIndicator, useValue: versionHealthIndicatorMock },
      ],
    }).compile();

    controller = module.get<HealthController>(HealthController);
    healthCheckService = module.get(HealthCheckService);
    typeOrmHealthIndicator = module.get(TypeOrmHealthIndicator);
    versionHealthIndicator = module.get(VersionHealthIndicator);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('checkHealth', () => {
    it('should perform health checks and return results when all checks pass', async () => {
      // Arrange
      const expectedResult: HealthCheckResult = {
        status: 'ok',
        info: {
          database: { status: 'up' },
          version: { status: 'up', version: '0.1.0' },
        },
        error: {},
        details: {
          database: { status: 'up' },
          version: { status: 'up', version: '0.1.0' },
        },
      };

      const databaseHealthResult: HealthIndicatorResult = { database: { status: 'up' } };
      const versionHealthResult = { version: { status: 'up', version: '0.1.0' } };

      (typeOrmHealthIndicator.pingCheck as jest.Mock).mockResolvedValue(databaseHealthResult);
      (versionHealthIndicator.isHealthy as jest.Mock).mockReturnValue(versionHealthResult);
      (healthCheckService.check as jest.Mock).mockResolvedValue(expectedResult);

      // Act
      const result = await controller.checkHealth();

      // Assert
      expect(result).toBe(expectedResult);
      expect(healthCheckService.check).toHaveBeenCalledTimes(1);
      expect(healthCheckService.check).toHaveBeenCalledWith([expect.any(Function), expect.any(Function)]);
    });

    it('should call TypeOrmHealthIndicator.pingCheck with correct parameters', async () => {
      // Arrange
      const expectedResult: HealthCheckResult = {
        status: 'ok',
        info: {},
        error: {},
        details: {},
      };
      (typeOrmHealthIndicator.pingCheck as jest.Mock).mockResolvedValue({ database: { status: 'up' } });
      (versionHealthIndicator.isHealthy as jest.Mock).mockReturnValue({ version: { status: 'up', version: '0.1.0' } });
      (healthCheckService.check as jest.Mock).mockResolvedValue(expectedResult);

      // Act
      await controller.checkHealth();

      // Get the functions passed to check() and call the first one (database check)
      const checkCalls = (healthCheckService.check as jest.Mock).mock
        .calls[0][0] as (() => Promise<HealthIndicatorResult>)[];
      await checkCalls[0]();

      // Assert
      expect(typeOrmHealthIndicator.pingCheck).toHaveBeenCalledWith('database');
    });

    it('should call VersionHealthIndicator.isHealthy with correct parameters', async () => {
      // Arrange
      const expectedResult: HealthCheckResult = {
        status: 'ok',
        info: {},
        error: {},
        details: {},
      };
      (typeOrmHealthIndicator.pingCheck as jest.Mock).mockResolvedValue({ database: { status: 'up' } });
      (versionHealthIndicator.isHealthy as jest.Mock).mockReturnValue({ version: { status: 'up', version: '0.1.0' } });
      (healthCheckService.check as jest.Mock).mockResolvedValue(expectedResult);

      // Act
      await controller.checkHealth();

      // Get the functions passed to check() and call the second one (version check)
      const checkCalls = (healthCheckService.check as jest.Mock).mock.calls[0][0] as (() => HealthIndicatorResult)[];
      checkCalls[1]();

      // Assert
      expect(versionHealthIndicator.isHealthy).toHaveBeenCalledWith('version');
    });

    it('should handle health check failures gracefully', async () => {
      // Arrange
      const expectedResult: HealthCheckResult = {
        status: 'error',
        info: {},
        error: {
          database: { status: 'down', message: 'Connection failed' },
          version: { status: 'down', error: 'Version not found' },
        },
        details: {
          database: { status: 'down', message: 'Connection failed' },
          version: { status: 'down', error: 'Version not found' },
        },
      };

      (typeOrmHealthIndicator.pingCheck as jest.Mock).mockRejectedValue(new Error('Connection failed'));
      (versionHealthIndicator.isHealthy as jest.Mock).mockReturnValue({
        version: { status: 'down', error: 'Version not found' },
      });
      (healthCheckService.check as jest.Mock).mockResolvedValue(expectedResult);

      // Act
      const result = await controller.checkHealth();

      // Assert
      expect(result).toBe(expectedResult);
      expect(healthCheckService.check).toHaveBeenCalledTimes(1);
    });

    it('should pass the correct number of health check functions', async () => {
      // Arrange
      const expectedResult: HealthCheckResult = {
        status: 'ok',
        info: {},
        error: {},
        details: {},
      };
      (typeOrmHealthIndicator.pingCheck as jest.Mock).mockResolvedValue({ database: { status: 'up' } });
      (versionHealthIndicator.isHealthy as jest.Mock).mockReturnValue({ version: { status: 'up', version: '0.1.0' } });
      (healthCheckService.check as jest.Mock).mockResolvedValue(expectedResult);

      // Act
      await controller.checkHealth();

      // Assert
      const checkCalls = (healthCheckService.check as jest.Mock).mock.calls[0][0] as (() => unknown)[];
      expect(checkCalls).toHaveLength(2);
      expect(typeof checkCalls[0]).toBe('function'); // Database check function
      expect(typeof checkCalls[1]).toBe('function'); // Version check function
    });

    it('should return health check service result directly', async () => {
      // Arrange
      const mockHealthResult: HealthCheckResult = {
        status: 'ok',
        info: { database: { status: 'up' }, version: { status: 'up' } },
        error: {},
        details: { database: { status: 'up' }, version: { status: 'up' } },
      };

      (typeOrmHealthIndicator.pingCheck as jest.Mock).mockResolvedValue({ database: { status: 'up' } });
      (versionHealthIndicator.isHealthy as jest.Mock).mockReturnValue({ version: { status: 'up', version: '0.1.0' } });
      (healthCheckService.check as jest.Mock).mockResolvedValue(mockHealthResult);

      // Act
      const result = await controller.checkHealth();

      // Assert
      expect(result).toBe(mockHealthResult);
    });
  });
});
