# API Documentation Guide

This guide explains how API documentation is generated and accessed in this NestJS project using Swagger and OpenAPI standards.

---

## Overview

NestJS integrates Swagger to automatically generate interactive API documentation and OpenAPI specifications. This is achieved using decorators provided by the `@nestjs/swagger` package, which annotate controllers, DTOs, and models to describe endpoints, request/response schemas, and other metadata.

---

## How Documentation Is Generated

1. **Install Swagger Module**
   - The project uses `@nestjs/swagger` to generate documentation.
   - Decorators like `@ApiTags`, `@ApiOperation`, `@ApiResponse`, and others are used in controllers and DTOs.

2. **Decorators**
   - `@ApiTags('tag')`: Groups endpoints under a tag in the UI.
   - `@ApiOperation({ summary: '...' })`: Describes the endpoint's purpose.
   - `@ApiResponse({ status: 200, description: '...' })`: Documents possible responses.
   - DTOs and entities are annotated for schema generation.

3. **Setup in Main Application**
   - Swagger is typically set up in `main.ts` using `SwaggerModule`:
     ```ts
     import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
     // ...existing code...
     const config = new DocumentBuilder()
       .setTitle('API Documentation')
       .setDescription('NestJS Playground API')
       .setVersion('1.0')
       .build();
     const document = SwaggerModule.createDocument(app, config);
     SwaggerModule.setup('api/docs', app, document);
     // ...existing code...
     ```

---

## Accessing the Documentation

### 1. Swagger UI

- **URL:** `/apidoc`
- **Description:** Interactive web interface to explore and test API endpoints.
- **How to use:** Open a browser and navigate to `http://localhost:<port>/apidoc` after starting the server.

### 2. OpenAPI Specification (JSON)

- **URL:** `/apidoc-json`
- **Description:** Raw OpenAPI spec in JSON format for use with tools or automation.
- **How to use:** Fetch `http://localhost:<port>/apidoc-json`.

### 3. OpenAPI Specification (YAML)

- **URL:** `/apidoc-yaml`
- **Description:** Raw OpenAPI spec in YAML format (if enabled).
- **How to use:** Fetch `http://localhost:<port>/apidoc-yaml`.

---

## Customization

- You can customize the documentation by editing the `DocumentBuilder` options in `main.ts`.
- Add or modify decorators in controllers and DTOs to improve the generated docs.

---

## Best Practices

- Always annotate new endpoints and DTOs with appropriate Swagger decorators.
- Keep documentation up to date with API changes.
- Use tags to organize endpoints logically.

---

## References

- [NestJS Swagger Documentation](https://docs.nestjs.com/openapi/introduction)
- [Swagger UI](https://swagger.io/tools/swagger-ui/)
- [OpenAPI Specification](https://swagger.io/specification/)
