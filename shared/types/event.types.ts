import type { LocalizedString } from './common.types';

export interface Event {
  id: number;
  title: LocalizedString;
  date: string;
  time: LocalizedString;
  location: LocalizedString;
  description: LocalizedString;
  organizer: string;
  organizer_icon: string;
  image: string;
  region: '港島' | '九龍' | '新界' | '線上';
  type: '工作坊' | '展覽' | '講座';
  isFeatured?: boolean;
  url: string;
}

