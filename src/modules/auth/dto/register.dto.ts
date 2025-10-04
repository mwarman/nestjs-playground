import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

/**
 * Data Transfer Object for user registration.
 */
export class RegisterDto {
  /**
   * The first name of the user.
   */
  @ApiProperty({
    description: 'The first name of the user',
    example: 'John',
    minLength: 1,
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(100)
  firstName: string;

  /**
   * The last name of the user.
   */
  @ApiProperty({
    description: 'The last name of the user',
    example: 'Doe',
    minLength: 1,
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(100)
  lastName: string;

  /**
   * The email address of the user.
   */
  @ApiProperty({
    description: 'The email address of the user',
    example: 'john.doe@example.com',
    maxLength: 255,
  })
  @IsEmail()
  @IsNotEmpty()
  @MaxLength(255)
  email: string;

  /**
   * The account username.
   */
  @ApiProperty({
    description: 'The account username',
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
   * The account password.
   */
  @ApiProperty({
    description: 'The account password',
    example: 'password123',
    minLength: 8,
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(100)
  password: string;
}
