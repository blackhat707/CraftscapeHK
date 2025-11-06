import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { Craft } from '../entities/craft.entity';
import { Product } from '../entities/product.entity';
import { Event } from '../entities/event.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Craft, Product, Event])],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
