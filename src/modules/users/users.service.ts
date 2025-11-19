import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

import { CreateUserDto } from './dto/create-user.dto';
import { User } from './entities/user.entity';

/**
 * Service for managing User entities.
 */
@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(User, 'read-only')
    private readonly userRepositoryReadOnly: Repository<User>,
  ) {}

  /**
   * Fetch a single User from the database by id.
   * Uses the read-only database connection for optimal performance.
   * @param id The user identifier.
   * @returns A Promise that resolves to a User entity or null if not found.
   */
  async findOne(id: string): Promise<User | null> {
    return this.userRepositoryReadOnly.findOne({
      where: { id },
    });
  }

  /**
   * Fetch a single User from the database by sub.
   * @param sub The user subject identifier.
   * @returns A Promise that resolves to a User entity or null if not found.
   */
  async findOneBySub(sub: string): Promise<User | null> {
    return this.userRepositoryReadOnly.findOne({
      where: { sub },
    });
  }

  /**
   * Fetch a single User from the database by username.
   * @param username The username.
   * @returns A Promise that resolves to a User entity or null if not found.
   */
  async findOneByUsername(username: string): Promise<User | null> {
    return this.userRepositoryReadOnly.findOne({
      where: { username },
    });
  }

  /**
   * Create and persist a new User entity.
   * @param createUserDto The data transfer object containing user data.
   * @returns A Promise that resolves to the created User entity.
   */
  async create(createUserDto: CreateUserDto): Promise<User> {
    const user = new User();
    user.sub = uuidv4();
    user.firstName = createUserDto.firstName;
    user.lastName = createUserDto.lastName;
    user.email = createUserDto.email;
    user.username = createUserDto.username;
    user.passwordHash = createUserDto.passwordHash;
    user.passwordSalt = createUserDto.passwordSalt;

    return this.userRepository.save(user);
  }
}
