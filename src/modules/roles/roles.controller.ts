import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { RolesService } from './roles.service';
import { AddOrUpdatePermissionInRoleDto } from './dto/add-or-update-permission-in-role.dto';
import { PermissionRoute } from '../../common/decorators/permission.decorator';
import { PERMISSION_CODE } from '../../common/constants/permission.constant';
import { PermissionsGuard } from '../../common/guards/permisson.guard';
import { JwtService } from '@nestjs/jwt';
import { JwtAccessGuard } from '../auth/guards/jwt-access.guard';

@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Post(':id/permissions')
  @UseGuards(JwtAccessGuard, PermissionsGuard)
  @PermissionRoute(
    PERMISSION_CODE.ADD_OR_UPDATE_PERMISSION_IN_ROLE,
    'roles',
    'post',
    'ADD OR UPDATE PERMISSION IN ROLE',
  )
  addPermissions(
    @Param('id', ParseIntPipe) id: number,
    @Body() dataDto: AddOrUpdatePermissionInRoleDto,
  ) {
    return this.rolesService.addOrUpdatePermissions(id, dataDto);
  }
  @Get(':id')
  getRoleById(@Param('id', ParseIntPipe) id: number) {
    return this.rolesService.detail(id);
  }
}
