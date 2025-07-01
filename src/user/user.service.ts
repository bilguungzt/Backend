import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { AuthService } from '../auth/auth.service';

@Injectable()
export class UserService {
  constructor(private authService: AuthService) {}

  async register(createUserDto: CreateUserDto) {
    return this.authService.register(createUserDto);
  }

  async login(loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  async getAllUsers() {
    return {
      message: 'Users retrieved successfully',
      data: await this.authService.getAllUsers(),
    };
  }
}
