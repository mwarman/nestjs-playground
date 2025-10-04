import { IsEmail, IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

/**
 * Data Transfer Object for creating a user.
 */
export class CreateUserDto {
  /**
   * The first name of the user.
   */
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(100)
  firstName: string;

  /**
   * The last name of the user.
   */
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(100)
  lastName: string;

  /**
   * The email address of the user.
   */
  @IsEmail()
  @IsNotEmpty()
  @MaxLength(255)
  email: string;

  /**
   * The account username.
   */
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(50)
  username: string;

  /**
   * The hashed password.
   */
  @IsString()
  @IsNotEmpty()
  passwordHash: string;

  /**
   * The password salt.
   */
  @IsString()
  @IsNotEmpty()
  passwordSalt: string;
}
