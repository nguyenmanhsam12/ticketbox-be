import { Injectable, OnModuleInit } from '@nestjs/common';
import { DiscoveryService, Reflector } from '@nestjs/core';
import { PermissionRepo } from './permission.repo';
import { PERMISSION_KEY } from '../../common/decorators/permission.decorator';
import { In, Like } from 'typeorm';
import { PermissionMetadata } from '../../common/interfaces/permission.interface';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

@Injectable()
export class PermissionsService implements OnModuleInit {
  constructor(
    private readonly permissionRepo: PermissionRepo,
    private readonly reflector: Reflector,
    private readonly discoveryService: DiscoveryService,
  ) {}
  async onModuleInit() {
    const controllers = this.discoveryService.getControllers();

    const permissions: PermissionMetadata[] = [];
    for (const wrapper of controllers) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const { instance } = wrapper;
      if (!instance) continue;

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const prototype = Object.getPrototypeOf(instance);
      const methods = Object.getOwnPropertyNames(prototype).filter(
        (method) => method !== 'constructor',
      );

      for (const method of methods) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access
        const handler = prototype[method];
        const metadata: PermissionMetadata = this.reflector.get(
          PERMISSION_KEY,
          handler,
        );
        if (metadata) {
          permissions.push(metadata);
        }
      }
    }
    const routeCodes = permissions
      .map((p) => p.routeCode)
      .filter((code): code is string => !!code);

    const listPermissions = await this.permissionRepo.findAll({
      where: { route_code: In(routeCodes) },
    });

    const newPermissions = permissions.filter(
      (p) => !listPermissions.some((lp) => lp.route_code === p.routeCode),
    );
    if (newPermissions.length > 0) {
      const formattedPermissions = newPermissions.map(
        ({ routeCode, path, method, display_name }) => ({
          route_code: routeCode,
          path,
          method,
          display_name,
        }),
      );

      await this.permissionRepo.save(formattedPermissions);
    }
  }
  async getGroupedRoutes(pagination: PaginationQueryDto) {
    const { page, limit, order = 'ASC', sortBy = 'id', search } = pagination;

    const pageNumber = parseInt(String(page), 10);
    const limitNumber = parseInt(String(limit), 10);

    const whereConditions: any = {};
    if (search) {
      whereConditions.display_name = Like(`%${search}%`);
    }

    const [data, total] = await this.permissionRepo.findAndCount({
      order: { [sortBy]: order, method: 'ASC' },
      skip: (pageNumber - 1) * limitNumber,
      take: limitNumber,
      where: whereConditions,
    });

    const groupedRoutes = data.reduce(
      (acc, { id, route_code, path, method, display_name }) => {
        if (!acc[path]) {
          acc[path] = { path, permissions: [] };
        }
        acc[path].permissions.push({ id, route_code, path, method, display_name });
        return acc;
      },
      {},
    );
    const groupedRoutesObj = Object.values(groupedRoutes);

    return {
      data: groupedRoutesObj,
      pagination: {
        totalItems: total,
        page: pageNumber,
        limit: limitNumber,
        totalPages: Math.ceil(total / limitNumber),
      },
    };
  }
}
