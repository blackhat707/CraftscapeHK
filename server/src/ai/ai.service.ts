import { Injectable } from '@nestjs/common';
import { GoogleGenAI } from '@google/genai';
import { getGeminiApiKey } from '../config/gemini.config';
import { getDoubaoConfig, isDoubaoConfigured } from '../config/doubao.config';
import { generateDoubaoImage } from './doubao.client';
import { generateMahjongTileReference } from '../utils/text-to-image.util';

@Injectable()
export class AiService {
  private ai?: GoogleGenAI;

  constructor() {
    const apiKey = getGeminiApiKey();
    if (!apiKey) {
      return;
    }
    this.ai = new GoogleGenAI({ apiKey });
  }

  private containsChineseCharacters(value: string): boolean {
    return /[\u3400-\u9FFF]/.test(value);
  }

  private isMahjongCraft(craftName: string): boolean {
    const lowerName = craftName.toLowerCase();
    return lowerName.includes('mahjong') || lowerName.includes('麻雀') || lowerName.includes('麻將');
  }

  async generateCraftImage(craftName: string, userPrompt: string): Promise<{ imageUrl: string }> {
    const aiClient = this.ai;
    try {
      // Check if this is a mahjong craft and if the prompt contains Chinese characters
      const isMahjong = this.isMahjongCraft(craftName);
      const hasChinesePrompt = this.containsChineseCharacters(userPrompt);
      
      let referenceImage: string | null = null;
      let enhancedPrompt = userPrompt;

      // Generate reference image for mahjong with Chinese characters
      if (isMahjong && hasChinesePrompt) {
        // Extract only Chinese characters from the prompt (in case it includes pronunciation/explanation)
        const chineseOnly = userPrompt.match(/[\u3400-\u9FFF]+/g)?.[0] || userPrompt;
        console.log('Generating mahjong tile reference image with Chinese text:', chineseOnly);
        referenceImage = generateMahjongTileReference(chineseOnly);
        
        // DEBUG: Log reference image details
        console.log('Reference image generated:');
        console.log('- Format: PNG (base64 encoded)');
        console.log('- Size:', Math.round(referenceImage.length / 1024), 'KB');
        console.log('- Data URL length:', referenceImage.length, 'characters');
        
        // Enhance the prompt to use the reference image
        enhancedPrompt = `A hand-carved traditional Hong Kong mahjong tile with Chinese character(s) "${userPrompt}" engraved vertically on it. The tile should be made of ivory-colored material (bone or bamboo), with deep, precise carving showing traditional craftsmanship. Follow the exact text shape and character layout shown in the reference image. The character should be centered and prominent, carved in a traditional style. Focus on intricate carving details, elegant typography, and beautiful lighting that highlights the depth of the engraving.`;
        console.log('Enhanced mahjong prompt:', enhancedPrompt);
      }

      const fullPrompt = isMahjong && hasChinesePrompt 
        ? enhancedPrompt
        : `A high-quality, artistic image of a modern interpretation of a traditional Hong Kong craft: ${craftName}. The design is inspired by: "${userPrompt}". Focus on intricate details and beautiful lighting.`;

      console.log('=== Backend AI Service - Full Prompt ===');
      console.log('Craft Name:', craftName);
      console.log('User Prompt:', userPrompt);
      console.log('Is Mahjong:', isMahjong);
      console.log('Has Chinese:', hasChinesePrompt);
      console.log('Has Reference Image:', !!referenceImage);
      console.log('Full Prompt Sent to AI:');
      console.log(fullPrompt);
      console.log('========================================');

      const hasChineseInput =
        this.containsChineseCharacters(userPrompt) || this.containsChineseCharacters(craftName);
      const doubaoConfig = hasChineseInput ? getDoubaoConfig() : null;

      if (hasChineseInput && doubaoConfig && isDoubaoConfigured(doubaoConfig)) {
        try {
          const imageUrl = await generateDoubaoImage(fullPrompt, doubaoConfig);
          return { imageUrl };
        } catch (doubaoError) {
          console.error('Error generating image with Doubao:', doubaoError);
          if (!aiClient) {
            throw doubaoError;
          }
        }
      }

      if (!aiClient) {
        throw new Error('The AI service is not configured on the server.');
      }

      // Build the prompt array for generateContent API
      const promptParts: any[] = [{ text: fullPrompt }];
      
      // Add reference image if available (for mahjong)
      if (isMahjong && referenceImage) {
        const base64Data = referenceImage.split(',')[1]; // Extract base64 data
        promptParts.push({
          inlineData: {
            mimeType: 'image/png',
            data: base64Data,
          },
        });
      }

      const response = await aiClient.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: promptParts,
      });

      // Extract the generated image from the response
      if (response.candidates && response.candidates.length > 0) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData) {
            const base64ImageBytes = part.inlineData.data;
            return { imageUrl: `data:image/jpeg;base64,${base64ImageBytes}` };
          }
        }
      }
      
      throw new Error('AI failed to generate an image. Please try again later.');
    } catch (error) {
      console.error('Error generating image with AI provider:', error);
      if (error instanceof Error) {
        throw new Error(error.message.includes('Doubao') ? error.message : `Gemini API Error: ${error.message}`);
      }
      throw new Error('An unknown error occurred during image generation.');
    }
  }
}
