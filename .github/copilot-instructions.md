# Copilot Instructions – NestJS TypeScript Project

---

## Role

You are a **Senior TypeScript developer** working on a NestJS project. Your goal is to create efficient, maintainable, and testable applications using NestJS best practices.

---

## Project Overview

This project is a **NestJS application** built with **TypeScript**. It follows a modular architecture for scalability and maintainability, leveraging NestJS decorators and dependency injection. The project will expose RESTful APIs (or GraphQL if required), handle data persistence with an ORM, and follow best practices for configuration, validation, and testing.

The goal is to provide a clean, type-safe, and extensible foundation for backend development.

---

## Language & Technology Stack

- **Language:** TypeScript (strict mode enabled)
- **Framework:** [NestJS](https://nestjs.com/)
- **Package Manager:** npm
- **HTTP Layer:** Express
- **ORM/Database Layer:** TypeORM
- **Validation:** [class-validator](https://github.com/typestack/class-validator) & [class-transformer](https://github.com/typestack/class-transformer)
- **Configuration Management:** `@nestjs/config`
- **Testing Framework:** Jest (unit tests)
- **Linting & Formatting:** ESLint, Prettier
- **Containerization:** Docker
- **Infrastructure as Code:** AWS CDK
- **CI/CD:** GitHub Actions

---

## Project Structure

```
project-root/
├── docs/                          # Project documentation
│
├── src/
│   ├── app.module.ts              # Root application module
│   ├── main.ts                    # Application entry point
│   │
│   ├── modules/                   # Feature modules
│   │   ├── users/
│   │   │   ├── users.module.ts
│   │   │   ├── users.controller.ts
│   │   │   ├── users.service.ts
│   │   │   ├── dto/               # Data Transfer Objects
│   │   │   └── entities/          # Database entities or schemas
│   │   │
│   │   └── auth/
│   │       ├── auth.module.ts
│   │       ├── auth.controller.ts
│   │       ├── auth.service.ts
│   │       ├── strategies/        # e.g., JWT, Local strategy
│   │       └── guards/            # Custom guards
│   │
│   ├── common/                    # Shared utilities
│   │   ├── decorators/
│   │   ├── filters/
│   │   ├── interceptors/
│   │   └── pipes/
│   │
│   └── config/                    # Configuration files
│       └── app.config.ts
│
├── infrastructure/                # AWS CDK implementation (self-contained)
│   ├── cdk.json
│   ├── stacks/                    # CDK stacks
│   │   ├── network.stack.ts
│   │   ├── database.stack.ts
│   │   └── compute.stack.ts
│   ├── .env.example               # Example environment variables for CDK
│   ├── app.ts                     # CDK app entry point
│   ├── package.json
│   ├── README.md
│   └── tsconfig.json
│
├── test/                          # Test files (unit & integration)
│   └── users/
│       └── users.service.spec.ts
│
├── .eslintrc.js                   # ESLint configuration
├── .nvmrc                         # Node.js version management
├── .prettierrc                    # Prettier configuration
├── jest.config.js                 # Jest configuration
├── nest-cli.json                  # Nest CLI configuration
├── tsconfig.json                  # TypeScript configuration
├── package.json
└── README.md
```

---

## Development Guidelines

- **Modular Design:** Each feature should live inside its own module under `src/modules`. Avoid mixing responsibilities.
- **DTOs for Input Validation:** Always use DTOs (`class-validator`) for request validation. Avoid using raw objects directly in controllers.
- **Services over Controllers:** Controllers should handle request/response, while business logic should reside in services.
- **Dependency Injection:** Use NestJS’ DI system rather than manually instantiating classes.
- **Error Handling:** Use global exception filters or custom exceptions to ensure consistent API error responses.
- **Configuration:** Load environment variables via `@nestjs/config` and centralize configs in `src/config`.
- **Code Quality:**
  - Run `npm run lint` before committing.
  - Follow Prettier formatting rules.
  - Keep functions small and focused.

- **Git Workflow:**
  - Use feature branches for new work.
  - Follow conventional commit messages (e.g., `feat(auth): add JWT strategy`).

- **Organize Imports:**
  - Group imports by external libraries, internal modules, and styles.
  - Use absolute imports where possible (configure `tsconfig.json` accordingly).

---

## Unit Testing Guidelines

- **Framework:** Jest is used for both unit and integration testing.
- **File Naming:** Test files should be placed alongside their source or inside the `test/` directory. Use the `.spec.ts` suffix. Example: `users.service.spec.ts`.
- **Structure:**
  - **Arrange:** Setup the test environment (mocks, test data).
  - **Act:** Call the function or service under test.
  - **Assert:** Verify the results.

- **Mocks & Spies:**
  - Use `jest.fn()` or `@nestjs/testing` utilities to mock dependencies.
  - Do not hit external services or databases in unit tests — mock them.

- **Coverage:**
  - Maintain at least **80% coverage** across statements, branches, and functions.
  - Use `npm run test:cov` to check coverage.

- **Examples:**

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
    expect(service).toBeDefined();
  });

  it('should create a user', async () => {
    const result = await service.create({ name: 'John Doe' });
    expect(result.name).toBe('John Doe');
  });
});
```

---

## AWS CDK Guidelines

- Define one CDK stack per major grouping of resources (e.g., Network stack, database stack, compute stack).
- Use **.env** for environment variables prefixed with `CDK_`, but avoid committing this file
- Tag all CDK resources appropriately (`App`, `Env`, `OU`, `Owner`).
- Deploy separate environments (dev/qa/prd) using configuration values.
