import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { User } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { SignInDto } from './dto/sign-in.dto';
import { SignInResultDto } from './dto/sign-in-result.dto';
import { JwtPayloadDto } from './dto/jwt-payload.dto';

/**
 * Service for authentication operations.
 */
@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Verify user credentials.
   * @param signInDto The sign in data transfer object.
   * @returns A Promise that resolves to User if credentials are valid, null otherwise.
   */
  async verifyCredentials(signInDto: SignInDto): Promise<User | null> {
    const { username, password } = signInDto;

    // Fetch the user by username
    const user = await this.usersService.findOneByUsername(username);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Verify the password
    const isPasswordValid = await this.verifyPassword(password, user.passwordSalt, user.passwordHash);

    if (!isPasswordValid) {
      return null;
    }

    return user;
  }

  /**
   * Sign in a User with username and password.
   * @param signInDto The sign in data transfer object.
   * @returns A Promise that resolves to SignInResultDto containing the access token.
   * @throws UnauthorizedException if credentials are invalid.
   */
  async signIn(signInDto: SignInDto): Promise<SignInResultDto> {
    // Verify user credentials
    const user = await this.verifyCredentials(signInDto);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Create JWT payload
    const payload: JwtPayloadDto = {
      sub: user.sub,
      username: user.username,
      id: user.id,
    };

    // Generate access token
    const accessToken = await this.jwtService.signAsync(payload);

    return {
      accessToken,
    };
  }

  /**
   * Verify a password against its salt and hash.
   * @param password The plain text password to verify.
   * @param salt The password salt.
   * @param hash The password hash.
   * @returns A Promise that resolves to true if password is valid, false otherwise.
   */
  private async verifyPassword(password: string, salt: string, hash: string): Promise<boolean> {
    const hashedPassword = await bcrypt.hash(password, salt);
    return hashedPassword === hash;
  }

  /**
   * Hash a password with a salt.
   * @param password The plain text password to hash.
   * @param saltRounds The number of salt rounds to use (default: 10).
   * @returns A Promise that resolves to an object containing the salt and hash.
   */
  async hashPassword(password: string, saltRounds: number = 10): Promise<{ salt: string; hash: string }> {
    const salt = await bcrypt.genSalt(saltRounds);
    const hash = await bcrypt.hash(password, salt);
    return { salt, hash };
  }

  /**
   * Register a new user account.
   * @param registerDto The registration data transfer object.
   * @returns A Promise that resolves to the created User entity.
   */
  async register(registerDto: RegisterDto): Promise<User> {
    const { firstName, lastName, email, username, password } = registerDto;

    // Create password salt and hash
    const { salt, hash } = await this.hashPassword(password);

    // Create user via Users service
    const user = await this.usersService.create({
      firstName,
      lastName,
      email,
      username,
      passwordSalt: salt,
      passwordHash: hash,
    });

    return user;
  }
}
