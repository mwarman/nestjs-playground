# NestJS Playground

<div style="display:flex; gap: 16px;">

[![Continuous Integration](https://github.com/mwarman/nestjs-playground/actions/workflows/ci.yml/badge.svg)](https://github.com/mwarman/nestjs-playground/actions/workflows/ci.yml)

[![Code Quality](https://github.com/mwarman/nestjs-playground/actions/workflows/code-quality.yml/badge.svg)](https://github.com/mwarman/nestjs-playground/actions/workflows/code-quality.yml)

</div>

## Overview

This is a starter repository for building efficient and scalable server-side applications using the [NestJS](https://nestjs.com/) framework and TypeScript. It provides a simple structure for rapid development and experimentation.

## Getting Started

1. **Install dependencies:**

```bash
npm install
```

2. **Configure environment variables:**

- Copy `.env.example` to `.env` and adjust values as needed.
- See the [Configuration Guide](docs/configuration.md) for details.

3. **Run the application:**

```bash
npm run start
```

## Available Scripts

| Script               | Description                                  |
| -------------------- | -------------------------------------------- |
| npm run start        | Start the application (development)          |
| npm run start:dev    | Start in watch mode                          |
| npm run start:prod   | Start in production mode                     |
| npm run build        | Compile the TypeScript source code           |
| npm run clean        | Remove build output and temporary files      |
| npm run lint         | Run ESLint to check code quality             |
| npm run format       | Format code using Prettier                   |
| npm run format:check | Check code formatting without changing files |
| npm run test         | Run unit tests                               |
| npm run test:e2e     | Run end-to-end tests                         |
| npm run test:cov     | Run test coverage                            |

## Configuration

Application configuration is managed via environment variables. For a full list of available variables, their descriptions, and default values, see the [Configuration Guide](docs/configuration.md).

## Project Structure

```
├── src/                # Main application source code
│   ├── app.controller.ts
│   ├── app.controller.spec.ts
│   ├── app.module.ts
│   ├── app.service.ts
│   ├── main.ts
│   └── config/         # Configuration-related code
│       └── configuration.ts
├── test/               # End-to-end tests
│   ├── app.e2e-spec.ts
│   └── jest-e2e.json
├── .env.example        # Example environment variables
├── .env                # Your local environment variables (not committed)
├── package.json        # Project metadata and scripts
├── tsconfig.json       # TypeScript configuration
├── nest-cli.json       # NestJS CLI configuration
├── README.md           # Project documentation
└── docs/
   └── configuration.md # Configuration documentation
```

---

## Additional Information

For more information, see the [NestJS Documentation](https://docs.nestjs.com/).
