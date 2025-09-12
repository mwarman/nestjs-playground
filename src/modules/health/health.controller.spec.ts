import { Test, TestingModule } from '@nestjs/testing';
import { HealthCheckService } from '@nestjs/terminus';
import { TypeOrmHealthIndicator } from '@nestjs/terminus';

import { HealthController } from './health.controller';

describe('HealthController', () => {
  let controller: HealthController;
  let healthCheckService: HealthCheckService;
  let typeOrmHealthIndicator: TypeOrmHealthIndicator;

  beforeEach(async () => {
    const healthCheckServiceMock = {
      check: jest.fn(),
    };
    const typeOrmHealthIndicatorMock = {
      pingCheck: jest.fn(),
    };
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        { provide: HealthCheckService, useValue: healthCheckServiceMock },
        { provide: TypeOrmHealthIndicator, useValue: typeOrmHealthIndicatorMock },
      ],
    }).compile();

    controller = module.get<HealthController>(HealthController);
    healthCheckService = module.get<HealthCheckService>(HealthCheckService);
    typeOrmHealthIndicator = module.get<TypeOrmHealthIndicator>(TypeOrmHealthIndicator);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call health.check with TypeOrmHealthIndicator', async () => {
    // Arrange
    const result = { status: 'ok' };
    (healthCheckService.check as jest.Mock).mockResolvedValue(result);
    (typeOrmHealthIndicator.pingCheck as jest.Mock).mockResolvedValue({ database: { status: 'up' } });

    // Act
    const response = await controller.check();

    // Assert
    expect(response).toBe(result);
  });
});
