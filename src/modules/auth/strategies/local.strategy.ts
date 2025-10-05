import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';

import { AuthService } from '../auth.service';
import { User } from 'src/modules/users/entities/user.entity';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger(LocalStrategy.name);

  constructor(private authService: AuthService) {
    super();
  }

  async validate(username: string, password: string): Promise<User> {
    this.logger.debug(`LocalStrategy: Validating user: ${username}`);
    const user = await this.authService.verifyCredentials({ username, password });
    if (!user) {
      this.logger.warn(`LocalStrategy: Invalid credentials for user: ${username}`);
      throw new UnauthorizedException();
    }
    this.logger.debug(`LocalStrategy: Successfully validated user: ${username}`);
    return user;
  }
}
