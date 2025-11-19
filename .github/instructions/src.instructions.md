---
applyTo: 'src/**/*.ts,!src/**/*.spec.ts'
---

# Source Code Guidelines

## Development Guidelines

- Each feature should live inside its own module under `src/modules`. Avoid mixing responsibilities.
- Always use DTOs (`class-validator`) for request validation. Avoid using raw objects directly in controllers.
- Controllers should handle request/response, while business logic should reside in services.
- Controllers should use Swagger decorators for API documentation.
- Use NestJS’ DI system rather than manually instantiating classes.
- Use global exception filters or custom exceptions to ensure consistent API error responses.
- Load environment variables via `@nestjs/config` and centralize configs in `src/config`.
- Run `npm run lint` before committing.
- Follow Prettier formatting rules.
- Keep functions small and focused.
- Organize Imports:
  - Group imports by external libraries and internal modules.
  - Use absolute imports where possible (configure `tsconfig.json` accordingly).

## Commands & Scripts

- Use `npm run build` to compile the TypeScript code.
- Use `npm run start:dev` to start the application in development mode.
- Use `npm run lint` to lint the codebase.
- Use `npm run format` to format the codebase with Prettier.
- Use `npm run migration:generate` to create a new database migration.
- Use `npm run migration:run` to apply pending migrations to the database.
