import { ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';

import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { AuthGuard } from '@nestjs/passport';

/**
 * JWT Authentication Guard
 * Protects endpoints by requiring a valid JWT present on the request.
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(
    private readonly jwtService: JwtService,
    private reflector: Reflector,
  ) {
    super();
  }

  /**
   * Determines if the request can activate the route handler.
   * @param context The execution context containing request information.
   * @returns A boolean indicating if the request is authorized.
   * @throws UnauthorizedException if the JWT is missing or invalid.
   */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Check if the route is marked as public with the @Public() decorator
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      // If the route is public, allow access
      return true;
    }

    return super.canActivate(context) as Promise<boolean>;
  }
}
