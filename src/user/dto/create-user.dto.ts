export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
}

export interface CreateUserDto {
  username: string;
  password: string;
  email: string;
  phoneNumber?: number;
  role?: UserRole;
}
