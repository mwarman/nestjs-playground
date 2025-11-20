---
applyTo: '**/*.spec.ts,**/*.test.ts'
---

# Unit Testing Guidelines

- The framework used for testing is Jest.
- Test files should be named with a `.spec.ts` suffix and can be located either alongside the source files or within a dedicated `test/` directory.
- Structure your tests using the Arrange-Act-Assert pattern:
  - **Arrange:** Set up the test environment, including any necessary mocks and test data.
  - **Act:** Execute the function or service being tested.
  - **Assert:** Verify that the results are as expected.
  - Add comments to separate these sections for clarity.

## Mocks & Spies

- Use `jest.fn()` or `@nestjs/testing` utilities to mock dependencies.
- Do not hit external services or databases in unit tests — mock them.

## Coverage

- Maintain at least **80% coverage** across statements, branches, and functions.

## Commands & Scripts

- Use `npm run test` to run all tests.
- Use `npm run test <component>` to run tests for a specific component, e.g., `npm run test users`.
- Use `npm run test:cov` to generate a coverage report.

## Examples

### Example NestJS Service Test

```ts
import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';

describe('UsersService', () => {
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UsersService],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    // Arrange, Act & Assert
    expect(service).toBeDefined();
  });

  it('should create a user', async () => {
    // Arrange & Act
    const result = await service.create({ name: 'John Doe' });

    // Assert
    expect(result.name).toBe('John Doe');
  });
});
```
