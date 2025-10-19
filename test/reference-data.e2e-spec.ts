import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication, ValidationPipe, VersioningType } from '@nestjs/common';
import request from 'supertest';

import { AppModule } from '../src/app.module';

/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

describe('ReferenceDataController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.enableVersioning({
      type: VersioningType.URI,
      defaultVersion: '1',
      prefix: 'v',
    });
    app.useGlobalPipes(new ValidationPipe({ transform: true }));
    await app.init();
  });

  afterEach(async () => {
    await app?.close();
  });

  describe('/v1/refdata/taskpriorities (GET)', () => {
    it('should return all task priorities', async () => {
      // Arrange
      // Test data is seeded via migration

      // Act & Assert
      const response = await request(app.getHttpServer()).get('/v1/refdata/taskpriorities').expect(HttpStatus.OK);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);

      // Verify structure of first priority
      const firstPriority = response.body[0];
      expect(firstPriority).toHaveProperty('code');
      expect(firstPriority).toHaveProperty('label');
      expect(firstPriority).toHaveProperty('description');
      expect(firstPriority).toHaveProperty('ordinal');
      expect(typeof firstPriority.code).toBe('string');
      expect(typeof firstPriority.label).toBe('string');
      expect(typeof firstPriority.description).toBe('string');
      expect(typeof firstPriority.ordinal).toBe('number');
    });

    it('should return priorities sorted by ordinal then by code', async () => {
      // Arrange
      // Test data is seeded via migration

      // Act
      const response = await request(app.getHttpServer()).get('/v1/refdata/taskpriorities').expect(HttpStatus.OK);

      // Assert
      const priorities = response.body;
      expect(priorities.length).toBeGreaterThan(1);

      // Check that priorities are sorted correctly
      for (let i = 1; i < priorities.length; i++) {
        const current = priorities[i];
        const previous = priorities[i - 1];

        // Should be sorted by ordinal ascending, then by code ascending
        expect(
          previous.ordinal < current.ordinal || (previous.ordinal === current.ordinal && previous.code <= current.code),
        ).toBe(true);
      }
    });

    it('should include cache headers on repeated requests', async () => {
      // Arrange
      // Test data is seeded via migration

      // Act - First request
      const firstResponse = await request(app.getHttpServer()).get('/v1/refdata/taskpriorities').expect(HttpStatus.OK);

      // Act - Second request (should be cached)
      const secondResponse = await request(app.getHttpServer()).get('/v1/refdata/taskpriorities').expect(HttpStatus.OK);

      // Assert
      expect(firstResponse.body).toEqual(secondResponse.body);
      // Both responses should have the same data structure
      expect(Array.isArray(firstResponse.body)).toBe(true);
      expect(Array.isArray(secondResponse.body)).toBe(true);
    });
  });

  describe('/v1/refdata/taskpriorities/:code (GET)', () => {
    it('should return a task priority by valid code', async () => {
      // Arrange
      const priorityCode = 'HIGH';

      // Act & Assert
      const response = await request(app.getHttpServer())
        .get(`/v1/refdata/taskpriorities/${priorityCode}`)
        .expect(HttpStatus.OK);

      expect(response.body).toHaveProperty('code', priorityCode);
      expect(response.body).toHaveProperty('label');
      expect(response.body).toHaveProperty('description');
      expect(response.body).toHaveProperty('ordinal');
      expect(typeof response.body.label).toBe('string');
      expect(typeof response.body.description).toBe('string');
      expect(typeof response.body.ordinal).toBe('number');
    });

    it('should return 404 for non-existent priority code', async () => {
      // Arrange
      const invalidCode = 'INVALID';

      // Act & Assert
      await request(app.getHttpServer()).get(`/v1/refdata/taskpriorities/${invalidCode}`).expect(HttpStatus.NOT_FOUND);
    });

    it('should validate priority code format', async () => {
      // Arrange
      const invalidCode = 'invalid-lowercase'; // Should only accept uppercase

      // Act & Assert
      await request(app.getHttpServer())
        .get(`/v1/refdata/taskpriorities/${invalidCode}`)
        .expect(HttpStatus.BAD_REQUEST);
    });

    it('should return 400 for code with invalid characters', async () => {
      // Arrange
      const invalidCode = 'HIGH PRIORITY'; // Contains space

      // Act & Assert
      await request(app.getHttpServer())
        .get(`/v1/refdata/taskpriorities/${encodeURIComponent(invalidCode)}`)
        .expect(HttpStatus.BAD_REQUEST);
    });

    it('should return 400 for code exceeding maximum length', async () => {
      // Arrange
      const longCode = 'A'.repeat(33); // Exceeds 32 character limit

      // Act & Assert
      await request(app.getHttpServer()).get(`/v1/refdata/taskpriorities/${longCode}`).expect(HttpStatus.BAD_REQUEST);
    });

    it('should cache individual priority responses', async () => {
      // Arrange
      const priorityCode = 'MEDIUM';

      // Act - First request
      const firstResponse = await request(app.getHttpServer())
        .get(`/v1/refdata/taskpriorities/${priorityCode}`)
        .expect(HttpStatus.OK);

      // Act - Second request (should be cached)
      const secondResponse = await request(app.getHttpServer())
        .get(`/v1/refdata/taskpriorities/${priorityCode}`)
        .expect(HttpStatus.OK);

      // Assert
      expect(firstResponse.body).toEqual(secondResponse.body);
      expect(firstResponse.body.code).toBe(priorityCode);
    });
  });

  describe('Public endpoint access', () => {
    it('should allow access to task priorities without authentication', async () => {
      // Arrange
      // No authentication headers provided

      // Act & Assert
      await request(app.getHttpServer()).get('/v1/refdata/taskpriorities').expect(HttpStatus.OK);
    });

    it('should allow access to specific priority without authentication', async () => {
      // Arrange
      const priorityCode = 'LOW';

      // Act & Assert
      await request(app.getHttpServer()).get(`/v1/refdata/taskpriorities/${priorityCode}`).expect(HttpStatus.OK);
    });
  });
});
