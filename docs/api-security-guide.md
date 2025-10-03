# API Security Guide

This guide provides an overview of the API security approach used in the NestJS Playground application. It is intended for new engineers to understand how authentication and authorization are implemented, focusing on JWT (JSON Web Token) usage, the registration and sign-in flows, and the global JWT Auth Guard with public endpoint decorators.

---

## JWT Authentication Overview

The application uses JWT for stateless authentication with a **global security-first approach**. By default, all API endpoints require authentication via a valid JWT token. JWTs are issued to users upon successful sign-in and must be included in the `Authorization` header for protected API requests. Endpoints that should be publicly accessible are explicitly marked with the `@Public()` decorator.

### Why JWT?

- **Stateless:** No server-side session storage required.
- **Scalable:** Suitable for distributed systems and microservices.
- **Secure:** Payload is signed and can be verified.

### Global Security-First Design

The application implements a "secure by default" approach where:

- JWT authentication is applied globally to all endpoints
- Endpoints must be explicitly marked as public using the `@Public()` decorator
- This prevents accidentally exposing sensitive endpoints without authentication

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

## User Registration Flow

New users can create accounts using the registration endpoint:

1. **User submits registration data** to the `/auth/register` endpoint (username, email, password, etc.).
2. **Registration data is validated** using DTOs with class-validator decorators.
3. **User account is created** by the AuthService if validation passes.
4. **User entity is returned** in the response (sensitive fields like password are automatically excluded).
5. **User can then sign in** using their credentials to obtain a JWT token.

### Registration Endpoint

```
POST /auth/register
Content-Type: application/json

{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "securePassword123"
}
```

## Sign In Flow

1. **User submits credentials** to the `/auth/signin` endpoint (username and password).
2. **Credentials are validated** by the AuthService.
3. **JWT is generated** if credentials are valid. The token contains user identification and claims.
4. **JWT is returned** to the client in the response body.
5. **Client stores the JWT** (usually in local storage or memory) and includes it in the `Authorization: Bearer <token>` header for subsequent requests.

### Sign In Endpoint

```
POST /auth/signin
Content-Type: application/json

{
  "username": "johndoe",
  "password": "securePassword123"
}
```

---

## Global JWT Auth Guard

The application uses a **global JWT Auth Guard** that automatically protects all endpoints. This is configured in the `AuthModule` using NestJS's `APP_GUARD` provider:

```typescript
@Module({
  // ... other module configuration
  providers: [AuthService, JwtAuthGuard, { provide: APP_GUARD, useClass: JwtAuthGuard }],
})
export class AuthModule {}
```

### How the Global Guard Works

1. **Every request** is intercepted by the `JwtAuthGuard`
2. **Public routes are checked first** - if a route or controller has the `@Public()` decorator, authentication is bypassed
3. **JWT validation occurs** for all non-public routes:
   - Extracts the JWT from the `Authorization: Bearer <token>` header
   - Validates the token signature and expiration
   - Adds the user payload to the request object for use in controllers
4. **Access is granted or denied** based on token validity

## Public Endpoints with @Public() Decorator

Since authentication is applied globally, endpoints that should be publicly accessible must be explicitly marked with the `@Public()` decorator.

### Controller-Level Public Access

Mark an entire controller as public:

```typescript
import { Controller, Get } from '@nestjs/common';
import { Public } from '../auth/decorators/public.decorator';

@Public()
@Controller('health')
export class HealthController {
  @Get()
  checkHealth() {
    // This endpoint is publicly accessible
    return { status: 'ok' };
  }
}
```

### Method-Level Public Access

Mark individual methods as public:

```typescript
import { Controller, Post, Get } from '@nestjs/common';
import { Public } from '../auth/decorators/public.decorator';

@Controller('auth')
export class AuthController {
  @Public()
  @Post('signin')
  signIn() {
    // Public endpoint - no authentication required
  }

  @Public()
  @Post('register')
  register() {
    // Public endpoint - no authentication required
  }

  @Get('profile')
  getProfile() {
    // Protected endpoint - JWT required
  }
}
```

### Current Public Endpoints

The following endpoints are currently marked as public:

- `POST /auth/signin` - User authentication
- `POST /auth/register` - User registration
- `GET /v1/health` - Health check endpoint

---

## Protected Endpoints and User Context

All endpoints not marked with `@Public()` are automatically protected and require a valid JWT token. The guard extracts user information from the token and makes it available in the request object.

### Accessing User Information in Controllers

```typescript
import { Controller, Get, Request } from '@nestjs/common';

@Controller('profile')
export class ProfileController {
  @Get()
  getProfile(@Request() req: any) {
    // User information is available from the JWT payload
    const user = req.user; // { sub: 'userId', username: 'johndoe' }
    return { message: `Hello ${user.username}` };
  }
}
```

The user object contains:

- `sub`: User ID (subject)
- `username`: User's username

## Security Best Practices

### Global Security Configuration

- **Secure by default:** All endpoints require authentication unless explicitly marked public
- **Explicit public marking:** Use `@Public()` decorator only when necessary
- **Regular audit:** Review all `@Public()` decorators to ensure they should remain public

### JWT Security

- **Use strong secrets:** Configure `JWT_SECRET` with a cryptographically secure random string
- **Set appropriate expiration:** Configure `JWT_EXPIRES_IN` (default: 1 hour) based on security requirements
- **Token storage:** Advise clients to store tokens securely (avoid localStorage for sensitive applications)

### Input Validation

- **Always validate input:** Use DTOs with class-validator decorators for all endpoints
- **Sanitize data:** Ensure user input is properly sanitized during registration and sign-in
- **Generic error messages:** Don't expose detailed error information that could aid attackers

### Error Handling

- **Consistent responses:** Return generic 401 errors for authentication failures
- **No information leakage:** Avoid revealing whether a username exists during sign-in failures
