import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';

import { AppModule } from '../src/app.module';

/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

describe('TasksController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true }));
    await app.init();
  });

  afterEach(async () => {
    await app?.close();
  });

  describe('/tasks (POST)', () => {
    it('should create a task with all fields', async () => {
      // Arrange
      const createTaskDto = {
        summary: 'E2E Test Task',
        description: 'This is a test task created during e2e testing',
        dueAt: '2025-09-15T10:00:00.000Z',
        isComplete: false,
      };

      // Act & Assert
      const response = await request(app.getHttpServer()).post('/tasks').send(createTaskDto).expect(HttpStatus.CREATED);

      expect(response.body).toMatchObject({
        summary: createTaskDto.summary,
        description: createTaskDto.description,
        dueAt: createTaskDto.dueAt,
        isComplete: createTaskDto.isComplete,
      });
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('createdAt');
      expect(response.body).toHaveProperty('updatedAt');
    });

    it('should create a task with only required fields', async () => {
      // Arrange
      const createTaskDto = {
        summary: 'Minimal E2E Test Task',
      };

      // Act & Assert
      const response = await request(app.getHttpServer()).post('/tasks').send(createTaskDto).expect(HttpStatus.CREATED);

      expect(response.body).toMatchObject({
        summary: createTaskDto.summary,
        isComplete: false,
      });
      // These fields should not be present in the JSON response when they are null in the database
      expect(response.body).not.toHaveProperty('description');
      expect(response.body).not.toHaveProperty('dueAt');
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('createdAt');
      expect(response.body).toHaveProperty('updatedAt');
    });

    it('should default isComplete to false when not provided', async () => {
      // Arrange
      const createTaskDto = {
        summary: 'Task without isComplete',
        description: 'This task should default isComplete to false',
      };

      // Act & Assert
      const response = await request(app.getHttpServer()).post('/tasks').send(createTaskDto).expect(HttpStatus.CREATED);

      expect(response.body.isComplete).toBe(false);
    });

    it('should return 400 when summary is missing', async () => {
      // Arrange
      const invalidDto = {
        description: 'Task without summary',
      };

      // Act & Assert
      await request(app.getHttpServer()).post('/tasks').send(invalidDto).expect(HttpStatus.BAD_REQUEST);
    });

    it('should return 400 when summary is empty string', async () => {
      // Arrange
      const invalidDto = {
        summary: '',
      };

      // Act & Assert
      await request(app.getHttpServer()).post('/tasks').send(invalidDto).expect(HttpStatus.BAD_REQUEST);
    });

    it('should return 400 when summary exceeds maximum length', async () => {
      // Arrange
      const invalidDto = {
        summary: 'a'.repeat(501), // Exceeds 500 character limit
      };

      // Act & Assert
      await request(app.getHttpServer()).post('/tasks').send(invalidDto).expect(HttpStatus.BAD_REQUEST);
    });

    it('should return 400 when dueAt is invalid date format', async () => {
      // Arrange
      const invalidDto = {
        summary: 'Task with invalid date',
        dueAt: 'invalid-date',
      };

      // Act & Assert
      await request(app.getHttpServer()).post('/tasks').send(invalidDto).expect(HttpStatus.BAD_REQUEST);
    });

    it('should return 400 when isComplete is not boolean', async () => {
      // Arrange
      const invalidDto = {
        summary: 'Task with invalid isComplete',
        isComplete: 'not-a-boolean',
      };

      // Act & Assert
      await request(app.getHttpServer()).post('/tasks').send(invalidDto).expect(HttpStatus.BAD_REQUEST);
    });

    it('should accept valid ISO 8601 date string for dueAt', async () => {
      // Arrange
      const createTaskDto = {
        summary: 'Task with valid date',
        dueAt: '2025-12-31T23:59:59.999Z',
      };

      // Act & Assert
      const response = await request(app.getHttpServer()).post('/tasks').send(createTaskDto).expect(HttpStatus.CREATED);

      expect(response.body.dueAt).toBe(createTaskDto.dueAt);
    });
  });

  describe('/tasks (GET)', () => {
    it('should retrieve all tasks including newly created ones', async () => {
      // Arrange - Create a task first
      const createTaskDto = {
        summary: 'Task for retrieval test',
        description: 'This task will be retrieved',
      };

      const createResponse = await request(app.getHttpServer())
        .post('/tasks')
        .send(createTaskDto)
        .expect(HttpStatus.CREATED);

      // Act - Retrieve all tasks
      const getResponse = await request(app.getHttpServer()).get('/tasks').expect(HttpStatus.OK);

      // Assert
      expect(Array.isArray(getResponse.body)).toBe(true);
      expect(getResponse.body.some((task: any) => task.id === createResponse.body.id)).toBe(true);
    });
  });

  describe('/tasks/:taskId (GET)', () => {
    it('should retrieve a specific task by ID', async () => {
      // Arrange - Create a task first
      const createTaskDto = {
        summary: 'Task for specific retrieval',
        description: 'This specific task will be retrieved by ID',
      };

      const createResponse = await request(app.getHttpServer())
        .post('/tasks')
        .send(createTaskDto)
        .expect(HttpStatus.CREATED);

      const taskId = createResponse.body.id;

      // Act - Retrieve the specific task
      const getResponse = await request(app.getHttpServer()).get(`/tasks/${taskId}`).expect(HttpStatus.OK);

      // Assert
      expect(getResponse.body).toMatchObject({
        id: taskId,
        summary: createTaskDto.summary,
        description: createTaskDto.description,
      });
    });

    it('should return 404 for non-existent task', async () => {
      // Arrange
      const nonExistentId = '550e8400-e29b-41d4-a716-446655440000';

      // Act & Assert
      await request(app.getHttpServer()).get(`/tasks/${nonExistentId}`).expect(HttpStatus.NOT_FOUND);
    });

    it('should return 400 for invalid UUID format', async () => {
      // Arrange
      const invalidId = 'not-a-uuid';

      // Act & Assert
      await request(app.getHttpServer()).get(`/tasks/${invalidId}`).expect(HttpStatus.BAD_REQUEST);
    });
  });
});
