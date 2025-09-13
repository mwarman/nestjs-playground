import {
  validate,
  Config,
  DEFAULT_APP_PORT,
  DEFAULT_LOGGING_LEVEL,
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
        DB_HOST: DEFAULT_DB_HOST,
        DB_PORT: DEFAULT_DB_PORT,
        DB_USER: DEFAULT_DB_USER,
        DB_PASS: DEFAULT_DB_PASS,
        DB_DATABASE: DEFAULT_DB_DATABASE,
      });
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
        DB_HOST: DEFAULT_DB_HOST,
        DB_PORT: DEFAULT_DB_PORT,
        DB_USER: DEFAULT_DB_USER,
        DB_PASS: DEFAULT_DB_PASS,
        DB_DATABASE: DEFAULT_DB_DATABASE,
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
        DB_HOST: DEFAULT_DB_HOST,
        DB_PORT: DEFAULT_DB_PORT,
        DB_USER: DEFAULT_DB_USER,
        DB_PASS: DEFAULT_DB_PASS,
        DB_DATABASE: DEFAULT_DB_DATABASE,
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
        DB_HOST: DEFAULT_DB_HOST,
        DB_PORT: DEFAULT_DB_PORT,
        DB_USER: DEFAULT_DB_USER,
        DB_PASS: DEFAULT_DB_PASS,
        DB_DATABASE: DEFAULT_DB_DATABASE,
      });
      expect(result).not.toHaveProperty('EXTRA_PROPERTY');
      expect(result).not.toHaveProperty('ANOTHER_EXTRA');
      expect(result).not.toHaveProperty('SCHEDULE_TASK_CLEANUP_CRON');
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
  });
});
