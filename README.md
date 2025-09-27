# NestJS Playground

[![Continuous Integration](https://github.com/mwarman/nestjs-playground/actions/workflows/ci.yml/badge.svg)](https://github.com/mwarman/nestjs-playground/actions/workflows/ci.yml)
&nbsp;
&nbsp;
&nbsp;
&nbsp;
&nbsp;
[![Code Quality](https://github.com/mwarman/nestjs-playground/actions/workflows/code-quality.yml/badge.svg)](https://github.com/mwarman/nestjs-playground/actions/workflows/code-quality.yml)

## Overview

This is a starter repository for building efficient and scalable server-side applications using the [NestJS](https://nestjs.com/) framework and TypeScript. It provides a simple structure for rapid development and experimentation.

## Getting Started

1. **Install dependencies:**

```bash
npm install
```

2. **Configure environment variables:**

- Copy `.env.example` to `.env` and adjust values as needed.
- See the [Configuration Guide](docs/configuration-guide.md) for details.

3. **Run the application:**

```bash
npm run start
```

## Available Scripts

| Script               | Description                                  |
| -------------------- | -------------------------------------------- |
| npm run build        | Compile the TypeScript source code           |
| npm run clean        | Remove build output and temporary files      |
| npm run lint         | Run ESLint to check code quality             |
| npm run format       | Format code using Prettier                   |
| npm run format:check | Check code formatting without changing files |
| npm run start        | Start the application (development)          |
| npm run start:dev    | Start in watch mode                          |
| npm run start:prod   | Start in production mode                     |
| npm run test         | Run unit tests                               |
| npm run test:e2e     | Run end-to-end tests                         |
| npm run test:cov     | Run test coverage                            |

## Project Structure

```
├── src/                                 # Main application source code
│   ├── app.module.ts                    # App module
│   ├── main.ts                          # Application entry point
│   ├── modules/
│   │   └── tasks/                       # Example feature module
│   │       ├── tasks.module.ts          # Tasks module definition
│   │       ├── tasks.controller.ts      # Tasks controller
│   │       ├── tasks.controller.spec.ts # Tasks controller unit tests
│   │       ├── tasks.service.ts         # Tasks service
│   │       ├── tasks.service.spec.ts    # Tasks service unit tests
│   │       ├── dto/                     # DTOs for tasks
│   │       └── entities/                # Entities for tasks
│   └── config/                          # Configuration-related code
│       └── configuration.ts             # Configuration loader
├── test/                                # End-to-end tests
│   ├── tasks.e2e-spec.ts                # E2E test spec
│   └── jest-e2e.json                    # Jest E2E config
├── .env.example                         # Example environment variables
├── package.json                         # Project metadata and scripts
├── tsconfig.json                        # TypeScript configuration
├── nest-cli.json                        # NestJS CLI configuration
├── README.md                            # Project documentation
├── .github/                             # GitHub Actions workflows and settings
└── docs/                                # Project documentation
   ├── configuration-guide.md            # Configuration guide
   └── devops-guide.md                   # DevOps guide
```

## Documentation Hub

For all guides and references—including configuration, Docker, DevOps, and API documentation—see the [Documentation Table of Contents](docs/README.md).

## Additional Information

For more information, see the [NestJS Documentation](https://docs.nestjs.com/).
