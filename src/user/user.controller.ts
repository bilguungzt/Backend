import { Controller, Post, Get, Body, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CreateUserDto, UserRole } from './dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { UserService } from './user.service';
import { ValidationService } from './validation.service';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly validationService: ValidationService,
  ) {}

  @Post('register')
  async register(@Body() body: any) {
    const createUserDto: CreateUserDto =
      this.validationService.validateCreateUser(body);
    return this.userService.register(createUserDto);
  }

  @Post('login')
  async login(@Body() body: any) {
    const loginDto: LoginDto = this.validationService.validateLogin(body);
    return this.userService.login(loginDto);
  }

  @Get('all')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN)
  getAllUsers() {
    return this.userService.getAllUsers();
  }
}
