import type { TranslationOption, TranslationStrategy } from '../types';
import { GoogleGenAI, Type } from '@google/genai';

const MAX_CHARACTER_LENGTH = 4;
const MAX_OPTIONS = 3;

const generateOptionId = (): string =>
  typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : `ai-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;

const applySpecialCaseSuggestions = (
  input: string,
  options: TranslationOption[],
): TranslationOption[] => {
  const result = [...options];
  const lowerInput = input.toLowerCase();
  const lettersOnly = lowerInput.replace(/[^a-z]/g, '');

  const ensureOption = (option: Omit<TranslationOption, 'id'>) => {
    if (!result.some((existing) => existing.chinese === option.chinese)) {
      result.unshift({
        id: generateOptionId(),
        ...option,
      });
    }
  };

  if (/\bhailey\b/.test(lowerInput)) {
    ensureOption({
      chinese: '海莉',
      pronunciation: 'hoi2 lei6',
      explanation: '海 means sea, 莉 means jasmine; together they echo the sound of "Hailey" in Cantonese phonetics.',
      strategy: 'phonetic',
    });
  }

  const mentionsHKU =
    lowerInput.includes('hong kong university') || lettersOnly.includes('hku');
  if (mentionsHKU) {
    ensureOption({
      chinese: '港大',
      pronunciation: 'gong2 daai6',
      explanation:
        '港 means harbour and stands for Hong Kong, 大 means great or university; together this established abbreviation refers to The University of Hong Kong.',
      strategy: 'meaning',
    });
  }

  const unique: TranslationOption[] = [];
  for (const option of result) {
    if (!unique.some((existing) => existing.chinese === option.chinese)) {
      unique.push(option);
    }
  }

  return unique.slice(0, MAX_OPTIONS);
};

const GEMINI_API_KEY =
  (typeof process !== 'undefined' && process.env?.GEMINI_API_KEY) ||
  (typeof import.meta !== 'undefined' && (import.meta as any)?.env?.GEMINI_API_KEY) ||
  null;

let ai: GoogleGenAI | null = null;

try {
  if (GEMINI_API_KEY) {
    ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
  } else {
    console.warn('GEMINI_API_KEY environment variable not set. Translation suggestions will be unavailable.');
  }
} catch (error) {
  console.warn('Failed to initialise Google GenAI client:', error);
  ai = null;
}

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    options: {
      type: Type.ARRAY,
      description: 'Up to 3 translation suggestions.',
      items: {
        type: Type.OBJECT,
        properties: {
          chinese: {
            type: Type.STRING,
            description: `Traditional Chinese characters (max ${MAX_CHARACTER_LENGTH}).`,
          },
          pronunciation: {
            type: Type.STRING,
            description: 'Cantonese Jyutping pronunciation for the whole phrase.',
          },
          explanation: {
            type: Type.STRING,
            description: 'Short English explanation (meaning or pronunciation choice).',
          },
          strategy: {
            type: Type.STRING,
            enum: ['phonetic', 'meaning', 'mixed'],
            description: 'How the translation was derived.',
          },
        },
        required: ['chinese', 'pronunciation', 'explanation', 'strategy'],
      },
    },
  },
  required: ['options'],
};

export const getMahjongTranslationSuggestions = async (input: string): Promise<TranslationOption[]> => {
  const trimmed = input.trim();
  if (!trimmed) return [];
  if (!ai) {
    throw new Error('Gemini client not initialised. Please configure GEMINI_API_KEY in the environment.');
  }

  const prompt = `User request: "${trimmed}"

Return between 1 and ${MAX_OPTIONS} Traditional Chinese suggestions tailored for engraving on mahjong tiles. 
Each suggestion must:
- Use at most ${MAX_CHARACTER_LENGTH} characters.
- Include Cantonese Jyutping with tone numbers.
- Provide an English explanation that explicitly states the meaning of EACH character (e.g. '海 means sea, 莉 means jasmine') and, when relevant, how the overall phrase connects to the user's prompt or pronunciation.
- Indicate strategy as "phonetic", "meaning", or "mixed".

Respond strictly as JSON matching the provided schema.`;

  const result = await ai.models.generateContent({
    model: 'gemini-2.0-flash-exp',
    contents: prompt,
    config: {
    systemInstruction: `You are a Cantonese language expert assisting with mahjong tile engravings. For every option you propose, the explanation must mention the literal meaning of EACH character (e.g. 「海 means sea」) and optionally note pronunciation rationale. Respond ONLY with JSON conforming to the schema. Never return an empty array—offer your best options.`,
      responseMimeType: 'application/json',
      responseSchema,
    },
  });

  const rawText =
    (result as any)?.response?.candidates?.[0]?.content?.parts?.map((p: any) => p.text || '').join('') ??
    (typeof result.text === 'function' ? result.text() : result.text) ??
    '';

  const jsonText = (rawText || '').trim();
  if (!jsonText) {
    throw new Error('Gemini returned an empty response.');
  }

  const parsed = JSON.parse(jsonText) as { options?: Array<{ chinese: string; pronunciation: string; explanation: string; strategy: TranslationStrategy }> };
  if (!parsed?.options || !Array.isArray(parsed.options) || !parsed.options.length) {
    throw new Error('Gemini did not return any translation options.');
  }

  const baseOptions = parsed.options
    .filter((option) => option?.chinese && Array.from(option.chinese).length <= MAX_CHARACTER_LENGTH)
    .slice(0, MAX_OPTIONS)
    .map((option) => ({
      id: generateOptionId(),
      chinese: option.chinese,
      pronunciation: option.pronunciation,
      explanation: option.explanation,
      strategy: option.strategy === 'phonetic' || option.strategy === 'meaning' || option.strategy === 'mixed'
        ? option.strategy
        : 'mixed',
    } satisfies TranslationOption));

  if (!baseOptions.length) {
    throw new Error('No valid translation options within character limit.');
  }

  return applySpecialCaseSuggestions(trimmed, baseOptions);
};
