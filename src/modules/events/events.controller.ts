import { Controller, Get, Param, Query, Post, Body, Patch, Delete, Req, ParseIntPipe, Put, UseInterceptors, UploadedFiles } from '@nestjs/common';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { CreateSettingDto } from './dto/create-setting.dto';
import { CreatePaymentEventDto } from './dto/create-payment.dto';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { FileUploadService } from 'src/common/services/file-upload.service';
import { UpdateEventDto } from './dto/update-event.dto';

@Controller('events')
export class EventsController {
  constructor(
    private readonly eventsService: EventsService,
    private readonly fileUploadService: FileUploadService,
  ) { }

  //danh sách event theo danh mục
  @Get('discovery/categories')
  getEvents() {
    const fakeIp = '113.22.17.0';
    return this.eventsService.getEvents(fakeIp);
  }

  @Get('/')
  getAll() {
    return this.eventsService.findAll();
  }

  @Get('/draft')
  getDraftEvents() {
    return this.eventsService.getDraftEvents();
  }

  @Get('/pending')
  getPendingEvents() {
    return this.eventsService.getPendingEvents();
  }

  @Get('/upcoming')
  getUpcomingEvents() {
    return this.eventsService.getUpcomingEvents();
  }

  @Get('/past')
  getPastEvents() {
    return this.eventsService.getPastEvents();
  }

  @Post()
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'thumbnail', maxCount: 1 },
      { name: 'banner', maxCount: 1 },
      { name: 'org_thumbnail', maxCount: 1 },
    ]),
  )
  async create(
    @Req() req: any,
    @Body() createEventDto: CreateEventDto,
    @UploadedFiles() files: {
      thumbnail: Express.Multer.File[],
      banner: Express.Multer.File[],
      org_thumbnail: Express.Multer.File[]
    },
  ) {

    const uploadedFiles = await this.fileUploadService.uploadEventFiles(files);

    Object.assign(createEventDto, uploadedFiles);
    return this.eventsService.createWithOwner(1, createEventDto);
  }


  @Patch(':id')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'thumbnail', maxCount: 1 },
      { name: 'banner', maxCount: 1 },
      { name: 'org_thumbnail', maxCount: 1 },
    ]),
  )
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateEventDto: UpdateEventDto,
    @UploadedFiles() files?: {
      thumbnail?: Express.Multer.File[];
      banner?: Express.Multer.File[];
      org_thumbnail?: Express.Multer.File[];
    },
  ) {
    const uploadedFiles = files
      ? await this.fileUploadService.uploadEventFiles(files)
      : {};
    Object.assign(updateEventDto, uploadedFiles);
    return this.eventsService.update(id, updateEventDto);
  }

  @Patch(':eventId/publish')
  publish(@Param('eventId', ParseIntPipe) eventId: number) {
    return this.eventsService.publish(eventId);
  }

  //event theo tháng , tuần
  @Get('recommended-events')
  getEventsByWeekOrByMonth(
    @Query('at') at: string,
    @Query('from') from: string,
    @Query('to') to: string,
  ) {
    return this.eventsService.getEventsByWeekOrByMonth(at, from, to);
  }

  //banner
  @Get('discovery/banners')
  getEventsBanner() {
    return this.eventsService.getEventsBanner();
  }

  @Get('search')
  searchEvents(
    @Query("q") q?: string,
    @Query("cate") cate?: string,
    @Query('page') page = '1',
    @Query('limit') limit = '20',
  ) {

    console.log('q', q);


    return this.eventsService.searchEvents({ q, cate, page: parseInt(page), limit: parseInt(limit) });
  }

  @Get('detail/:id')
  getEventDetail(@Param('id') id: string) {
    return this.eventsService.getEventDetail(+id);
  }

  @Get('event-suggestions/:id')
  getEventSuggestions(@Param('id') id: string) {
    return this.eventsService.getEventSuggestions(+id);
  }
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.eventsService.findOne(id);
  }


  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.eventsService.delete(id);
  }

  @Put('/:eventId/settings')
  createSetting(
    @Param('eventId', ParseIntPipe) eventId: number,
    @Body() createSettingDto: CreateSettingDto
  ) {
    return this.eventsService.createSetting(eventId, createSettingDto)
  }

  @Get(':eventId/settings')
  getSettings(@Param('eventId', ParseIntPipe) eventId: number) {
    return this.eventsService.getSettings(eventId);
  }

  // @Put(':eventId/payment-info')
  // createPaymentInfo(
  //   @Param('eventId', ParseIntPipe) eventId: number,
  //   @Body() createPaymentDto: CreatePaymentEventDto
  // ) {
  //   return this.eventsService.createPaymentInfo(eventId, createPaymentDto)
  // }

  // @Get(':eventId/payment-info')
  // getPaymentInfo(@Param('eventId', ParseIntPipe) eventId: number) {
  //   return this.eventsService.getPaymentInfo(eventId);
  // }
}
