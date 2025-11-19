---
applyTo: '**'
---

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

- The **language** used is TypeScript with strict mode enabled to ensure type safety and reduce runtime errors.
- The primary **framework** is NestJS, which provides a robust structure for building scalable server-side applications.
- The **package manager** is npm, used for managing dependencies and scripts.
- The **HTTP layer** is built on top of Express, providing a familiar and flexible way to handle HTTP requests and responses.
- The **ORM/Database layer** utilizes TypeORM for database interactions, supporting various database systems.
- For **validation**, the project uses class-validator and class-transformer to ensure data integrity and proper transformation of incoming requests.
- The **configuration management** is handled by the @nestjs/config package, allowing for easy management of environment variables and application settings.
- The **testing framework** is Jest, used for writing and executing unit tests to ensure code quality and reliability.
- The project employs **ESLint** and **Prettier** for linting and formatting, ensuring consistent code style and quality.
- The application is **containerized** using Docker, facilitating deployment and environment consistency.
- The infrastructure is managed using **AWS CDK**, enabling infrastructure as code practices.
- The CI/CD pipeline is set up using **GitHub Actions** for automated testing, building, and deployment.

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

## Commands & Scripts

- Use `npm run` to see all available scripts.
- Use `npm run lint` to lint the codebase.
- Use `npm run format` to format the codebase with Prettier.
- Use `npm run build` to compile the TypeScript code.
- Use `npm run start:dev` to start the application in development mode.
