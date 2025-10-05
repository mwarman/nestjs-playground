import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

/**
 * Data Transfer Object for authentication JWT payload.
 */
export class JwtPayloadDto {
  /**
   * The account username.
   */
  @ApiProperty({
    description: 'Username for the user account',
    example: 'johndoe',
    minLength: 3,
    maxLength: 50,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(50)
  username: string;

  /**
   * The subject identifier for the user (UUID).
   */
  @ApiProperty({
    description: 'Subject identifier for the user used in authentication tokens',
    example: 'b7a9c8d5-e2f1-4a3b-9c7d-6e5f4a3b2c1d',
  })
  @IsString()
  @IsNotEmpty()
  sub: string;
}
