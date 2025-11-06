import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Craft } from '../entities/craft.entity';
import { Product } from '../entities/product.entity';
import { Event } from '../entities/event.entity';

// Import seed data from constants.cjs
const { CRAFTS, PRODUCTS, EVENTS } = require('../../constants.cjs');

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(Craft)
    private craftRepository: Repository<Craft>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(Event)
    private eventRepository: Repository<Event>,
  ) {}

  async seedDatabase() {
    try {
      // Check if already seeded
      const count = await this.craftRepository.count();
      if (count > 0) {
        return {
          message: 'Database already has data',
          counts: {
            crafts: count,
            products: await this.productRepository.count(),
            events: await this.eventRepository.count(),
          }
        };
      }

      // Seed all data from constants.cjs
      await this.craftRepository.save(CRAFTS);
      await this.productRepository.save(PRODUCTS);
      await this.eventRepository.save(EVENTS);

      return {
        message: 'Database seeded successfully! 🌱',
        counts: {
          crafts: await this.craftRepository.count(),
          products: await this.productRepository.count(),
          events: await this.eventRepository.count(),
        }
      };
    } catch (error) {
      return {
        message: 'Error seeding database',
        error: error.message,
      };
    }
  }

  async reseedDatabase() {
    try {
      // Clear all data first
      await this.craftRepository.clear();
      await this.productRepository.clear();
      await this.eventRepository.clear();

      // Then call seedDatabase
      return this.seedDatabase();
    } catch (error) {
      return {
        message: 'Error reseeding database',
        error: error.message,
      };
    }
  }
}
