import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
} from '@nestjs/common';
import { EventRoleService } from './event-role.service';
import { CreateEventRoleDto } from './dto/create-event-role.dto';
import { UpdateEventRoleDto } from './dto/update-event-role.dto';

@Controller('/event-role/roles')
export class EventRoleController {
  constructor(private readonly eventRoleService: EventRoleService) { }

  @Post()
  create(@Body() createEventRoleDto: CreateEventRoleDto) {
    return this.eventRoleService.create(createEventRoleDto);
  }
  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updateEventRoleDto: UpdateEventRoleDto,
  ) {
    return this.eventRoleService.update(+id, updateEventRoleDto);
  }
  @Get()
  findAll() {
    return this.eventRoleService.findAllEventRole();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.eventRoleService.detail(+id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.eventRoleService.remove(+id);
  }
}
