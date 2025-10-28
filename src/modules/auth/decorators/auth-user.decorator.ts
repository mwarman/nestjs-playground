import { createParamDecorator, ExecutionContext } from '@nestjs/common';

import { JwtPayloadDto } from '../dto/jwt-payload.dto';

/**
 * Custom decorator to extract the authenticated user from the request.
 * This decorator retrieves the user information from the JWT payload
 * that has been validated and attached to the request by the JWT strategy.
 *
 * @example
 * ```typescript
 * @Get()
 * findAll(@AuthUser() user: JwtPayloadDto): Promise<Task[]> {
 *   return this.tasksService.findAll(user.id);
 * }
 * ```
 *
 * @example Extract specific property
 * ```typescript
 * @Get()
 * findAll(@AuthUser('id') userId: string): Promise<Task[]> {
 *   return this.tasksService.findAll(userId);
 * }
 * ```
 */
export const AuthUser = createParamDecorator((data: keyof JwtPayloadDto, ctx: ExecutionContext) => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const request = ctx.switchToHttp().getRequest();
  const user = request.user as JwtPayloadDto;

  return data ? user?.[data] : user;
});
