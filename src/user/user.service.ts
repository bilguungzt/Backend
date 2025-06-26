/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { User, UserDocument } from './user.schema';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async register(userInfo: CreateUserDto) {
    try {
      const existingUser = await this.userModel.findOne({
        $or: [{ username: userInfo.username }, { email: userInfo.email }],
      });

      if (existingUser) {
        throw new BadRequestException(
          'A user with this username or email already exists.',
        );
      }

      const saltRounds = 10;
      const scrambledPassword = await bcrypt.hash(
        userInfo.password,
        saltRounds,
      );

      const newUser = new this.userModel({
        ...userInfo,
        password: scrambledPassword,
      });

      const savedUser = await newUser.save();

      const { password: _, ...userWithoutPassword } = savedUser.toObject();

      return {
        message: 'User created successfully!',
        data: userWithoutPassword,
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Sorry, we could not create the user.');
    }
  }

  async login(loginInfo: LoginDto) {
    try {
      const user = await this.userModel.findOne({
        username: loginInfo.username,
      });

      if (!user) {
        throw new UnauthorizedException('Incorrect username or password.');
      }

      const doPasswordsMatch = await bcrypt.compare(
        loginInfo.password,
        user.password,
      );

      if (!doPasswordsMatch) {
        throw new UnauthorizedException('Incorrect username or password.');
      }

      const { password, ...userWithoutPassword } = user.toObject();

      return {
        message: 'You are now logged in!',
        data: userWithoutPassword,
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Sorry, the login failed.');
    }
  }

  async getAllUsers() {
    const users = await this.userModel.find().select('-password');
    return users;
  }
}
