import type { LocalizedString } from './common.types';

export interface AiCreation {
  id: string;
  craftId: number;
  craftName: string;
  prompt: string;
  imageUrl: string;
}

export interface FaceProfile {
  id: string;
  label: LocalizedString;
  imageUrl: string;
  source: 'preset' | 'upload';
  createdAt: string;
}

export interface TryOnLook {
  id: string;
  craftId: number;
  craftName: string;
  imageUrl: string;
  faceId: string;
  faceLabel: string;
  prompt: string;
  mode: 'cheongsam';
  createdAt: string;
}

export type TranslationStrategy = 'phonetic' | 'meaning' | 'mixed';

export interface TranslationOption {
  id: string;
  chinese: string;
  pronunciation: string;
  explanation: string;
  strategy: TranslationStrategy;
}

