import { Injectable, NotFoundException } from '@nestjs/common';
import { DataSource, In } from 'typeorm';
import { Shows } from 'src/database/entities/Shows';
import { ShowsRepository } from './shows.repository';
import { Tickets } from 'src/database/entities/Tickets';
import { CreateShowWithTicketsDto } from './dto/create-show.dto';
import { validateShowTimes, validateTicketTimes, validateTicketQuantities } from 'src/common/utils/validateTime.util';

@Injectable()
export class ShowsService {
  constructor(
    private readonly showsRepository: ShowsRepository,
    private readonly dataSource: DataSource
  ) {}
  async create(eventId: number, showDtos: CreateShowWithTicketsDto[]) {

    const qr = this.dataSource.createQueryRunner();
    await qr.connect();
    await qr.startTransaction();
  
    try {
      // 1) Reconcile SHOWS: xóa các show không còn trong payload
      const dbShows = await qr.manager.find(Shows, { where: { event_id: eventId }, select: ['id'] });
      const dbShowIds = new Set(dbShows.map(s => s.id));
      const payloadShowIds = new Set((showDtos || []).filter(x => !!x.id).map(x => x.id!));
      const showIdsToDelete = [...dbShowIds].filter(id => !payloadShowIds.has(id));
  
      if (showIdsToDelete.length > 0) {
        await qr.manager.delete(Tickets, { show_id: In(showIdsToDelete) }); // nếu hard delete
        await qr.manager.delete(Shows, { id: In(showIdsToDelete) });
      }
  
      const upsertedShows: Shows[] = [];
  
      // 2) Upsert từng show + reconcile tickets theo show
      for (const showDto of (showDtos || [])) {
        validateShowTimes(showDto.start_time!, showDto.end_time!);
  
        let savedShow: Shows;
        if (showDto.id) {
          await qr.manager.update(Shows, showDto.id, {
            time_start: showDto.start_time,
            time_end: showDto.end_time,
          });
          savedShow = await qr.manager.findOneOrFail(Shows, { where: { id: showDto.id } });
        } else {
          savedShow = await qr.manager.save(Shows, {
            event_id: eventId,
            time_start: showDto.start_time,
            time_end: showDto.end_time,
          });
        }
  
        // 2.1) Reconcile TICKETS cho show này
        const dbTickets = await qr.manager.find(Tickets, { where: { show_id: savedShow.id }, select: ['id'] });
        const dbTicketIds = new Set(dbTickets.map(t => t.id));
        const payloadTicketIds = new Set((showDto.ticketTypes || []).filter(t => !!t.id).map(t => t.id!));
        const ticketIdsToDelete = [...dbTicketIds].filter(id => !payloadTicketIds.has(id));
        if (ticketIdsToDelete.length > 0) {
          await qr.manager.delete(Tickets, { id: In(ticketIdsToDelete) });
        }
  
        // 2.2) Upsert tickets
        for (const ticketDto of (showDto.ticketTypes || [])) {
          validateTicketTimes(showDto.start_time!, showDto.end_time!, ticketDto.start_time!, ticketDto.end_time!);
          validateTicketQuantities(ticketDto.min_ticket, ticketDto.max_ticket, ticketDto.total_ticket);
          if (ticketDto.id) {
            const { id: ticketId, ...rest } = ticketDto;
            await qr.manager.update(Tickets, ticketId, rest);
          } else {
            const timestamp = Date.now();
            const slug = `${ticketDto.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${timestamp}`;
            await qr.manager.save(Tickets, { ...ticketDto, slug, show_id: savedShow.id });
          }
        }
  
        upsertedShows.push(savedShow);
      }
  
      await qr.commitTransaction();
  
      // Trả về shows kèm tickets hiện tại sau reconcile
      const showsWithTickets = await Promise.all(
        upsertedShows.map(s => this.findOneWithTickets(s.id))
      );
      return showsWithTickets.filter(Boolean);
    } catch (e) {
      await qr.rollbackTransaction();
      throw e;
    } finally {
      await qr.release();
    }
  }

  async findAllByEvent(eventId: number): Promise<Shows[]> {
    return this.showsRepository.findAllByEvent(eventId);
  }

  async findOne(showId: number): Promise<Shows | null> {
    return this.showsRepository.findById(showId)
  }

  async findOneWithTickets(id: number): Promise<Shows | null> {
    return this.showsRepository.findOne({
      where: { id },
      relations: ['tickets'],
    });
  }

  async delete(eventId: number, showId: number): Promise<void> {
    const show = await this.findOne(showId);
    if (!show) {
      throw new NotFoundException(`Show with ID ${showId} not found for event ${eventId}`);
    }
    await this.showsRepository.delete(showId);
  }

  private async processShowsAndTickets(
    queryRunner: any, 
    eventId: number, 
    showDtos: CreateShowWithTicketsDto[]
  ): Promise<Shows[]> {
    const createdShows: Shows[] = [];

    for (const showDto of showDtos) {
      validateShowTimes(showDto.start_time!, showDto.end_time!);
      
      const savedShow = await this.saveOrUpdateShow(queryRunner, eventId, showDto);
      await this.processTicketsForShow(queryRunner, savedShow, showDto);
      
      createdShows.push(savedShow);
    }

    return createdShows;
  }

  private async saveOrUpdateShow(
    queryRunner: any, 
    eventId: number, 
    showDto: CreateShowWithTicketsDto
  ): Promise<Shows> {
    if (showDto.id) {
      await queryRunner.manager.update(Shows, showDto.id, {
        time_start: showDto.start_time,
        time_end: showDto.end_time,
      });
      return await queryRunner.manager.findOneOrFail(Shows, { where: { id: showDto.id } });
    } else {
      return await queryRunner.manager.save(Shows, {
        event_id: eventId,
        time_start: showDto.start_time,
        time_end: showDto.end_time,
      });
    }
  }

  private async processTicketsForShow(
    queryRunner: any, 
    savedShow: Shows, 
    showDto: CreateShowWithTicketsDto
  ): Promise<void> {
    if (!showDto.ticketTypes?.length) return;

    for (const ticketDto of showDto.ticketTypes) {
      validateTicketTimes(
        showDto.start_time!, 
        showDto.end_time!, 
        ticketDto.start_time!, 
        ticketDto.end_time!
      );

      await this.saveOrUpdateTicket(queryRunner, savedShow.id, ticketDto);
    }
  }

  private async saveOrUpdateTicket(
    queryRunner: any, 
    showId: number, 
    ticketDto: any
  ): Promise<void> {
    if (ticketDto.id) {
      const { id: ticketId, ...ticketUpdateData } = ticketDto;
      await queryRunner.manager.update(Tickets, ticketId, ticketUpdateData);
    } else {
      const slug = this.generateTicketSlug(ticketDto.name);
      await queryRunner.manager.save(Tickets, {
        ...ticketDto,
        slug,
        show_id: showId,
      });
    }
  }

  private generateTicketSlug(name: string): string {
    const timestamp = Date.now();
    return `${name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${timestamp}`;
  }

  private async getShowsWithTickets(shows: Shows[]): Promise<any[]> {
    return await Promise.all(
      shows.map(show => this.findOneWithTickets(show.id))
    );
  }

  async getTicketsByShow(showId : number) : Promise<any> {
      return this.showsRepository.getTicketsByShow(showId);
  }
}

