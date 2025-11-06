import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Craft } from '../entities/craft.entity';
import { Product } from '../entities/product.entity';
import { Event } from '../entities/event.entity';

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
      // Sample craft data
      const crafts = [
        {
          name: { zh: '廣彩瓷器', en: 'Canton Porcelain' },
          artisan: { zh: '陳師傅', en: 'Master Chan' },
          short_description: { 
            zh: '廣東傳統瓷器工藝', 
            en: 'Traditional Guangdong ceramic craft' 
          },
          full_description: { 
            zh: '廣彩是廣東地區的傳統瓷器工藝，以其華麗的圖案和鮮豔的色彩而聞名。', 
            en: 'Canton porcelain is a traditional ceramic craft from Guangdong, known for its elaborate patterns and vibrant colors.' 
          },
          images: ['/images/crafts/canton-porcelain.jpg'],
          history: { 
            zh: '廣彩始於清代康熙年間，至今已有300多年的歷史。', 
            en: 'Canton porcelain originated during the Kangxi period of the Qing Dynasty, with over 300 years of history.' 
          },
          story: { 
            zh: '每一件廣彩作品都承載著工匠的心血和對傳統的傳承。', 
            en: 'Each piece of Canton porcelain carries the artisan\'s dedication and the inheritance of tradition.' 
          },
          category: 'ceramics',
        },
        {
          name: { zh: '中國結', en: 'Chinese Knotting' },
          artisan: { zh: '李師傅', en: 'Master Li' },
          short_description: { 
            zh: '中國傳統繩結藝術', 
            en: 'Traditional Chinese rope knotting art' 
          },
          full_description: { 
            zh: '中國結是中國特有的手工編織工藝品，具有悠久的歷史和豐富的文化內涵。', 
            en: 'Chinese knotting is a unique Chinese handicraft with a long history and rich cultural significance.' 
          },
          images: ['/images/crafts/chinese-knotting.jpg'],
          history: { 
            zh: '中國結起源於舊石器時代的結繩記事，後來演變成裝飾藝術。', 
            en: 'Chinese knots originated from the rope tying used for record-keeping in the Paleolithic era, later evolving into decorative art.' 
          },
          story: { 
            zh: '紅繩編織，寓意吉祥如意，是中國人喜愛的傳統手工藝。', 
            en: 'Woven with red cords, symbolizing good fortune and happiness, it is a beloved traditional Chinese craft.' 
          },
          category: 'textile',
        },
        {
          name: { zh: '麻將', en: 'Mahjong' },
          artisan: { zh: '王師傅', en: 'Master Wong' },
          short_description: { 
            zh: '中國傳統桌上遊戲', 
            en: 'Traditional Chinese tabletop game' 
          },
          full_description: { 
            zh: '麻將是一種中國傳統的桌上遊戲，結合了策略、計算和運氣。', 
            en: 'Mahjong is a traditional Chinese tabletop game that combines strategy, calculation, and luck.' 
          },
          images: ['/images/crafts/mahjong.jpg'],
          history: { 
            zh: '麻將起源於清代，已有百餘年歷史，是華人社會重要的娛樂活動。', 
            en: 'Mahjong originated in the Qing Dynasty with over a hundred years of history, and is an important entertainment activity in Chinese society.' 
          },
          story: { 
            zh: '一副精美的麻將牌，見證了幾代人的歡聚時光。', 
            en: 'A beautifully crafted mahjong set witnesses the joyful gatherings of generations.' 
          },
          category: 'games',
        },
      ];

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

      // Seed crafts
      await this.craftRepository.save(crafts);

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
}
