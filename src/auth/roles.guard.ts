import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '../user/dto/create-user.dto';
import { ROLES_KEY } from './roles.decorator';

interface RequestWithUser extends Request {
  user: {
    userId: string;
    username: string;
    role: UserRole;
  };
}

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles) {
      return true;
    }

    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const user = request.user;
    
    if (!user) {
      return false;
    }

    return requiredRoles.some((role) => user.role === role);
  }
}
