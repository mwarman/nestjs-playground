# API Security Guide

This guide provides an overview of the API security approach used in the NestJS Playground application. It is intended for new engineers to understand how authentication and authorization are implemented, focusing on JWT (JSON Web Token) usage, the Sign In flow, and applying JWT Auth Guards to controllers.

---

## JWT Authentication Overview

The application uses JWT for stateless authentication. JWTs are issued to users upon successful sign-in and must be included in the `Authorization` header for protected API requests. The server validates the token to authenticate and authorize users.

### Why JWT?

- **Stateless:** No server-side session storage required.
- **Scalable:** Suitable for distributed systems and microservices.
- **Secure:** Payload is signed and can be verified.

---

## Authorization Header Format

Client applications must include the JWT in the `Authorization` header for all requests to protected endpoints. The expected format is:

```
Authorization: Bearer <jwt-token>
```

- **Bearer**: The keyword `Bearer` must precede the token, separated by a space.
- **<jwt-token>**: The actual JWT string returned by the sign-in endpoint.

Example request:

```
GET /tasks HTTP/1.1
Host: api.example.com
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

If the header is missing or the format is incorrect, the server will reject the request with a 401 Unauthorized error.

---

## Sign In Flow

1. **User submits credentials** to the `/auth/signin` endpoint (typically email/username and password).
2. **Credentials are validated** by the AuthService.
3. **JWT is generated** if credentials are valid. The token contains user identification and claims.
4. **JWT is returned** to the client in the response body.
5. **Client stores the JWT** (usually in local storage or memory) and includes it in the `Authorization: Bearer <token>` header for subsequent requests.

---

## Applying JWT Auth Guards

NestJS provides a powerful guard mechanism to protect routes. The `JwtAuthGuard` is used to ensure that only authenticated users can access certain endpoints.

### Usage Example

```typescript
import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('tasks')
@UseGuards(JwtAuthGuard)
export class TasksController {
  @Get()
  findAll() {
    // ...
  }
}
```

- **@UseGuards(JwtAuthGuard):** Applies the guard to all routes in the controller.
- You can also apply the guard to individual methods.

### How It Works

- The guard checks for a valid JWT in the request header.
- If valid, the request proceeds; otherwise, a 401 Unauthorized error is returned.

---

## Best Practices

- Always validate and sanitize user input during sign-in.
- Use strong secrets for signing JWTs.
- Set appropriate token expiration times.
- Apply guards to all sensitive endpoints.
- Never expose sensitive information in JWT payloads.
