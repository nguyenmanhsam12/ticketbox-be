import { BaseService } from 'src/common/base/base.service';
import { EventRepository } from './events.repo';
import axios from 'axios';
import {
  Injectable,
  NotFoundException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { CreateEventDto } from './dto/create-event.dto';

import { Events } from 'src/database/entities/Events';
import { EventsRepository } from './repositories/events.repository';
import { SettingsRepository } from './repositories/settings.repository';
import { CreateSettingDto } from './dto/create-setting.dto';
import { CreatePaymentEventDto } from './dto/create-payment.dto';
import { PaymentEventRepository } from './repositories/payment-event.repository';
import { ApprovalStatus } from 'src/common/enums/event.enum';
import { UpdateEventDto } from './dto/update-event.dto';

@Injectable()
export class EventsService extends BaseService<Events> {
  constructor(
    private readonly eventRepository: EventRepository,
    private readonly eventsRepo: EventsRepository,
    private readonly settingRepo: SettingsRepository,
    private readonly paymentRepo: PaymentEventRepository,
  ) {
    super(eventRepository);
  }

  private async getLocationFromIp(
    ip: string,
  ): Promise<{ city?: string; regionName?: string; country?: string } | null> {
    try {
      const res = await axios.get(
        `http://ip-api.com/json/${ip}?fields=city,regionName,country`,
      );
      return res.data; // { city: 'Hanoi', regionName: 'Hà Nội', country: 'Vietnam' }
    } catch (err: any) {
      console.error('Error fetching location from IP:', err?.message);
      return null;
    }
  }

  async getEvents(fakeIp: string): Promise<any> {
    const location = await this.getLocationFromIp(fakeIp);
    const regionName = location?.regionName ?? '';
    return this.eventRepository.getEvents(regionName);
  }

  async getEventsByWeekOrByMonth(
    at: string,
    from: string,
    to: string,
  ): Promise<any> {
    if (!at || !from || !to) {
      throw new HttpException(
        'Missing required query parameters',
        HttpStatus.BAD_REQUEST,
      );
    }

    const fromDate = new Date(from);
    const toDate = new Date(to);

    return this.eventRepository.getEventsByWeekOrByMonth(fromDate, toDate);
  }

  async getEventsBanner(): Promise<any> {
    return this.eventRepository.getEventsBanner();
  }

  async searchEvents(params: {
    q?: string;
    cate?: string;
    page: number;
    limit: number;
  }): Promise<any> {

    const { q, cate, page, limit } = params;

    const skip = (page - 1) * limit;

    return this.eventRepository.searchEvents({ q, cate, page, limit, skip });
  }

  async getEventDetail(id: number): Promise<any> {
    return this.eventRepository.getEventDetail(id);
  }

  async getEventSuggestions(id: number): Promise<any> {
    return await this.eventRepository.getEventSuggestions(id);
  }

  async createWithOwner(userId: number | undefined, dto: CreateEventDto) {
    // Generate unique slug using utility function
    //
    const timestamp = Date.now();
    const slug = `${dto.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${timestamp}`;

    return this.create({
      ...dto,
      slug,
      created_by: userId || 1,
    });
  }

  async publish(eventId: number) {
    const event = await this.eventsRepo.findById(eventId);
    if (!event) throw new NotFoundException(`Event with id "${eventId}" not found`);
    event.status = ApprovalStatus.PENDING;
    return this.eventsRepo.update(eventId, event);
  }

  findOne(id: number) {
    return this.eventsRepo.findById(id);
  }

  findBySlug(slug: string) {
    return this.eventsRepo.findBySlug(slug);
  }

  async updateBySlug(slug: string, updateEventDto: UpdateEventDto) {
    const event = await this.findBySlug(slug);
    if (!event)
      throw new NotFoundException(`Event with slug "${slug}" not found`);
    Object.assign(event, updateEventDto);
    return this.eventsRepo.update(event.id, updateEventDto as Partial<Events>);
  }

  async deleteBySlug(slug: string) {
    const event = await this.findBySlug(slug);
    if (!event)
      throw new NotFoundException(`Event with slug "${slug}" not found`);
    return this.eventsRepo.delete(event.id);
  }

  // Override base methods to use slugs
  async update(id: number, dto: Partial<Events>) {
    return super.update(id, dto);
  }

  async remove(id: number) {
    return super.delete(id);
  }

  async createSetting(eventId: number, dto: CreateSettingDto) {
    await this.eventsRepo.findById(eventId);

    const existingSetting = await this.settingRepo.findOne({
      where: { event_id: eventId },
    });
    if (existingSetting) {
      await this.settingRepo.update(existingSetting.id, {
        ...dto,
        event_id: eventId,
        updated_at: new Date(),
      });

      return this.settingRepo.findOne({
        where: { id: existingSetting.id },
      });
    } else {
      return this.settingRepo.create({
        ...dto,
        event_id: eventId,
      });
    }
  }

  async getSettings(eventId: number) {
    await this.eventsRepo.findById(eventId);
    return this.settingRepo.findByEventId(eventId);
  }

  async createPaymentInfo(eventId: number, dto: CreatePaymentEventDto) {
    await this.eventsRepo.findById(eventId);

    const existingPayment = await this.paymentRepo.findOne({
      where: { event_id: eventId },
    });

    if (existingPayment) {
      await this.paymentRepo.update(existingPayment.id, {
        ...dto,
        event_id: eventId,
        updated_at: new Date(),
      });

      return this.paymentRepo.findOne({
        where: { id: existingPayment.id },
      });
    } else {
      return this.paymentRepo.create({
        ...dto,
        event_id: eventId,
      });
    }
  }

  async getPaymentInfo(eventId: number) {
    await this.eventsRepo.findById(eventId);
    return this.paymentRepo.findByEventId(eventId);
  }

  async getDraftEvents() {
    return this.eventsRepo.findAll({ where: { status: ApprovalStatus.DRAFT } });
  }

  async getUpcomingEvents() {
    const now = new Date();
    const events = await this.eventsRepo.findAll({
      relations: { shows: true },
      order: { shows: { time_start: 'ASC' } }, // để shows[0] là show đầu tiên
      select: {
        id: true, name: true, thumbnail: true, banner: true, slug: true, status: true,
        shows: { time_start: true, time_end: true, id: true, event_id: true }
      } as any,
    });
    return events.filter(e => e.shows?.length && new Date(e.shows[0].time_start) > now);
  }

  async getPastEvents() {
    const now = new Date();
    const events = await this.eventsRepo.findAll({
      relations: { shows: true },
      order: { shows: { time_start: 'ASC' } },
      select: {
        id: true, name: true, thumbnail: true, banner: true, slug: true, status: true,
        shows: { time_start: true, time_end: true, id: true, event_id: true }
      } as any,
    });

    const getLastEnd = (shows: { time_start: Date; time_end?: Date }[]) => {
      const sorted = [...shows].sort((a, b) => +new Date(a.time_start) - +new Date(b.time_start));
      const last = sorted[sorted.length - 1];
      return last.time_end ?? last.time_start;
    };

    return events.filter(e => e.shows?.length && new Date(getLastEnd(e.shows)) < now);
  }

  async getPendingEvents() {
    return this.eventsRepo.findAll({ where: { status: ApprovalStatus.PENDING } });
  }
}
