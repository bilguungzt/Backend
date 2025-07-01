import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { LoginDto } from '../user/dto/login.dto';
import { User, UserDocument } from '../user/schemas/user.schema';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private jwtService: JwtService,
  ) {
    void this.initializeDefaultUsers();
  }

  private async initializeDefaultUsers() {
    try {
      const adminExists = await this.userModel.findOne({ username: 'admin' });
      if (!adminExists) {
        const hashedPassword = await bcrypt.hash('admin123', 10);
        await this.userModel.create({
          username: 'admin',
          password: hashedPassword,
          email: 'admin@example.com',
          role: 'admin',
        });
      }

      const userExists = await this.userModel.findOne({ username: 'user' });
      if (!userExists) {
        const hashedPassword = await bcrypt.hash('user123', 10);
        await this.userModel.create({
          username: 'user',
          password: hashedPassword,
          email: 'user@example.com',
          role: 'user',
        });
      }
    } catch (error) {
      console.error('Error initializing default users:', error);
    }
  }

  async register(createUserDto: CreateUserDto) {
    const existingUser = await this.userModel.findOne({
      $or: [
        { username: createUserDto.username },
        { email: createUserDto.email },
      ],
    });

    if (existingUser) {
      throw new UnauthorizedException(
        'User with this username or email already exists',
      );
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    const newUser = await this.userModel.create({
      username: createUserDto.username,
      password: hashedPassword,
      email: createUserDto.email,
      phoneNumber: createUserDto.phoneNumber,
      role: createUserDto.role || 'user',
    });

    const userObject = newUser.toObject();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...result } = userObject;
    return {
      message: 'User registered successfully',
      data: result,
    };
  }

  async login(loginDto: LoginDto) {
    const user = await this.userModel.findOne({ username: loginDto.username });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = {
      sub: (user._id as any).toString(),
      username: user.username,
      role: user.role,
    };

    const token = this.jwtService.sign(payload);

    return {
      message: 'Login successful',
      data: {
        user: {
          id: (user._id as any).toString(),
          username: user.username,
          email: user.email,
          role: user.role,
        },
        accessToken: token,
      },
    };
  }

  async getAllUsers() {
    const users = await this.userModel.find().select('-password').exec();
    return users.map((user) => ({
      id: (user._id as any).toString(),
      username: user.username,
      email: user.email,
      phoneNumber: user.phoneNumber,
      role: user.role,
    }));
  }

  async findUserById(id: string) {
    const user = await this.userModel.findById(id).select('-password').exec();
    if (!user) {
      return null;
    }
    return {
      id: (user._id as any).toString(),
      username: user.username,
      email: user.email,
      phoneNumber: user.phoneNumber,
      role: user.role,
    };
  }
}
