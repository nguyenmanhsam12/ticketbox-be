import { Controller, Get, Query } from '@nestjs/common';
import { PermissionsService } from './permissions.service';
import { PermissionRoute } from '../../common/decorators/permission.decorator';
import {
  PERMISSION_CODE,
  PERMISSION_PATH,
} from '../../common/constants/permission.constant';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

@Controller('permissions')
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}
  @Get()
  @PermissionRoute(
    PERMISSION_CODE.VIEW_ALL_PERMISSION,
    PERMISSION_PATH.PERMISSION,
    'GET',
    'View all permissions',
  )
  getGroupedRoutes(@Query() pagination: PaginationQueryDto) {
    return this.permissionsService.getGroupedRoutes(pagination);
  }
}
