import { TaskPriority } from './task-priority.entity';

describe('TaskPriority Entity', () => {
  it('should create a TaskPriority instance with all required fields', () => {
    // Arrange
    const taskPriority = new TaskPriority();

    // Act
    taskPriority.code = 'HIGH';
    taskPriority.label = 'High Priority';
    taskPriority.description = 'Tasks that require immediate attention and should be completed first';
    taskPriority.ordinal = 1;

    // Assert
    expect(taskPriority.code).toBe('HIGH');
    expect(taskPriority.label).toBe('High Priority');
    expect(taskPriority.description).toBe('Tasks that require immediate attention and should be completed first');
    expect(taskPriority.ordinal).toBe(1);
  });

  it('should set ordinal to default value when not specified', () => {
    // Arrange
    const taskPriority = new TaskPriority();

    // Act
    taskPriority.code = 'MEDIUM';
    taskPriority.label = 'Medium Priority';
    taskPriority.description = 'Tasks with moderate importance';
    // ordinal not set, should default to 0

    // Assert
    expect(taskPriority.ordinal).toBeFalsy(); // undefined initially, defaults to 0 in database
  });

  it('should handle maximum length constraints', () => {
    // Arrange
    const taskPriority = new TaskPriority();
    const longCode = 'A'.repeat(32);
    const longLabel = 'B'.repeat(50);
    const longDescription = 'C'.repeat(500);

    // Act
    taskPriority.code = longCode;
    taskPriority.label = longLabel;
    taskPriority.description = longDescription;
    taskPriority.ordinal = 999;

    // Assert
    expect(taskPriority.code).toBe(longCode);
    expect(taskPriority.code.length).toBe(32);
    expect(taskPriority.label).toBe(longLabel);
    expect(taskPriority.label.length).toBe(50);
    expect(taskPriority.description).toBe(longDescription);
    expect(taskPriority.description.length).toBe(500);
    expect(taskPriority.ordinal).toBe(999);
  });

  it('should allow negative ordinal values for custom sorting', () => {
    // Arrange
    const taskPriority = new TaskPriority();

    // Act
    taskPriority.code = 'URGENT';
    taskPriority.label = 'Urgent Priority';
    taskPriority.description = 'Critical tasks that must be completed immediately';
    taskPriority.ordinal = -1;

    // Assert
    expect(taskPriority.ordinal).toBe(-1);
  });
});
