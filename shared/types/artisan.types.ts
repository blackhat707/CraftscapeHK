import type { LocalizedString } from './common.types';

export interface Artisan {
  id: number;
  name: LocalizedString;
  bio: string;
  image: string;
  craftIds: number[];
}

