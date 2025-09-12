import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PermissionCode } from '../enums/eventPermission.enum';
import { PERMISSIONS_KEY } from '../decorators/permissionEvent.decorator';
import { EventRolePermissionService } from 'src/modules/event-role-permission/event-role-permission.service';
import { JwtPayload } from 'src/modules/auth/types/jwt-payload';
import { EventsService } from 'src/modules/events/events.service';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly eventRolePermissionService: EventRolePermissionService,
    private readonly eventService: EventsService,
  ) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride<
      PermissionCode[]
    >(PERMISSIONS_KEY, [context.getHandler(), context.getClass()]);

    if (!requiredPermissions) return true;

    const request = context
      .switchToHttp()
      .getRequest<{ user: JwtPayload; params?: any; body?: any }>();
    const user = request.user;

    if (!user) throw new ForbiddenException('User is not authenticated');

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access
    const eventId = request.params?.eventId || request.body?.eventId;
    if (!eventId) throw new ForbiddenException('Event ID is missing');

    const checkOwnerEvent = await this.eventService.findAll({
      where: { id: +eventId, created_by: user.sub },
    });
    if (checkOwnerEvent.length > 0) {
      return true;
    }


    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const userPermissions = await this.eventRolePermissionService.getUserEventPermissions(user.sub, eventId);
    const hasPermission = requiredPermissions.some((perm) =>
      userPermissions.includes(perm),
    );

    if (!hasPermission) {
      throw new ForbiddenException('You do not have the required permissions');
    }

    return true;
  }
}
