import { Task } from './task.entity';

describe('Task Entity', () => {
  it('should create a Task instance with required fields', () => {
    // Arrange
    const now = new Date('2025-09-01T08:00:00.000Z');
    const task = new Task();

    // Act
    task.id = '550e8400-e29b-41d4-a716-446655440001';
    task.summary = 'Complete project documentation';
    task.isComplete = false;
    task.createdAt = now;
    task.updatedAt = now;

    // Assert
    expect(task.id).toBe('550e8400-e29b-41d4-a716-446655440001');
    expect(task.summary).toBe('Complete project documentation');
    expect(task.isComplete).toBe(false);
    expect(task.createdAt).toBe(now);
    expect(task.updatedAt).toBe(now);
  });

  it('should allow optional description and dueAt to be undefined', () => {
    // Arrange
    const task = new Task();

    // Act
    task.description = undefined;
    task.dueAt = undefined;

    // Assert
    expect(task.description).toBeUndefined();
    expect(task.dueAt).toBeUndefined();
  });

  it('should allow setting description and dueAt', () => {
    // Arrange
    const task = new Task();
    const dueDate = new Date('2025-09-15T10:00:00.000Z');

    // Act
    task.description = 'Write comprehensive documentation for the NestJS playground project';
    task.dueAt = dueDate;

    // Assert
    expect(task.description).toBe('Write comprehensive documentation for the NestJS playground project');
    expect(task.dueAt).toBe(dueDate);
  });

  it('should default isComplete to false if not set', () => {
    // Arrange
    const task = new Task();

    // Act & Assert
    expect(task.isComplete).toBeFalsy();
  });

  it('should update updatedAt timestamp', () => {
    // Arrange
    const task = new Task();
    const updated = new Date('2025-09-02T09:30:00.000Z');

    // Act
    task.updatedAt = updated;

    // Assert
    expect(task.updatedAt).toBe(updated);
  });
});
