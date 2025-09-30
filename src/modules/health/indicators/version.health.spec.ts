/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { HealthIndicatorService } from '@nestjs/terminus';

import { VersionHealthIndicator } from './version.health';

// Mock the package.json import at the module level
const mockVersion = jest.fn<string | undefined, []>();
jest.mock('../../../../package.json', () => ({
  get version(): string | undefined {
    return mockVersion();
  },
}));

describe('VersionHealthIndicator', () => {
  let indicator: VersionHealthIndicator;
  let healthIndicatorService: jest.Mocked<HealthIndicatorService>;
  let mockHealthCheck: { up: jest.Mock; down: jest.Mock };

  beforeEach(async () => {
    // Reset the version mock before each test
    mockVersion.mockReturnValue('0.1.0');

    // Create mock health check object
    mockHealthCheck = {
      up: jest.fn(),
      down: jest.fn(),
    };

    // Create mock HealthIndicatorService
    const healthIndicatorServiceMock = {
      check: jest.fn().mockReturnValue(mockHealthCheck),
    } as jest.Mocked<HealthIndicatorService>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [VersionHealthIndicator, { provide: HealthIndicatorService, useValue: healthIndicatorServiceMock }],
    }).compile();

    indicator = module.get<VersionHealthIndicator>(VersionHealthIndicator);
    healthIndicatorService = module.get(HealthIndicatorService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(indicator).toBeDefined();
  });

  describe('isHealthy', () => {
    const key = 'version';

    it('should return healthy status when version is available', () => {
      // Arrange
      const expectedUpResult = { status: 'up', version: '0.1.0' };
      mockHealthCheck.up.mockReturnValue(expectedUpResult);

      // Act
      const result = indicator.getVersion(key);

      // Assert
      expect(healthIndicatorService.check).toHaveBeenCalledWith(key);
      expect(mockHealthCheck.up).toHaveBeenCalledWith({ version: '0.1.0' });
      expect(result).toBe(expectedUpResult);
      expect(mockHealthCheck.down).not.toHaveBeenCalled();
    });

    it('should return unhealthy status when version is undefined', () => {
      // Arrange
      mockVersion.mockReturnValue(undefined);
      const expectedDownResult = { status: 'down', error: 'Version not found' };
      mockHealthCheck.down.mockReturnValue(expectedDownResult);

      // Act
      const result = indicator.getVersion(key);

      // Assert
      expect(healthIndicatorService.check).toHaveBeenCalledWith(key);
      expect(mockHealthCheck.down).toHaveBeenCalledWith({ error: 'Version not found' });
      expect(result).toBe(expectedDownResult);
      expect(mockHealthCheck.up).not.toHaveBeenCalled();
    });

    it('should return unhealthy status when version is null', () => {
      // Arrange
      mockVersion.mockReturnValue(undefined);
      const expectedDownResult = { status: 'down', error: 'Version not found' };
      mockHealthCheck.down.mockReturnValue(expectedDownResult);

      // Act
      const result = indicator.getVersion(key);

      // Assert
      expect(healthIndicatorService.check).toHaveBeenCalledWith(key);
      expect(mockHealthCheck.down).toHaveBeenCalledWith({ error: 'Version not found' });
      expect(result).toBe(expectedDownResult);
      expect(mockHealthCheck.up).not.toHaveBeenCalled();
    });

    it('should return unhealthy status when version is empty string', () => {
      // Arrange
      mockVersion.mockReturnValue('');
      const expectedDownResult = { status: 'down', error: 'Version not found' };
      mockHealthCheck.down.mockReturnValue(expectedDownResult);

      // Act
      const result = indicator.getVersion(key);

      // Assert
      expect(healthIndicatorService.check).toHaveBeenCalledWith(key);
      expect(mockHealthCheck.down).toHaveBeenCalledWith({ error: 'Version not found' });
      expect(result).toBe(expectedDownResult);
      expect(mockHealthCheck.up).not.toHaveBeenCalled();
    });

    it('should use the provided key parameter when calling health check', () => {
      // Arrange
      const customKey = 'application-version';
      mockHealthCheck.up.mockReturnValue({ status: 'up', version: '0.1.0' });

      // Act
      indicator.getVersion(customKey);

      // Assert
      expect(healthIndicatorService.check).toHaveBeenCalledWith(customKey);
    });
  });
});
