import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';

import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

interface JwtPayload {
  sub: string;
  username: string;
}

interface RequestWithUser extends Request {
  user?: JwtPayload;
}

/**
 * JWT Authentication Guard
 * Protects endpoints by requiring a valid JWT present on the request.
 */
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private reflector: Reflector,
  ) {}

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

    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('Access token is required');
    }

    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>(token);
      // Add the token payload to the request as 'user' attribute
      // so that it can be accessed in route handlers
      request.user = payload;
    } catch {
      throw new UnauthorizedException('Invalid access token');
    }

    return true;
  }

  /**
   * Extracts the JWT token from the Authorization header.
   * @param request The HTTP request object.
   * @returns The JWT token or undefined if not present or malformed.
   */
  private extractTokenFromHeader(request: Request): string | undefined {
    const authorization = request.headers.authorization;
    if (!authorization) {
      return undefined;
    }

    const [type, token] = authorization.split(' ');
    return type === 'Bearer' ? token : undefined;
  }
}
