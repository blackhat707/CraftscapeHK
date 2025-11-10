import type { LocalizedString } from './common.types';

export interface Product {
  id: number;
  name: LocalizedString;
  price: number;
  priceDisplay: LocalizedString;
  priceSubDisplay?: LocalizedString;
  image: string;
  artisan: LocalizedString;
  full_description: LocalizedString;
  category?: string;
}

