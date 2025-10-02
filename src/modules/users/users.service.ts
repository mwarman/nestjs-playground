import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { User } from './entities/user.entity';

/**
 * Service for managing User entities.
 */
@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  /**
   * Fetch a single User from the database by id.
   * @param id The user identifier.
   * @returns A Promise that resolves to a User entity or null if not found.
   */
  async findOne(id: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { id },
    });
  }

  /**
   * Fetch a single User from the database by sub.
   * @param sub The user subject identifier.
   * @returns A Promise that resolves to a User entity or null if not found.
   */
  async findOneBySub(sub: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { sub },
    });
  }

  /**
   * Fetch a single User from the database by username.
   * @param username The username.
   * @returns A Promise that resolves to a User entity or null if not found.
   */
  async findOneByUsername(username: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { username },
    });
  }
}
