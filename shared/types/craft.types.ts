import type { LocalizedString } from './common.types';

export interface Craft {
  id: number;
  name: LocalizedString;
  artisan: LocalizedString;
  short_description: LocalizedString;
  full_description: LocalizedString;
  images: string[];
  history: LocalizedString;
  story: LocalizedString;
  category?: string;
}

