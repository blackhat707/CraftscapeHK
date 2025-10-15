import { Injectable } from '@nestjs/common';
import { GoogleGenAI } from '@google/genai';
import { getGeminiApiKey } from '../config/gemini.config';

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

  async generateCraftImage(craftName: string, userPrompt: string): Promise<{ imageUrl: string }> {
    const aiClient = this.ai;
    if (!aiClient) {
      throw new Error("The AI service is not configured on the server.");
    }

    try {
      const fullPrompt = `A high-quality, artistic image of a modern interpretation of a traditional Hong Kong craft: ${craftName}. The design is inspired by: "${userPrompt}". Focus on intricate details and beautiful lighting.`;

      const response = await aiClient.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: fullPrompt,
        config: {
          numberOfImages: 1,
          outputMimeType: 'image/jpeg',
          aspectRatio: '3:4',
        },
      });

      if (response.generatedImages && response.generatedImages.length > 0) {
        const base64ImageBytes = response.generatedImages[0].image.imageBytes;
        return { imageUrl: `data:image/jpeg;base64,${base64ImageBytes}` };
      } else {
        throw new Error('AI failed to generate an image. Please try again later.');
      }
    } catch (error) {
      console.error("Error generating image with Gemini:", error);
      if (error instanceof Error) {
        throw new Error(`Gemini API Error: ${error.message}`);
      }
      throw new Error('An unknown error occurred during image generation.');
    }
  }
}