import { Injectable, NotFoundException } from '@nestjs/common';

import { Task } from './entities/task.entity';

@Injectable()
export class TasksService {
  private readonly tasks: Task[] = [
    {
      id: '550e8400-e29b-41d4-a716-446655440001',
      summary: 'Complete project documentation',
      description: 'Write comprehensive documentation for the NestJS playground project',
      dueAt: '2025-09-15T10:00:00.000Z',
      isComplete: false,
      createdAt: '2025-09-01T08:00:00.000Z',
      updatedAt: '2025-09-02T09:30:00.000Z',
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440002',
      summary: 'Review code quality',
      description: 'Perform code review and ensure adherence to coding standards',
      isComplete: true,
      createdAt: '2025-08-28T14:00:00.000Z',
      updatedAt: '2025-09-01T16:45:00.000Z',
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440003',
      summary: 'Setup CI/CD pipeline',
      dueAt: '2025-09-20T12:00:00.000Z',
      isComplete: false,
      createdAt: '2025-09-03T10:15:00.000Z',
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440004',
      summary: 'Update dependencies',
      description: 'Update all npm packages to latest stable versions',
      isComplete: false,
      createdAt: '2025-09-05T11:30:00.000Z',
      updatedAt: '2025-09-06T13:20:00.000Z',
    },
  ];

  findAll(): Task[] {
    return this.tasks;
  }

  findOne(id: string): Task {
    const task = this.tasks.find((task) => task.id === id);
    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }
    return task;
  }
}
