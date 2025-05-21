import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import { Repository } from 'typeorm';
import { CreateUserDTO } from './dto/create-user.dto';
import { UserResponseDTO } from './dto/user-response.dto';
import { User } from './entity/user.entity';
@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}
  async createUser(data: CreateUserDTO) {
    try {
      const user = this.userRepository.create({
        ...data,
        // password: bcrypt.hashSync(data.password, 10), // Hash the password before saving
      });
      const savedUser = await this.userRepository.save(user);

      return plainToInstance(UserResponseDTO, savedUser, {
        excludeExtraneousValues: true,
      });
    } catch (error) {
      if (error.code === '23505') {
        // PostgreSQL duplicate key error code
        throw new ConflictException('User with this email already exists');
      }
      throw new InternalServerErrorException('Failed to create user');
    }
  }

  findAllUsers() {
    return this.userRepository.find();
  }

  findOneUserById(id: string) {
    return this.userRepository.findOne({ where: { id } });
  }

  findOneUserByEmail(email: string) {
    return this.userRepository.findOne({ where: { email } });
  }

  updateUser(id: string, data: Partial<CreateUserDTO>) {
    return this.userRepository.update(id, data);
  }

  deleteUser(id: string) {
    return this.userRepository.delete(id);
  }
}
