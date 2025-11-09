/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
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
  let configService: jest.Mocked<ConfigService>;
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
    } as unknown as jest.Mocked<HealthIndicatorService>;

    // Create mock ConfigService
    const configServiceMock = {
      get: jest.fn(),
    } as unknown as jest.Mocked<ConfigService>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VersionHealthIndicator,
        { provide: HealthIndicatorService, useValue: healthIndicatorServiceMock },
        { provide: ConfigService, useValue: configServiceMock },
      ],
    }).compile();

    indicator = module.get<VersionHealthIndicator>(VersionHealthIndicator);
    healthIndicatorService = module.get(HealthIndicatorService);
    configService = module.get(ConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(indicator).toBeDefined();
  });

  describe('getValue', () => {
    const key = 'version';

    describe('when APP_VERSION is provided and valid', () => {
      it('should return healthy status with version from environment', () => {
        // Arrange
        configService.get.mockReturnValue('2.0.0');
        const expectedUpResult = { status: 'up', value: '2.0.0', source: 'env' };
        mockHealthCheck.up.mockReturnValue(expectedUpResult);

        // Act
        const result = indicator.getValue(key);

        // Assert
        expect(configService.get).toHaveBeenCalledWith('APP_VERSION', { infer: true });
        expect(healthIndicatorService.check).toHaveBeenCalledWith(key);
        expect(mockHealthCheck.up).toHaveBeenCalledWith({ value: '2.0.0', source: 'env' });
        expect(result).toBe(expectedUpResult);
        expect(mockHealthCheck.down).not.toHaveBeenCalled();
      });

      it('should prefer APP_VERSION over package.json version', () => {
        // Arrange
        configService.get.mockReturnValue('3.0.0');
        mockVersion.mockReturnValue('0.1.0');
        const expectedUpResult = { status: 'up', value: '3.0.0', source: 'env' };
        mockHealthCheck.up.mockReturnValue(expectedUpResult);

        // Act
        const result = indicator.getValue(key);

        // Assert
        expect(configService.get).toHaveBeenCalledWith('APP_VERSION', { infer: true });
        expect(mockHealthCheck.up).toHaveBeenCalledWith({ value: '3.0.0', source: 'env' });
        expect(result).toBe(expectedUpResult);
      });

      it('should support semver with build metadata', () => {
        // Arrange
        configService.get.mockReturnValue('1.2.3-build.456');
        const expectedUpResult = { status: 'up', value: '1.2.3-build.456', source: 'env' };
        mockHealthCheck.up.mockReturnValue(expectedUpResult);

        // Act
        const result = indicator.getValue(key);

        // Assert
        expect(mockHealthCheck.up).toHaveBeenCalledWith({ value: '1.2.3-build.456', source: 'env' });
        expect(result).toBe(expectedUpResult);
      });
    });

    describe('when APP_VERSION is not provided', () => {
      it('should fallback to package.json version when APP_VERSION is undefined', () => {
        // Arrange
        configService.get.mockReturnValue(undefined);
        mockVersion.mockReturnValue('0.1.0');
        const expectedUpResult = { status: 'up', value: '0.1.0', source: 'package.json' };
        mockHealthCheck.up.mockReturnValue(expectedUpResult);

        // Act
        const result = indicator.getValue(key);

        // Assert
        expect(configService.get).toHaveBeenCalledWith('APP_VERSION', { infer: true });
        expect(healthIndicatorService.check).toHaveBeenCalledWith(key);
        expect(mockHealthCheck.up).toHaveBeenCalledWith({ value: '0.1.0', source: 'package.json' });
        expect(result).toBe(expectedUpResult);
        expect(mockHealthCheck.down).not.toHaveBeenCalled();
      });

      it('should fallback to package.json version when APP_VERSION is empty string', () => {
        // Arrange
        configService.get.mockReturnValue('');
        mockVersion.mockReturnValue('0.1.0');
        const expectedUpResult = { status: 'up', value: '0.1.0', source: 'package.json' };
        mockHealthCheck.up.mockReturnValue(expectedUpResult);

        // Act
        const result = indicator.getValue(key);

        // Assert
        expect(mockHealthCheck.up).toHaveBeenCalledWith({ value: '0.1.0', source: 'package.json' });
        expect(result).toBe(expectedUpResult);
      });
    });

    describe('when APP_VERSION is invalid semver', () => {
      it('should fallback to package.json when APP_VERSION is not valid semver', () => {
        // Arrange
        configService.get.mockReturnValue('invalid-version');
        mockVersion.mockReturnValue('0.1.0');
        const expectedUpResult = { status: 'up', value: '0.1.0', source: 'package.json' };
        mockHealthCheck.up.mockReturnValue(expectedUpResult);

        // Act
        const result = indicator.getValue(key);

        // Assert
        expect(mockHealthCheck.up).toHaveBeenCalledWith({ value: '0.1.0', source: 'package.json' });
        expect(result).toBe(expectedUpResult);
      });
    });

    describe('when no valid version is available', () => {
      it('should return unhealthy status when both APP_VERSION and package.json version are undefined', () => {
        // Arrange
        configService.get.mockReturnValue(undefined);
        mockVersion.mockReturnValue(undefined);
        const expectedDownResult = { status: 'down', error: 'Version not found or not valid semver' };
        mockHealthCheck.down.mockReturnValue(expectedDownResult);

        // Act
        const result = indicator.getValue(key);

        // Assert
        expect(healthIndicatorService.check).toHaveBeenCalledWith(key);
        expect(mockHealthCheck.down).toHaveBeenCalledWith({ error: 'Version not found or not valid semver' });
        expect(result).toBe(expectedDownResult);
        expect(mockHealthCheck.up).not.toHaveBeenCalled();
      });

      it('should return unhealthy status when both are empty strings', () => {
        // Arrange
        configService.get.mockReturnValue('');
        mockVersion.mockReturnValue('');
        const expectedDownResult = { status: 'down', error: 'Version not found or not valid semver' };
        mockHealthCheck.down.mockReturnValue(expectedDownResult);

        // Act
        const result = indicator.getValue(key);

        // Assert
        expect(mockHealthCheck.down).toHaveBeenCalledWith({ error: 'Version not found or not valid semver' });
        expect(result).toBe(expectedDownResult);
        expect(mockHealthCheck.up).not.toHaveBeenCalled();
      });

      it('should return unhealthy status when both are invalid semver', () => {
        // Arrange
        configService.get.mockReturnValue('not-semver');
        mockVersion.mockReturnValue('also-not-semver');
        const expectedDownResult = { status: 'down', error: 'Version not found or not valid semver' };
        mockHealthCheck.down.mockReturnValue(expectedDownResult);

        // Act
        const result = indicator.getValue(key);

        // Assert
        expect(mockHealthCheck.down).toHaveBeenCalledWith({ error: 'Version not found or not valid semver' });
        expect(result).toBe(expectedDownResult);
      });
    });

    describe('key parameter', () => {
      it('should use the provided key parameter when calling health check', () => {
        // Arrange
        const customKey = 'application-version';
        configService.get.mockReturnValue('1.0.0');
        mockHealthCheck.up.mockReturnValue({ status: 'up', value: '1.0.0', source: 'env' });

        // Act
        indicator.getValue(customKey);

        // Assert
        expect(healthIndicatorService.check).toHaveBeenCalledWith(customKey);
      });
    });
  });
});
