import {
  validate,
  Config,
  DEFAULT_APP_PORT,
  DEFAULT_LOGGING_LEVEL,
  DEFAULT_CORS_ALLOWED_ORIGIN,
  DEFAULT_JWT_SECRET,
  DEFAULT_JWT_EXPIRES_IN,
  DEFAULT_DB_HOST,
  DEFAULT_DB_PORT,
  DEFAULT_DB_USER,
  DEFAULT_DB_PASS,
  DEFAULT_DB_DATABASE,
} from './configuration';

describe('Configuration', () => {
  describe('validate', () => {
    it('should be defined', () => {
      expect(validate).toBeDefined();
    });

    it('should validate and return config with default values when no input provided', () => {
      // Arrange
      const input = {};

      // Act
      const result = validate(input);

      // Assert
      expect(result).toEqual({
        APP_PORT: DEFAULT_APP_PORT,
        LOGGING_LEVEL: DEFAULT_LOGGING_LEVEL,
        CORS_ALLOWED_ORIGIN: DEFAULT_CORS_ALLOWED_ORIGIN,
        JWT_SECRET: DEFAULT_JWT_SECRET,
        JWT_EXPIRES_IN: DEFAULT_JWT_EXPIRES_IN,
        DB_HOST: DEFAULT_DB_HOST,
        DB_PORT: DEFAULT_DB_PORT,
        DB_USER: DEFAULT_DB_USER,
        DB_PASS: DEFAULT_DB_PASS,
        DB_DATABASE: DEFAULT_DB_DATABASE,
        DB_MIGRATIONS_RUN: true,
        DB_SSL: true,
      });
      expect(result).not.toHaveProperty('APP_VERSION');
      expect(result).not.toHaveProperty('SCHEDULE_TASK_CLEANUP_CRON');
    });

    it('should validate and return config with provided valid values', () => {
      // Arrange
      const input = {
        APP_PORT: 8080,
        LOGGING_LEVEL: 'debug',
      };

      // Act
      const result = validate(input);

      // Assert
      expect(result).toEqual({
        APP_PORT: 8080,
        LOGGING_LEVEL: 'debug',
        CORS_ALLOWED_ORIGIN: DEFAULT_CORS_ALLOWED_ORIGIN,
        JWT_SECRET: DEFAULT_JWT_SECRET,
        JWT_EXPIRES_IN: DEFAULT_JWT_EXPIRES_IN,
        DB_HOST: DEFAULT_DB_HOST,
        DB_PORT: DEFAULT_DB_PORT,
        DB_USER: DEFAULT_DB_USER,
        DB_PASS: DEFAULT_DB_PASS,
        DB_DATABASE: DEFAULT_DB_DATABASE,
        DB_MIGRATIONS_RUN: true,
        DB_SSL: true,
      });
      expect(result).not.toHaveProperty('SCHEDULE_TASK_CLEANUP_CRON');
    });

    it('should coerce string port to number', () => {
      // Arrange
      const input = {
        APP_PORT: '5000',
        LOGGING_LEVEL: 'warn',
      };

      // Act
      const result = validate(input);

      // Assert
      expect(result).toEqual({
        APP_PORT: 5000,
        LOGGING_LEVEL: 'warn',
        CORS_ALLOWED_ORIGIN: DEFAULT_CORS_ALLOWED_ORIGIN,
        JWT_SECRET: DEFAULT_JWT_SECRET,
        JWT_EXPIRES_IN: DEFAULT_JWT_EXPIRES_IN,
        DB_HOST: DEFAULT_DB_HOST,
        DB_PORT: DEFAULT_DB_PORT,
        DB_USER: DEFAULT_DB_USER,
        DB_PASS: DEFAULT_DB_PASS,
        DB_DATABASE: DEFAULT_DB_DATABASE,
        DB_MIGRATIONS_RUN: true,
        DB_SSL: true,
      });
      expect(typeof result.APP_PORT).toBe('number');
      expect(result).not.toHaveProperty('SCHEDULE_TASK_CLEANUP_CRON');
    });

    it('should use default APP_PORT when undefined', () => {
      // Arrange
      const input = {
        LOGGING_LEVEL: 'error',
      };

      // Act
      const result = validate(input);

      // Assert
      expect(result.APP_PORT).toBe(DEFAULT_APP_PORT);
      expect(result.LOGGING_LEVEL).toBe('error');
    });

    it('should use default LOGGING_LEVEL when undefined', () => {
      // Arrange
      const input = {
        APP_PORT: 4000,
      };

      // Act
      const result = validate(input);

      // Assert
      expect(result.APP_PORT).toBe(4000);
      expect(result.LOGGING_LEVEL).toBe(DEFAULT_LOGGING_LEVEL);
    });

    it('should accept all valid logging levels', () => {
      // Arrange
      const validLevels = ['debug', 'log', 'warn', 'error'];

      // Act & Assert
      validLevels.forEach((level) => {
        const input = { LOGGING_LEVEL: level };
        const result = validate(input);
        expect(result.LOGGING_LEVEL).toBe(level);
      });
    });

    it('should accept valid port range boundaries', () => {
      // Arrange
      const minPort = { APP_PORT: 1 };
      const maxPort = { APP_PORT: 65535 };

      // Act
      const minResult = validate(minPort);
      const maxResult = validate(maxPort);

      // Assert
      expect(minResult.APP_PORT).toBe(1);
      expect(maxResult.APP_PORT).toBe(65535);
    });

    it('should throw error for invalid port - below minimum', () => {
      // Arrange
      const input = {
        APP_PORT: 0,
      };

      // Act & Assert
      expect(() => validate(input)).toThrow('Config validation error: APP_PORT - Too small: expected number to be >=1');
    });

    it('should throw error for invalid port - above maximum', () => {
      // Arrange
      const input = {
        APP_PORT: 65536,
      };

      // Act & Assert
      expect(() => validate(input)).toThrow(
        'Config validation error: APP_PORT - Too big: expected number to be <=65535',
      );
    });

    it('should throw error for invalid logging level', () => {
      // Arrange
      const input = {
        LOGGING_LEVEL: 'invalid',
      };

      // Act & Assert
      expect(() => validate(input)).toThrow(
        'Config validation error: LOGGING_LEVEL - Invalid option: expected one of "verbose"|"debug"|"log"|"warn"|"error"|"fatal"',
      );
    });

    it('should throw error for non-numeric port', () => {
      // Arrange
      const input = {
        APP_PORT: 'not-a-number',
      };

      // Act & Assert
      expect(() => validate(input)).toThrow(
        'Config validation error: APP_PORT - Invalid input: expected number, received NaN',
      );
    });

    it('should throw error with multiple validation issues', () => {
      // Arrange
      const input = {
        APP_PORT: 0,
        LOGGING_LEVEL: 'invalid',
      };

      // Act & Assert
      expect(() => validate(input)).toThrow('Config validation error:');
      expect(() => validate(input)).toThrow('APP_PORT - Too small: expected number to be >=1');
      expect(() => validate(input)).toThrow(
        'LOGGING_LEVEL - Invalid option: expected one of "verbose"|"debug"|"log"|"warn"|"error"|"fatal"',
      );
    });

    it('should ignore extra properties not in schema', () => {
      // Arrange
      const input = {
        APP_PORT: 3000,
        LOGGING_LEVEL: 'log',
        EXTRA_PROPERTY: 'should be ignored',
        ANOTHER_EXTRA: 123,
      };

      // Act
      const result = validate(input);

      // Assert
      expect(result).toEqual({
        APP_PORT: 3000,
        LOGGING_LEVEL: 'log',
        CORS_ALLOWED_ORIGIN: DEFAULT_CORS_ALLOWED_ORIGIN,
        JWT_SECRET: DEFAULT_JWT_SECRET,
        JWT_EXPIRES_IN: DEFAULT_JWT_EXPIRES_IN,
        DB_HOST: DEFAULT_DB_HOST,
        DB_PORT: DEFAULT_DB_PORT,
        DB_USER: DEFAULT_DB_USER,
        DB_PASS: DEFAULT_DB_PASS,
        DB_DATABASE: DEFAULT_DB_DATABASE,
        DB_MIGRATIONS_RUN: true,
        DB_SSL: true,
      });
      expect(result).not.toHaveProperty('EXTRA_PROPERTY');
      expect(result).not.toHaveProperty('ANOTHER_EXTRA');
      expect(result).not.toHaveProperty('SCHEDULE_TASK_CLEANUP_CRON');
    });

    it('should use default DB_SSL when undefined', () => {
      // Arrange
      const input = {};

      // Act
      const result = validate(input);

      // Assert
      expect(result.DB_SSL).toBe(true);
    });

    it('should coerce DB_SSL string to boolean', () => {
      // Arrange
      const inputTrue = { DB_SSL: 'true' };
      const inputFalse = { DB_SSL: 'false' };

      // Act
      const resultTrue = validate(inputTrue);
      const resultFalse = validate(inputFalse);

      // Assert
      expect(resultTrue.DB_SSL).toBe(true);
      expect(resultFalse.DB_SSL).toBe(false);
    });
  });

  describe('Constants', () => {
    it('should export DEFAULT_APP_PORT with correct value', () => {
      // Arrange & Act & Assert
      expect(DEFAULT_APP_PORT).toBe(3001);
      expect(typeof DEFAULT_APP_PORT).toBe('number');
    });

    it('should export DEFAULT_LOGGING_LEVEL with correct value', () => {
      // Arrange & Act & Assert
      expect(DEFAULT_LOGGING_LEVEL).toBe('log');
      expect(typeof DEFAULT_LOGGING_LEVEL).toBe('string');
    });

    it('should export DEFAULT_JWT_SECRET with correct value', () => {
      // Arrange & Act & Assert
      expect(DEFAULT_JWT_SECRET).toBe('your-secret-key');
      expect(typeof DEFAULT_JWT_SECRET).toBe('string');
    });

    it('should export DEFAULT_JWT_EXPIRES_IN with correct value', () => {
      // Arrange & Act & Assert
      expect(DEFAULT_JWT_EXPIRES_IN).toBe('1h');
      expect(typeof DEFAULT_JWT_EXPIRES_IN).toBe('string');
    });
  });

  describe('Config Type', () => {
    it('should properly type the config object', () => {
      // Arrange
      const input = {
        APP_PORT: 8080,
        LOGGING_LEVEL: 'debug' as const,
      };

      // Act
      const result: Config = validate(input);

      // Assert
      expect(typeof result.APP_PORT).toBe('number');
      expect(typeof result.LOGGING_LEVEL).toBe('string');
      expect(['debug', 'log', 'warn', 'error']).toContain(result.LOGGING_LEVEL);
    });

    describe('JWT Configuration', () => {
      it('should use default JWT_SECRET when undefined', () => {
        // Arrange
        const input = {};

        // Act
        const result = validate(input);

        // Assert
        expect(result.JWT_SECRET).toBe(DEFAULT_JWT_SECRET);
      });

      it('should use provided JWT_SECRET when defined', () => {
        // Arrange
        const input = {
          JWT_SECRET: 'custom-jwt-secret-123',
        };

        // Act
        const result = validate(input);

        // Assert
        expect(result.JWT_SECRET).toBe('custom-jwt-secret-123');
      });

      it('should use default JWT_EXPIRES_IN when undefined', () => {
        // Arrange
        const input = {};

        // Act
        const result = validate(input);

        // Assert
        expect(result.JWT_EXPIRES_IN).toBe(DEFAULT_JWT_EXPIRES_IN);
      });

      it('should use provided JWT_EXPIRES_IN when defined', () => {
        // Arrange
        const input = {
          JWT_EXPIRES_IN: '2h',
        };

        // Act
        const result = validate(input);

        // Assert
        expect(result.JWT_EXPIRES_IN).toBe('2h');
      });

      it('should throw error for empty JWT_SECRET', () => {
        // Arrange
        const input = {
          JWT_SECRET: '',
        };

        // Act & Assert
        expect(() => validate(input)).toThrow('Config validation error: JWT_SECRET - Too small');
      });

      it('should throw error for empty JWT_EXPIRES_IN', () => {
        // Arrange
        const input = {
          JWT_EXPIRES_IN: '',
        };

        // Act & Assert
        expect(() => validate(input)).toThrow('Config validation error: JWT_EXPIRES_IN - Too small');
      });
    });

    describe('CORS_ALLOWED_ORIGIN', () => {
      it('should use default CORS_ALLOWED_ORIGIN when undefined', () => {
        // Arrange
        const input = {};

        // Act
        const result = validate(input);

        // Assert
        expect(result.CORS_ALLOWED_ORIGIN).toBe(DEFAULT_CORS_ALLOWED_ORIGIN);
      });

      it('should return "*" when CORS_ALLOWED_ORIGIN is "*"', () => {
        // Arrange
        const input = {
          CORS_ALLOWED_ORIGIN: '*',
        };

        // Act
        const result = validate(input);

        // Assert
        expect(result.CORS_ALLOWED_ORIGIN).toBe('*');
      });

      it('should return single origin as array when CORS_ALLOWED_ORIGIN has one value', () => {
        // Arrange
        const input = {
          CORS_ALLOWED_ORIGIN: 'https://example.com',
        };

        // Act
        const result = validate(input);

        // Assert
        expect(result.CORS_ALLOWED_ORIGIN).toEqual(['https://example.com']);
      });

      it('should split and trim comma-separated origins', () => {
        // Arrange
        const input = {
          CORS_ALLOWED_ORIGIN: 'https://example.com, http://localhost:3000, https://api.test.com',
        };

        // Act
        const result = validate(input);

        // Assert
        expect(result.CORS_ALLOWED_ORIGIN).toEqual([
          'https://example.com',
          'http://localhost:3000',
          'https://api.test.com',
        ]);
      });

      it('should filter out empty strings after splitting', () => {
        // Arrange
        const input = {
          CORS_ALLOWED_ORIGIN: 'https://example.com,,http://localhost:3000, ,https://api.test.com',
        };

        // Act
        const result = validate(input);

        // Assert
        expect(result.CORS_ALLOWED_ORIGIN).toEqual([
          'https://example.com',
          'http://localhost:3000',
          'https://api.test.com',
        ]);
      });
    });

    describe('APP_VERSION', () => {
      it('should not include APP_VERSION when undefined', () => {
        // Arrange
        const input = {};

        // Act
        const result = validate(input);

        // Assert
        expect(result).not.toHaveProperty('APP_VERSION');
      });

      it('should include APP_VERSION when provided', () => {
        // Arrange
        const input = {
          APP_VERSION: '1.2.3',
        };

        // Act
        const result = validate(input);

        // Assert
        expect(result.APP_VERSION).toBe('1.2.3');
      });

      it('should include APP_VERSION with build metadata', () => {
        // Arrange
        const input = {
          APP_VERSION: '1.2.3+build.123',
        };

        // Act
        const result = validate(input);

        // Assert
        expect(result.APP_VERSION).toBe('1.2.3+build.123');
      });

      it('should include APP_VERSION with prerelease identifier', () => {
        // Arrange
        const input = {
          APP_VERSION: '1.2.3-alpha.1',
        };

        // Act
        const result = validate(input);

        // Assert
        expect(result.APP_VERSION).toBe('1.2.3-alpha.1');
      });
    });
  });
});
