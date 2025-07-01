import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateUserDto, UserRole } from './dto/create-user.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class ValidationService {
  validateCreateUser(data: any): CreateUserDto {
    const errors: string[] = [];

    if (
      !data.username ||
      typeof data.username !== 'string' ||
      data.username.trim() === ''
    ) {
      errors.push('username must be a non-empty string');
    }

    if (
      !data.password ||
      typeof data.password !== 'string' ||
      data.password.trim() === ''
    ) {
      errors.push('password must be a non-empty string');
    }

    if (!data.email || typeof data.email !== 'string') {
      errors.push('email must be a string');
    } else if (!this.isValidEmail(data.email)) {
      errors.push('email must be a valid email address');
    }

    if (data.phoneNumber !== undefined) {
      if (typeof data.phoneNumber !== 'number' || data.phoneNumber <= 0) {
        errors.push('phoneNumber must be a positive number');
      }
    }

    if (data.role !== undefined) {
      if (!Object.values(UserRole).includes(data.role)) {
        errors.push('role must be either "user" or "admin"');
      }
    }

    const allowedFields = [
      'username',
      'password',
      'email',
      'phoneNumber',
      'role',
    ];
    const extraFields = Object.keys(data).filter(
      (key) => !allowedFields.includes(key),
    );
    if (extraFields.length > 0) {
      extraFields.forEach((field) => {
        errors.push(`property ${field} should not exist`);
      });
    }

    if (errors.length > 0) {
      throw new BadRequestException({
        message: errors,
        error: 'Bad Request',
        statusCode: 400,
      });
    }

    return {
      username: data.username.trim(),
      password: data.password.trim(),
      email: data.email.trim(),
      phoneNumber: data.phoneNumber,
      role: data.role,
    };
  }

  validateLogin(data: any): LoginDto {
    const errors: string[] = [];

    if (
      !data.username ||
      typeof data.username !== 'string' ||
      data.username.trim() === ''
    ) {
      errors.push('username must be a non-empty string');
    }

    if (
      !data.password ||
      typeof data.password !== 'string' ||
      data.password.trim() === ''
    ) {
      errors.push('password must be a non-empty string');
    }

    const allowedFields = ['username', 'password'];
    const extraFields = Object.keys(data).filter(
      (key) => !allowedFields.includes(key),
    );
    if (extraFields.length > 0) {
      extraFields.forEach((field) => {
        errors.push(`property ${field} should not exist`);
      });
    }

    if (errors.length > 0) {
      throw new BadRequestException({
        message: errors,
        error: 'Bad Request',
        statusCode: 400,
      });
    }

    return {
      username: data.username.trim(),
      password: data.password.trim(),
    };
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}
