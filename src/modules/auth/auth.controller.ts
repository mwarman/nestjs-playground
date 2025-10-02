import { Body, Controller, HttpCode, HttpStatus, Post, UnauthorizedException } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { AuthService } from './auth.service';
import { SignInDto } from './dto/sign-in.dto';
import { SignInResultDto } from './dto/sign-in-result.dto';

/**
 * Controller for authentication endpoints.
 */
@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Sign in a user with username and password.
   * @param signInDto The sign in data transfer object.
   * @returns The JWT access token.
   */
  @ApiOperation({
    summary: 'Sign in user',
    description: 'Authenticate user with username and password',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully authenticated',
    type: SignInResultDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid credentials',
  })
  @HttpCode(HttpStatus.OK)
  @Post('signin')
  async signIn(@Body() signInDto: SignInDto): Promise<SignInResultDto> {
    try {
      return await this.authService.signIn(signInDto);
    } catch {
      // Return generic error message for security
      throw new UnauthorizedException('Invalid credentials');
    }
  }
}
