import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { UsersService } from '../users/users.service';
import { SignInDto } from './dto/sign-in.dto';
import { SignInResultDto } from './dto/sign-in-result.dto';

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
   * Sign in a user with username and password.
   * @param signInDto The sign in data transfer object.
   * @returns A Promise that resolves to SignInResultDto containing the access token.
   * @throws UnauthorizedException if credentials are invalid.
   */
  async signIn(signInDto: SignInDto): Promise<SignInResultDto> {
    const { username, password } = signInDto;

    // Fetch the user by username
    const user = await this.usersService.findOneByUsername(username);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Verify the password
    const isPasswordValid = await this.verifyPassword(password, user.passwordSalt, user.passwordHash);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Create JWT payload
    const payload = {
      sub: user.sub,
      username: user.username,
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
}
