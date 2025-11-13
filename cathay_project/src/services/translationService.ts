// Translation Service using Google AI Studio Gemini
import type { TranslationOption } from '../types/types';

const GOOGLE_AI_API_KEY = import.meta.env.VITE_GOOGLE_AI_API_KEY;
const GEMINI_API_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent';

interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string;
      }>;
    };
  }>;
}

/**
 * Get Mahjong tile translation suggestions using Gemini
 * Converts English text to Chinese characters suitable for Mahjong tiles
 */
export const getMahjongTranslationSuggestions = async (
  englishText: string
): Promise<TranslationOption[]> => {
  if (!GOOGLE_AI_API_KEY) {
    console.error('Google AI API key not found in environment variables');
    return [];
  }

  try {
    const translationPrompt = `You are an expert in Chinese language and Mahjong tile design. Please provide 3 different translation options for "${englishText}" that would be suitable for engraving on Mahjong tiles.

For each translation, provide:
1. The Chinese characters (1-2 characters maximum for tile space)
2. Pinyin pronunciation 
3. A brief explanation of the meaning/strategy chosen
4. Strategy type: "phonetic" (sound-based), "meaning" (meaning-based), or "mixed"

Format your response as a JSON array with this structure:
[
  {
    "id": "1",
    "chinese": "字符",
    "pronunciation": "zì fú", 
    "explanation": "Brief explanation of this translation choice",
    "strategy": "phonetic|meaning|mixed"
  }
]

Focus on:
- Characters that work well on small tile surfaces
- Cultural appropriateness 
- Aesthetic appeal for traditional craftsmanship
- Authentic Chinese language usage

Text to translate: "${englishText}"`;

    const requestBody = {
      contents: [{
        parts: [{
          text: translationPrompt
        }]
      }]
    };

    const response = await fetch(`${GEMINI_API_BASE_URL}?key=${GOOGLE_AI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data: GeminiResponse = await response.json();
    const responseText = data.candidates[0]?.content?.parts[0]?.text;

    if (!responseText) {
      throw new Error('No response from Gemini');
    }

    console.log("=== Gemini Translation Response ===");
    console.log("Original Text:", englishText);
    console.log("Gemini Response:", responseText);
    console.log("===================================");

    // Try to extract JSON from the response
    const jsonMatch = responseText.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      console.warn('Could not extract JSON from Gemini response');
      return createFallbackTranslations(englishText);
    }

    try {
      const translations = JSON.parse(jsonMatch[0]);
      return translations.map((t: any) => ({
        id: t.id || String(Math.random()),
        chinese: t.chinese || '字',
        pronunciation: t.pronunciation || 'zì',
        explanation: t.explanation || 'Translation provided',
        strategy: t.strategy || 'mixed'
      }));
    } catch (parseError) {
      console.warn('Could not parse JSON from Gemini response:', parseError);
      return createFallbackTranslations(englishText);
    }

  } catch (error) {
    console.error('Error getting translation suggestions:', error);
    return createFallbackTranslations(englishText);
  }
};

/**
 * Create fallback translations when Gemini API fails
 */
function createFallbackTranslations(englishText: string): TranslationOption[] {
  const fallbacks: Record<string, TranslationOption[]> = {
    'dragon': [
      {
        id: '1',
        chinese: '龍',
        pronunciation: 'lóng',
        explanation: 'Traditional Chinese dragon, symbol of power and fortune',
        strategy: 'meaning'
      },
      {
        id: '2', 
        chinese: '威龍',
        pronunciation: 'wēi lóng',
        explanation: 'Mighty dragon, emphasizing strength',
        strategy: 'meaning'
      }
    ],
    'phoenix': [
      {
        id: '1',
        chinese: '鳳',
        pronunciation: 'fèng',
        explanation: 'Phoenix, symbol of renewal and grace',
        strategy: 'meaning'
      }
    ],
    'fortune': [
      {
        id: '1',
        chinese: '福',
        pronunciation: 'fú',
        explanation: 'Good fortune and blessings',
        strategy: 'meaning'
      }
    ]
  };

  const key = englishText.toLowerCase();
  if (fallbacks[key]) {
    return fallbacks[key];
  }

  // Generic fallback
  return [
    {
      id: '1',
      chinese: '字',
      pronunciation: 'zì',
      explanation: `Chinese character representation of "${englishText}"`,
      strategy: 'mixed'
    }
  ];
}
