import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication, ValidationPipe, VersioningType } from '@nestjs/common';
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

  describe('/v1/tasks (POST)', () => {
    it('should create a task with all fields', async () => {
      // Arrange
      const createTaskDto = {
        summary: 'E2E Test Task',
        description: 'This is a test task created during e2e testing',
        dueAt: '2025-09-15T10:00:00.000Z',
        isComplete: false,
      };

      // Act & Assert
      const response = await request(app.getHttpServer())
        .post('/v1/tasks')
        .send(createTaskDto)
        .expect(HttpStatus.CREATED);

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
      const response = await request(app.getHttpServer())
        .post('/v1/tasks')
        .send(createTaskDto)
        .expect(HttpStatus.CREATED);

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
      const response = await request(app.getHttpServer())
        .post('/v1/tasks')
        .send(createTaskDto)
        .expect(HttpStatus.CREATED);

      expect(response.body.isComplete).toBe(false);
    });

    it('should return 400 when summary is missing', async () => {
      // Arrange
      const invalidDto = {
        description: 'Task without summary',
      };

      // Act & Assert
      await request(app.getHttpServer()).post('/v1/tasks').send(invalidDto).expect(HttpStatus.BAD_REQUEST);
    });

    it('should return 400 when summary is empty string', async () => {
      // Arrange
      const invalidDto = {
        summary: '',
      };

      // Act & Assert
      await request(app.getHttpServer()).post('/v1/tasks').send(invalidDto).expect(HttpStatus.BAD_REQUEST);
    });

    it('should return 400 when summary exceeds maximum length', async () => {
      // Arrange
      const invalidDto = {
        summary: 'a'.repeat(501), // Exceeds 500 character limit
      };

      // Act & Assert
      await request(app.getHttpServer()).post('/v1/tasks').send(invalidDto).expect(HttpStatus.BAD_REQUEST);
    });

    it('should return 400 when dueAt is invalid date format', async () => {
      // Arrange
      const invalidDto = {
        summary: 'Task with invalid date',
        dueAt: 'invalid-date',
      };

      // Act & Assert
      await request(app.getHttpServer()).post('/v1/tasks').send(invalidDto).expect(HttpStatus.BAD_REQUEST);
    });

    it('should return 400 when isComplete is not boolean', async () => {
      // Arrange
      const invalidDto = {
        summary: 'Task with invalid isComplete',
        isComplete: 'not-a-boolean',
      };

      // Act & Assert
      await request(app.getHttpServer()).post('/v1/tasks').send(invalidDto).expect(HttpStatus.BAD_REQUEST);
    });

    it('should accept valid ISO 8601 date string for dueAt', async () => {
      // Arrange
      const createTaskDto = {
        summary: 'Task with valid date',
        dueAt: '2025-12-31T23:59:59.999Z',
      };

      // Act & Assert
      const response = await request(app.getHttpServer())
        .post('/v1/tasks')
        .send(createTaskDto)
        .expect(HttpStatus.CREATED);

      expect(response.body.dueAt).toBe(createTaskDto.dueAt);
    });
  });

  describe('/v1/tasks (GET)', () => {
    it('should retrieve all tasks including newly created ones', async () => {
      // Arrange - Create a task first
      const createTaskDto = {
        summary: 'Task for retrieval test',
        description: 'This task will be retrieved',
      };

      const createResponse = await request(app.getHttpServer())
        .post('/v1/tasks')
        .send(createTaskDto)
        .expect(HttpStatus.CREATED);

      // Act - Retrieve all tasks
      const getResponse = await request(app.getHttpServer()).get('/v1/tasks').expect(HttpStatus.OK);

      // Assert
      expect(Array.isArray(getResponse.body)).toBe(true);
      expect(getResponse.body.some((task: any) => task.id === createResponse.body.id)).toBe(true);
    });
  });

  describe('/v1/tasks/:taskId (GET)', () => {
    it('should retrieve a specific task by ID', async () => {
      // Arrange - Create a task first
      const createTaskDto = {
        summary: 'Task for specific retrieval',
        description: 'This specific task will be retrieved by ID',
      };

      const createResponse = await request(app.getHttpServer())
        .post('/v1/tasks')
        .send(createTaskDto)
        .expect(HttpStatus.CREATED);

      const taskId = createResponse.body.id;

      // Act - Retrieve the specific task
      const getResponse = await request(app.getHttpServer()).get(`/v1/tasks/${taskId}`).expect(HttpStatus.OK);

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
      await request(app.getHttpServer()).get(`/v1/tasks/${nonExistentId}`).expect(HttpStatus.NOT_FOUND);
    });

    it('should return 400 for invalid UUID format', async () => {
      // Arrange
      const invalidId = 'not-a-uuid';

      // Act & Assert
      await request(app.getHttpServer()).get(`/v1/tasks/${invalidId}`).expect(HttpStatus.BAD_REQUEST);
    });
  });

  describe('/v1/tasks/:taskId (PUT)', () => {
    it('should update a task with all fields', async () => {
      // Arrange - First create a task
      const createTaskDto = {
        summary: 'Original task for update test',
        description: 'Original description',
        dueAt: '2025-09-15T10:00:00.000Z',
        isComplete: false,
      };

      const createResponse = await request(app.getHttpServer())
        .post('/v1/tasks')
        .send(createTaskDto)
        .expect(HttpStatus.CREATED);

      const taskId = createResponse.body.id;

      const updateTaskDto = {
        id: taskId,
        summary: 'Updated task summary',
        description: 'Updated description',
        dueAt: '2025-09-20T10:00:00.000Z',
        isComplete: true,
      };

      // Act & Assert
      const response = await request(app.getHttpServer())
        .put(`/v1/tasks/${taskId}`)
        .send(updateTaskDto)
        .expect(HttpStatus.OK);

      expect(response.body).toMatchObject({
        id: taskId,
        summary: updateTaskDto.summary,
        description: updateTaskDto.description,
        dueAt: updateTaskDto.dueAt,
        isComplete: updateTaskDto.isComplete,
      });
      expect(response.body).toHaveProperty('createdAt');
      expect(response.body).toHaveProperty('updatedAt');
    });

    it('should update a task with partial fields', async () => {
      // Arrange - First create a task
      const createTaskDto = {
        summary: 'Original task for partial update',
        description: 'Original description',
        isComplete: false,
      };

      const createResponse = await request(app.getHttpServer())
        .post('/v1/tasks')
        .send(createTaskDto)
        .expect(HttpStatus.CREATED);

      const taskId = createResponse.body.id;

      const updateTaskDto = {
        id: taskId,
        summary: 'Updated summary only',
      };

      // Act & Assert
      const response = await request(app.getHttpServer())
        .put(`/v1/tasks/${taskId}`)
        .send(updateTaskDto)
        .expect(HttpStatus.OK);

      expect(response.body).toMatchObject({
        id: taskId,
        summary: updateTaskDto.summary,
      });
      expect(response.body).toHaveProperty('createdAt');
      expect(response.body).toHaveProperty('updatedAt');

      // The response should contain the updated summary
      expect(response.body.summary).toBe(updateTaskDto.summary);
      expect(response.body.id).toBe(taskId);
    });

    it('should return 404 for non-existent task', async () => {
      // Arrange
      const nonExistentId = '550e8400-e29b-41d4-a716-446655440000';
      const updateTaskDto = {
        id: nonExistentId,
        summary: 'Updated summary',
      };

      // Act & Assert
      await request(app.getHttpServer())
        .put(`/v1/tasks/${nonExistentId}`)
        .send(updateTaskDto)
        .expect(HttpStatus.NOT_FOUND);
    });

    it('should return 400 for invalid UUID format in path', async () => {
      // Arrange
      const invalidId = 'not-a-uuid';
      const updateTaskDto = {
        id: invalidId,
        summary: 'Updated summary',
      };

      // Act & Assert
      await request(app.getHttpServer())
        .put(`/v1/tasks/${invalidId}`)
        .send(updateTaskDto)
        .expect(HttpStatus.BAD_REQUEST);
    });

    it('should return 400 for missing required id field in body', async () => {
      // Arrange
      const taskId = '550e8400-e29b-41d4-a716-446655440001';
      const updateTaskDto = {
        summary: 'Updated summary without id',
      };

      // Act & Assert
      await request(app.getHttpServer()).put(`/v1/tasks/${taskId}`).send(updateTaskDto).expect(HttpStatus.BAD_REQUEST);
    });

    it('should return 400 for invalid id format in body', async () => {
      // Arrange
      const taskId = '550e8400-e29b-41d4-a716-446655440001';
      const updateTaskDto = {
        id: 'not-a-uuid',
        summary: 'Updated summary',
      };

      // Act & Assert
      await request(app.getHttpServer()).put(`/v1/tasks/${taskId}`).send(updateTaskDto).expect(HttpStatus.BAD_REQUEST);
    });

    it('should return 400 for empty summary when provided', async () => {
      // Arrange
      const taskId = '550e8400-e29b-41d4-a716-446655440001';
      const updateTaskDto = {
        id: taskId,
        summary: '',
      };

      // Act & Assert
      await request(app.getHttpServer()).put(`/v1/tasks/${taskId}`).send(updateTaskDto).expect(HttpStatus.BAD_REQUEST);
    });

    it('should return 400 for invalid dueAt format', async () => {
      // Arrange
      const taskId = '550e8400-e29b-41d4-a716-446655440001';
      const updateTaskDto = {
        id: taskId,
        summary: 'Updated summary',
        dueAt: 'invalid-date',
      };

      // Act & Assert
      await request(app.getHttpServer()).put(`/v1/tasks/${taskId}`).send(updateTaskDto).expect(HttpStatus.BAD_REQUEST);
    });

    it('should return 400 for invalid isComplete type', async () => {
      // Arrange
      const taskId = '550e8400-e29b-41d4-a716-446655440001';
      const updateTaskDto = {
        id: taskId,
        summary: 'Updated summary',
        isComplete: 'not-a-boolean',
      };

      // Act & Assert
      await request(app.getHttpServer()).put(`/v1/tasks/${taskId}`).send(updateTaskDto).expect(HttpStatus.BAD_REQUEST);
    });
  });

  describe('/v1/tasks/:taskId (DELETE)', () => {
    it('should remove a task successfully', async () => {
      // Arrange - First create a task to delete
      const createTaskDto = {
        summary: 'Task to be deleted',
        description: 'This task will be removed in the test',
        dueAt: '2025-09-20T10:00:00.000Z',
        isComplete: false,
      };

      const createResponse = await request(app.getHttpServer())
        .post('/v1/tasks')
        .send(createTaskDto)
        .expect(HttpStatus.CREATED);

      const createdTaskId = createResponse.body.id;

      // Act & Assert - Delete the task
      await request(app.getHttpServer()).delete(`/v1/tasks/${createdTaskId}`).expect(HttpStatus.NO_CONTENT);

      // Verify the task was actually deleted
      await request(app.getHttpServer()).get(`/v1/tasks/${createdTaskId}`).expect(HttpStatus.NOT_FOUND);
    });

    it('should return 404 when trying to delete a non-existent task', async () => {
      // Arrange
      const nonExistentTaskId = '550e8400-e29b-41d4-a716-446655440999';

      // Act & Assert
      await request(app.getHttpServer()).delete(`/v1/tasks/${nonExistentTaskId}`).expect(HttpStatus.NOT_FOUND);
    });

    it('should return 400 when taskId is invalid', async () => {
      // Arrange
      const invalidTaskId = 'invalid-uuid';

      // Act & Assert
      await request(app.getHttpServer()).delete(`/v1/tasks/${invalidTaskId}`).expect(HttpStatus.BAD_REQUEST);
    });

    it('should return 400 when taskId is missing', async () => {
      // Act & Assert
      await request(app.getHttpServer()).delete('/v1/tasks/').expect(HttpStatus.NOT_FOUND);
    });
  });
});
