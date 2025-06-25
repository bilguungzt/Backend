import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class UserService {
  register(createUserDto: CreateUserDto) {
    return {
      message: 'User registered successfully',
      data: {
        username: createUserDto.username,
        email: createUserDto.email,
        phoneNumber: createUserDto.phoneNumber,
        role: createUserDto.role || 'user',
      },
    };
  }

  login(loginDto: LoginDto) {
    return {
      message: 'User logged in successfully',
      data: {
        username: loginDto.username,
      },
    };
  }
}
