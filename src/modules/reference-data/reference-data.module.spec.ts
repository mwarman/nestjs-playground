import { ReferenceDataModule } from './reference-data.module';

describe('ReferenceDataModule', () => {
  it('should be defined', () => {
    // Arrange
    const module = new ReferenceDataModule();

    // Act
    // No action needed for existence check

    // Assert
    expect(module).toBeDefined();
    expect(module).toBeInstanceOf(ReferenceDataModule);
  });

  it('should be a valid NestJS module', () => {
    // Arrange
    // Get the module metadata

    // Act
    const moduleMetadata = (Reflect.getMetadata('imports', ReferenceDataModule) as unknown[]) || [];
    const controllers = (Reflect.getMetadata('controllers', ReferenceDataModule) as unknown[]) || [];
    const providers = (Reflect.getMetadata('providers', ReferenceDataModule) as unknown[]) || [];
    const exports = (Reflect.getMetadata('exports', ReferenceDataModule) as unknown[]) || [];

    // Assert
    expect(moduleMetadata).toBeDefined();
    expect(controllers).toHaveLength(1); // ReferenceDataController
    expect(providers).toHaveLength(1); // TaskPriorityService
    expect(exports).toHaveLength(1); // TaskPriorityService exported
  });
});
