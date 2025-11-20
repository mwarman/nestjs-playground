import { TypeOrmLoggerService } from './typeorm-logger.service';
import { Logger } from '@nestjs/common';

describe('TypeOrmLoggerService', () => {
  let service: TypeOrmLoggerService;
  let loggerSpy: jest.SpyInstance;

  beforeEach(() => {
    service = new TypeOrmLoggerService();
    loggerSpy = jest.spyOn(Logger.prototype, 'log').mockImplementation(() => {});
    jest.spyOn(Logger.prototype, 'debug').mockImplementation(() => {});
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => {});
    jest.spyOn(Logger.prototype, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should log queries with parameters', () => {
    // Arrange
    const debugSpy = jest.spyOn(Logger.prototype, 'debug');
    const query = 'SELECT * FROM users WHERE id = $1';
    const parameters = [1];

    // Act
    service.logQuery(query, parameters);

    // Assert
    expect(debugSpy).toHaveBeenCalledWith('Query: SELECT * FROM users WHERE id = $1 -- Parameters: [1]');
  });

  it('should log queries without parameters', () => {
    // Arrange
    const debugSpy = jest.spyOn(Logger.prototype, 'debug');
    const query = 'SELECT * FROM users';

    // Act
    service.logQuery(query);

    // Assert
    expect(debugSpy).toHaveBeenCalledWith('Query: SELECT * FROM users');
  });

  it('should log query errors', () => {
    // Arrange
    const errorSpy = jest.spyOn(Logger.prototype, 'error');
    const error = 'Some error';
    const query = 'SELECT * FROM users';
    const parameters = [1];

    // Act
    service.logQueryError(error, query, parameters);

    // Assert
    expect(errorSpy).toHaveBeenCalledWith('Query failed: SELECT * FROM users -- Parameters: [1] | Error: Some error');
  });

  it('should log query errors with Error object', () => {
    // Arrange
    const errorSpy = jest.spyOn(Logger.prototype, 'error');
    const error = new Error('DB error');
    const query = 'SELECT * FROM users';
    const parameters = [1];

    // Act
    service.logQueryError(error, query, parameters);

    // Assert
    expect(errorSpy).toHaveBeenCalledWith('Query failed: SELECT * FROM users -- Parameters: [1] | Error: DB error');
  });

  it('should log slow queries', () => {
    // Arrange
    const warnSpy = jest.spyOn(Logger.prototype, 'warn');
    const time = 1500;
    const query = 'SELECT * FROM users';
    const parameters = [1];

    // Act
    service.logQuerySlow(time, query, parameters);

    // Assert
    expect(warnSpy).toHaveBeenCalledWith('Slow query (1500ms): SELECT * FROM users -- Parameters: [1]');
  });

  it('should log schema build messages', () => {
    // Arrange
    const message = 'Schema built';

    // Act
    service.logSchemaBuild(message);

    // Assert
    expect(loggerSpy).toHaveBeenCalledWith('Schema build: Schema built');
  });

  it('should log migration messages', () => {
    // Arrange
    const message = 'Migration applied';

    // Act
    service.logMigration(message);

    // Assert
    expect(loggerSpy).toHaveBeenCalledWith('Migration: Migration applied');
  });

  it('should log with level log', () => {
    // Arrange
    const level = 'log';
    const message = 'A log message';

    // Act
    service.log(level, message);

    // Assert
    expect(loggerSpy).toHaveBeenCalledWith('A log message');
  });

  it('should log with level info', () => {
    // Arrange
    const level = 'info';
    const message = 'An info message';

    // Act
    service.log(level, message);

    // Assert
    expect(loggerSpy).toHaveBeenCalledWith('An info message');
  });

  it('should log with level warn', () => {
    // Arrange
    const warnSpy = jest.spyOn(Logger.prototype, 'warn');
    const level = 'warn';
    const message = 'A warning';

    // Act
    service.log(level, message);

    // Assert
    expect(warnSpy).toHaveBeenCalledWith('A warning');
  });

  it('should format query with parameters', () => {
    // Arrange
    const query = 'SELECT * FROM users WHERE id = $1';
    const parameters = [1, 'foo'];

    // Act
    // @ts-expect-private
    // eslint-disable-next-line
    const formatted = (service as any).formatQuery(query, parameters);

    // Assert
    expect(formatted).toBe('SELECT * FROM users WHERE id = $1 -- Parameters: [1, "foo"]');
  });

  it('should format query without parameters', () => {
    // Arrange
    const query = 'SELECT * FROM users';

    // Act
    // @ts-expect-private
    // eslint-disable-next-line
    const formatted = (service as any).formatQuery(query);

    // Assert
    expect(formatted).toBe('SELECT * FROM users');
  });
});
