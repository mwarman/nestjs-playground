import { ApiProperty } from '@nestjs/swagger';

/**
 * Data Transfer Object for authentication sign in result.
 */
export class SignInResultDto {
  /**
   * The JWT access token.
   */
  @ApiProperty({
    description: 'The access token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  accessToken: string;
}
