export type GlyphName = 
  | 'shou' | 'tian' | 'shui' | 'kou' | 'nian' | 'bu' | 'shan' | 'ge' | 'ren' | 'xin'
  | 'ri' | 'shi' | 'mu' | 'huo' | 'tu' | 'zhu' | 'da' | 'zhong' | 'jin' | 'nu'
  | 'yue' | 'gong' | 'heng' | 'shu' | 'pie' | 'na' | 'dian' | 'ti';

export interface CanvasElement {
  id: string;
  glyph: GlyphName;
  char: string;
  x: number;
  y: number;
  scale: number;
  rotation: number;
  zIndex: number;
  fontWeight: number;
  isMirror: boolean;
  isOutline: boolean;
}

export interface AiLayoutElement {
  glyph: GlyphName;
  x: number;
  y: number;
  scale: number;
  rotation: number;
  fontWeight: number;
  isMirror?: boolean;
  isOutline?: boolean;
}

export interface AiLayout {
  description: string;
  elements: AiLayoutElement[];
}

