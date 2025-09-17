import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseRepository } from 'src/common/base/base.repository';
import { CartItems } from 'src/database/entities/CartItems';
import { EntityManager, Repository } from 'typeorm';

@Injectable()
export class CartItemRepository extends BaseRepository<CartItems> {
  constructor(
    @InjectRepository(CartItems)
    private readonly cartItemRepo: Repository<CartItems>,
  ) {
    super(cartItemRepo);
  }

  findOneByCartAndTicket(manager: EntityManager, cartId: number, ticketId: number) {
    return manager.findOne(CartItems, {
      where: { cart: { id: cartId }, ticket: { id: ticketId } },
      relations: ['ticket'],
    });
  }

  createWithManager(manager: EntityManager, partial: Partial<CartItems>) {
    const entity = manager.create(CartItems, partial);
    return manager.save(entity);
  }

  saveWithManager(manager: EntityManager, cartItem: CartItems) {
    return manager.save(cartItem);
  }

  async softDeleteByCartId(cartId: number, manager?: EntityManager): Promise<void> {
    const repo = manager ? manager.getRepository(CartItems) : this.cartItemRepo;
    await repo.update(
      { cart: { id : cartId }  },
      { deleted_at: new Date() },
    );
  }
}
