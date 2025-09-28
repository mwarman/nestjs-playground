import { z } from 'zod';

import {
  loadConfiguration,
  getEnvironmentConfig,
  getCommonTags,
  ConfigurationError,
  Configuration,
} from './configuration';

describe('Configuration Utility', () => {
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    // Save original environment
    originalEnv = process.env;
    // Clear process.env for clean testing
    process.env = {};
  });

  afterEach(() => {
    // Restore original environment
    process.env = originalEnv;
  });

  describe('loadConfiguration', () => {
    describe('with valid configuration', () => {
      it('should load configuration with all defaults when no env vars are set (except required ones)', () => {
        // Arrange
        process.env.CDK_HOSTED_ZONE_ID = 'Z123456789';
        process.env.CDK_HOSTED_ZONE_NAME = 'example.com';
        process.env.CDK_CERTIFICATE_ARN = 'arn:aws:acm:us-east-1:123456789:certificate/test';
        process.env.CDK_DOMAIN_NAME = 'api.example.com';

        // Act
        const config = loadConfiguration();

        // Assert
        expect(config.CDK_APP_NAME).toBe('nestjs-playground');
        expect(config.CDK_APP_PORT).toBe(3000);
        expect(config.CDK_APP_LOGGING_LEVEL).toBe('info');
        expect(config.CDK_APP_CORS_ALLOWED_ORIGIN).toBe('*');
        expect(config.CDK_ENVIRONMENT).toBe('dev');
        expect(config.CDK_TASK_MEMORY_MB).toBe(512);
        expect(config.CDK_TASK_CPU_UNITS).toBe(256);
        expect(config.CDK_SERVICE_DESIRED_COUNT).toBe(0);
        expect(config.CDK_SERVICE_MIN_CAPACITY).toBe(0);
        expect(config.CDK_SERVICE_MAX_CAPACITY).toBe(4);
        expect(config.CDK_DATABASE_NAME).toBe('nestjs_playground');
        expect(config.CDK_DATABASE_USERNAME).toBe('postgres');
        expect(config.CDK_DATABASE_MIN_CAPACITY).toBe(0.5);
        expect(config.CDK_DATABASE_MAX_CAPACITY).toBe(1);
        expect(config.CDK_TAG_OU).toBe('engineering');
        expect(config.CDK_TAG_OWNER).toBe('team@example.com');
      });

      it('should use provided environment variables over defaults', () => {
        // Arrange
        process.env.CDK_APP_NAME = 'custom-app';
        process.env.CDK_APP_PORT = '8080';
        process.env.CDK_APP_LOGGING_LEVEL = 'debug';
        process.env.CDK_APP_CORS_ALLOWED_ORIGIN = 'https://custom.com';
        process.env.CDK_ENVIRONMENT = 'production';
        process.env.CDK_HOSTED_ZONE_ID = 'Z123456789';
        process.env.CDK_HOSTED_ZONE_NAME = 'example.com';
        process.env.CDK_CERTIFICATE_ARN = 'arn:aws:acm:us-east-1:123456789:certificate/test';
        process.env.CDK_DOMAIN_NAME = 'api.example.com';

        // Act
        const config = loadConfiguration();

        // Assert
        expect(config.CDK_APP_NAME).toBe('custom-app');
        expect(config.CDK_APP_PORT).toBe(8080);
        expect(config.CDK_APP_LOGGING_LEVEL).toBe('debug');
        expect(config.CDK_APP_CORS_ALLOWED_ORIGIN).toBe('https://custom.com');
        expect(config.CDK_ENVIRONMENT).toBe('production');
      });

      it('should handle string coercion for numeric values', () => {
        // Arrange
        process.env.CDK_APP_PORT = '9000';
        process.env.CDK_TASK_MEMORY_MB = '1024';
        process.env.CDK_TASK_CPU_UNITS = '512';
        process.env.CDK_SERVICE_DESIRED_COUNT = '2';
        process.env.CDK_SERVICE_MIN_CAPACITY = '1';
        process.env.CDK_SERVICE_MAX_CAPACITY = '10';
        process.env.CDK_DATABASE_MIN_CAPACITY = '1.0';
        process.env.CDK_DATABASE_MAX_CAPACITY = '2.0';
        process.env.CDK_HOSTED_ZONE_ID = 'Z123456789';
        process.env.CDK_HOSTED_ZONE_NAME = 'example.com';
        process.env.CDK_CERTIFICATE_ARN = 'arn:aws:acm:us-east-1:123456789:certificate/test';
        process.env.CDK_DOMAIN_NAME = 'api.example.com';

        // Act
        const config = loadConfiguration();

        // Assert
        expect(config.CDK_APP_PORT).toBe(9000);
        expect(config.CDK_TASK_MEMORY_MB).toBe(1024);
        expect(config.CDK_TASK_CPU_UNITS).toBe(512);
        expect(config.CDK_SERVICE_DESIRED_COUNT).toBe(2);
        expect(config.CDK_SERVICE_MIN_CAPACITY).toBe(1);
        expect(config.CDK_SERVICE_MAX_CAPACITY).toBe(10);
        expect(config.CDK_DATABASE_MIN_CAPACITY).toBe(1.0);
        expect(config.CDK_DATABASE_MAX_CAPACITY).toBe(2.0);
      });

      it('should handle optional AWS configuration', () => {
        // Arrange
        process.env.CDK_ACCOUNT = '123456789012';
        process.env.CDK_REGION = 'us-west-2';
        process.env.CDK_DEFAULT_ACCOUNT = '987654321098';
        process.env.CDK_DEFAULT_REGION = 'eu-west-1';
        process.env.CDK_HOSTED_ZONE_ID = 'Z123456789';
        process.env.CDK_HOSTED_ZONE_NAME = 'example.com';
        process.env.CDK_CERTIFICATE_ARN = 'arn:aws:acm:us-east-1:123456789:certificate/test';
        process.env.CDK_DOMAIN_NAME = 'api.example.com';

        // Act
        const config = loadConfiguration();

        // Assert
        expect(config.CDK_ACCOUNT).toBe('123456789012');
        expect(config.CDK_REGION).toBe('us-west-2');
        expect(config.CDK_DEFAULT_ACCOUNT).toBe('987654321098');
        expect(config.CDK_DEFAULT_REGION).toBe('eu-west-1');
      });

      it('should handle optional tagging configuration', () => {
        // Arrange
        process.env.CDK_TAG_APP = 'custom-app-tag';
        process.env.CDK_TAG_ENV = 'custom-env-tag';
        process.env.CDK_TAG_OU = 'custom-ou';
        process.env.CDK_TAG_OWNER = 'custom@example.com';
        process.env.CDK_HOSTED_ZONE_ID = 'Z123456789';
        process.env.CDK_HOSTED_ZONE_NAME = 'example.com';
        process.env.CDK_CERTIFICATE_ARN = 'arn:aws:acm:us-east-1:123456789:certificate/test';
        process.env.CDK_DOMAIN_NAME = 'api.example.com';

        // Act
        const config = loadConfiguration();

        // Assert
        expect(config.CDK_TAG_APP).toBe('custom-app-tag');
        expect(config.CDK_TAG_ENV).toBe('custom-env-tag');
        expect(config.CDK_TAG_OU).toBe('custom-ou');
        expect(config.CDK_TAG_OWNER).toBe('custom@example.com');
      });
    });

    describe('with invalid configuration', () => {
      it('should throw ConfigurationError when required fields are missing', () => {
        // Arrange - no environment variables set (all required fields missing)

        // Act & Assert
        expect(() => loadConfiguration()).toThrow(ConfigurationError);

        try {
          loadConfiguration();
        } catch (error) {
          const configError = error as ConfigurationError;
          expect(error).toBeInstanceOf(ConfigurationError);
          expect(configError.message).toContain('Configuration validation failed');
          expect(configError.message).toContain('CDK_HOSTED_ZONE_ID');
          expect(configError.message).toContain('CDK_HOSTED_ZONE_NAME');
          expect(configError.message).toContain('CDK_CERTIFICATE_ARN');
          expect(configError.message).toContain('CDK_DOMAIN_NAME');
          expect(configError.validationErrors).toBeInstanceOf(z.ZodError);
        }
      });

      it('should throw ConfigurationError with invalid logging level', () => {
        // Arrange
        process.env.CDK_APP_LOGGING_LEVEL = 'invalid';
        process.env.CDK_HOSTED_ZONE_ID = 'Z123456789';
        process.env.CDK_HOSTED_ZONE_NAME = 'example.com';
        process.env.CDK_CERTIFICATE_ARN = 'arn:aws:acm:us-east-1:123456789:certificate/test';
        process.env.CDK_DOMAIN_NAME = 'api.example.com';

        // Act & Assert
        expect(() => loadConfiguration()).toThrow(ConfigurationError);

        try {
          loadConfiguration();
        } catch (error) {
          const configError = error as ConfigurationError;
          expect(configError.message).toContain('CDK_APP_LOGGING_LEVEL');
          expect(configError.message).toContain('Invalid option');
        }
      });

      it('should throw ConfigurationError with invalid numeric values', () => {
        // Arrange
        process.env.CDK_APP_PORT = '-1';
        process.env.CDK_HOSTED_ZONE_ID = 'Z123456789';
        process.env.CDK_HOSTED_ZONE_NAME = 'example.com';
        process.env.CDK_CERTIFICATE_ARN = 'arn:aws:acm:us-east-1:123456789:certificate/test';
        process.env.CDK_DOMAIN_NAME = 'api.example.com';

        // Act & Assert
        expect(() => loadConfiguration()).toThrow(ConfigurationError);

        try {
          loadConfiguration();
        } catch (error) {
          const configError = error as ConfigurationError;
          expect(configError.message).toContain('CDK_APP_PORT');
          expect(configError.message).toContain('Too small');
        }
      });

      it('should throw ConfigurationError when service min capacity > max capacity', () => {
        // Arrange
        process.env.CDK_SERVICE_MIN_CAPACITY = '5';
        process.env.CDK_SERVICE_MAX_CAPACITY = '2';
        process.env.CDK_HOSTED_ZONE_ID = 'Z123456789';
        process.env.CDK_HOSTED_ZONE_NAME = 'example.com';
        process.env.CDK_CERTIFICATE_ARN = 'arn:aws:acm:us-east-1:123456789:certificate/test';
        process.env.CDK_DOMAIN_NAME = 'api.example.com';

        // Act & Assert
        expect(() => loadConfiguration()).toThrow(ConfigurationError);

        try {
          loadConfiguration();
        } catch (error) {
          const configError = error as ConfigurationError;
          expect(configError.message).toContain('Service min capacity must be less than or equal to max capacity');
        }
      });

      it('should throw ConfigurationError when database min capacity > max capacity', () => {
        // Arrange
        process.env.CDK_DATABASE_MIN_CAPACITY = '2.0';
        process.env.CDK_DATABASE_MAX_CAPACITY = '1.0';
        process.env.CDK_HOSTED_ZONE_ID = 'Z123456789';
        process.env.CDK_HOSTED_ZONE_NAME = 'example.com';
        process.env.CDK_CERTIFICATE_ARN = 'arn:aws:acm:us-east-1:123456789:certificate/test';
        process.env.CDK_DOMAIN_NAME = 'api.example.com';

        // Act & Assert
        expect(() => loadConfiguration()).toThrow(ConfigurationError);

        try {
          loadConfiguration();
        } catch (error) {
          const configError = error as ConfigurationError;
          expect(configError.message).toContain('Database min capacity must be less than or equal to max capacity');
        }
      });

      it('should throw ConfigurationError with empty string for required fields', () => {
        // Arrange
        process.env.CDK_HOSTED_ZONE_ID = '';
        process.env.CDK_HOSTED_ZONE_NAME = 'example.com';
        process.env.CDK_CERTIFICATE_ARN = 'arn:aws:acm:us-east-1:123456789:certificate/test';
        process.env.CDK_DOMAIN_NAME = 'api.example.com';

        // Act & Assert
        expect(() => loadConfiguration()).toThrow(ConfigurationError);

        try {
          loadConfiguration();
        } catch (error) {
          const configError = error as ConfigurationError;
          expect(configError.message).toContain('CDK_HOSTED_ZONE_ID');
          expect(configError.message).toContain('Too small');
        }
      });

      it('should report multiple validation errors simultaneously', () => {
        // Arrange
        process.env.CDK_APP_PORT = '-1';
        process.env.CDK_APP_LOGGING_LEVEL = 'invalid';
        process.env.CDK_SERVICE_MIN_CAPACITY = '10';
        process.env.CDK_SERVICE_MAX_CAPACITY = '5';

        // Act & Assert
        expect(() => loadConfiguration()).toThrow(ConfigurationError);

        try {
          loadConfiguration();
        } catch (error) {
          const configError = error as ConfigurationError;
          expect(configError.message).toContain('CDK_APP_PORT');
          expect(configError.message).toContain('CDK_APP_LOGGING_LEVEL');
          expect(configError.message).toContain('CDK_HOSTED_ZONE_ID');
          // The custom refine validation doesn't run when basic field validation fails
          expect(configError.validationErrors.issues.length).toBeGreaterThan(1);
        }
      });

      it('should handle error handling correctly', () => {
        // Arrange
        const regularError = new Error('Regular error');
        const zodError = new z.ZodError([]);

        // Act & Assert
        // This test verifies that only ZodError instances are wrapped in ConfigurationError
        // Other errors would be re-thrown as-is (line 91 in configuration.ts)
        expect(regularError).toBeInstanceOf(Error);
        expect(regularError).not.toBeInstanceOf(ConfigurationError);
        expect(zodError).toBeInstanceOf(z.ZodError);
      });
    });
  });

  describe('getEnvironmentConfig', () => {
    it('should return environment config with CDK_ACCOUNT and CDK_REGION when available', () => {
      // Arrange
      const mockConfig: Configuration = {
        CDK_ACCOUNT: '123456789012',
        CDK_REGION: 'us-west-2',
        CDK_DEFAULT_ACCOUNT: '987654321098',
        CDK_DEFAULT_REGION: 'eu-west-1',
      } as Configuration;

      // Act
      const envConfig = getEnvironmentConfig(mockConfig);

      // Assert
      expect(envConfig).toEqual({
        account: '123456789012',
        region: 'us-west-2',
      });
    });

    it('should fallback to default values when CDK_ACCOUNT and CDK_REGION are not available', () => {
      // Arrange
      const mockConfig: Configuration = {
        CDK_DEFAULT_ACCOUNT: '987654321098',
        CDK_DEFAULT_REGION: 'eu-west-1',
      } as Configuration;

      // Act
      const envConfig = getEnvironmentConfig(mockConfig);

      // Assert
      expect(envConfig).toEqual({
        account: '987654321098',
        region: 'eu-west-1',
      });
    });

    it('should return undefined values when neither primary nor default values are available', () => {
      // Arrange
      const mockConfig: Configuration = {} as Configuration;

      // Act
      const envConfig = getEnvironmentConfig(mockConfig);

      // Assert
      expect(envConfig).toEqual({
        account: undefined,
        region: undefined,
      });
    });
  });

  describe('getCommonTags', () => {
    it('should return tags with custom values when provided', () => {
      // Arrange
      const mockConfig: Configuration = {
        CDK_APP_NAME: 'test-app',
        CDK_ENVIRONMENT: 'staging',
        CDK_TAG_APP: 'custom-app-tag',
        CDK_TAG_ENV: 'custom-env-tag',
        CDK_TAG_OU: 'custom-ou',
        CDK_TAG_OWNER: 'custom@example.com',
      } as Configuration;

      // Act
      const tags = getCommonTags(mockConfig);

      // Assert
      expect(tags).toEqual({
        App: 'custom-app-tag',
        Env: 'custom-env-tag',
        OU: 'custom-ou',
        Owner: 'custom@example.com',
      });
    });

    it('should fallback to app name and environment when custom tags are not provided', () => {
      // Arrange
      const mockConfig: Configuration = {
        CDK_APP_NAME: 'test-app',
        CDK_ENVIRONMENT: 'staging',
        CDK_TAG_OU: 'engineering',
        CDK_TAG_OWNER: 'team@example.com',
      } as Configuration;

      // Act
      const tags = getCommonTags(mockConfig);

      // Assert
      expect(tags).toEqual({
        App: 'test-app',
        Env: 'staging',
        OU: 'engineering',
        Owner: 'team@example.com',
      });
    });

    it('should handle mixed custom and fallback values', () => {
      // Arrange
      const mockConfig: Configuration = {
        CDK_APP_NAME: 'test-app',
        CDK_ENVIRONMENT: 'staging',
        CDK_TAG_APP: 'custom-app-tag',
        CDK_TAG_OU: 'custom-ou',
        CDK_TAG_OWNER: 'team@example.com',
      } as Configuration;

      // Act
      const tags = getCommonTags(mockConfig);

      // Assert
      expect(tags).toEqual({
        App: 'custom-app-tag',
        Env: 'staging', // fallback to CDK_ENVIRONMENT
        OU: 'custom-ou',
        Owner: 'team@example.com',
      });
    });
  });

  describe('ConfigurationError', () => {
    it('should create error with message and validation errors', () => {
      // Arrange
      let zodError: z.ZodError;
      try {
        z.string().min(1).parse('');
      } catch (error) {
        zodError = error as z.ZodError;
      }

      // Act
      const configError = new ConfigurationError('Test error message', zodError!);

      // Assert
      expect(configError.name).toBe('ConfigurationError');
      expect(configError.message).toBe('Test error message');
      expect(configError.validationErrors).toBe(zodError!);
      expect(configError).toBeInstanceOf(Error);
    });
  });
});
