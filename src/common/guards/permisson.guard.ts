import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSION_CODE } from '../constants/permission.constant';
import { PERMISSION_KEY } from '../decorators/permission.decorator';
import { JwtPayload } from '../../modules/auth/types/jwt-payload';
import { RolesService } from '../../modules/roles/roles.service';
import { PermissionMetadata } from '../interfaces/permission.interface';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly roleService: RolesService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions =
      this.reflector.getAllAndOverride<PermissionMetadata>(PERMISSION_KEY, [
        context.getHandler(),
        context.getClass(),
      ]);
    console.log('Required Permissions:', requiredPermissions);
    if (!requiredPermissions) return true;
    const request = context
      .switchToHttp()
      .getRequest<{ user: JwtPayload; params?: any; body?: any }>();
    const user = request.user;
    if (!user) {
      throw new UnauthorizedException('Not authorized');
    }
    const user_id = user.sub;
    if (
      !this.roleService.checkPermissionUser(
        user_id,
        requiredPermissions?.routeCode,
      )
    ) {
      return false;
    }

    return true;
  }
}
