import { IsString, IsEmail, IsOptional, IsEnum, IsNumber } from 'class-validator';

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
}

export class CreateUserDto {
  @IsString()
  username: string;

  @IsString()
  password: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsNumber()
  phoneNumber?: number;

  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;
}
