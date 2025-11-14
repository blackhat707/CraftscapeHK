// Google AI Studio Gemini Service
const GOOGLE_AI_API_KEY = import.meta.env.VITE_GOOGLE_AI_API_KEY;
const GEMINI_API_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent';

interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text?: string;
        inlineData?: {
          mimeType: string;
          data: string;
        };
      }>;
    };
  }>;
}

const imageUrlToInlineData = async (
  imageUrl: string
): Promise<{ mimeType: string; data: string } | null> => {
  try {
    if (!imageUrl) return null;

    if (imageUrl.startsWith("data:")) {
      const match = imageUrl.match(/^data:(.*?);base64,(.*)$/);
      if (!match) return null;
      return {
        mimeType: match[1] || "image/png",
        data: match[2],
      };
    }

    const response = await fetch(imageUrl);
    if (!response.ok) {
      console.error("Failed to fetch image for Gemini:", response.status);
      return null;
    }

    const blob = await response.blob();
    const mimeType = blob.type || "image/png";

    const dataUrl: string = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === "string") {
          resolve(reader.result);
        } else {
          reject(new Error("Unexpected FileReader result type"));
        }
      };
      reader.onerror = () => reject(new Error("Failed to read image blob as data URL"));
      reader.readAsDataURL(blob);
    });

    const match = dataUrl.match(/^data:(.*?);base64,(.*)$/);
    if (!match) {
      return null;
    }

    return {
      mimeType: match[1] || mimeType,
      data: match[2],
    };
  } catch (error) {
    console.error("Error preparing image for Gemini:", error);
    return null;
  }
};

/**
 * Generate an image description for craft items using Gemini
 * Since Gemini doesn't generate images directly, this would typically:
 * 1. Generate detailed descriptions
 * 2. Use those descriptions with an image generation service
 * For now, we'll return placeholder images but log the prompts
 */
export const generateCraftImage = async (
  craftName: string,
  prompt: string,
  referenceImage?: string
): Promise<string> => {
  if (!GOOGLE_AI_API_KEY) {
    console.error('Google AI API key not found in environment variables');
    return "https://placehold.co/600x400";
  }

  try {
    const enhancedPrompt = `Create a detailed visual description for generating an image of: ${craftName}

User request: ${prompt}

Please provide a comprehensive description that includes:
- Visual style and aesthetic
- Colors, textures, and materials
- Composition and lighting
- Cultural authenticity and traditional elements
- High-quality, professional photography style

${referenceImage ? 'Reference image provided for context.' : ''}`;

    const requestBody = {
      contents: [{
        parts: [{
          text: enhancedPrompt
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
    const responseParts = data.candidates[0]?.content?.parts ?? [];

    let imageBase64: string | null = null;
    let mimeType = 'image/png';
    let generatedDescription: string | undefined;

    for (const part of responseParts) {
      if (part.inlineData?.data) {
        imageBase64 = part.inlineData.data;
        if (part.inlineData.mimeType) {
          mimeType = part.inlineData.mimeType;
        }
      } else if (part.text && !generatedDescription) {
        generatedDescription = part.text;
      }
    }

    const imageUrl =
      imageBase64 ? `data:${mimeType};base64,${imageBase64}` : "https://placehold.co/600x400";

    console.log("=== Gemini Generated Description ===");
    console.log("Craft:", craftName);
    console.log("Original Prompt:", prompt);
    console.log("Generated Description:", generatedDescription);
    console.log("=====================================");

    // In a real implementation, you would pass this description to DALL-E, Midjourney, or Stable Diffusion
    // For now, return placeholder but with the enhanced description logged
    return imageUrl;

  } catch (error) {
    console.error('Error generating craft image:', error);
    return "https://placehold.co/600x400";
  }
};

/**
 * Generate a try-on image combining face and craft concept
 * This would typically use a specialized try-on model or service
 */
export const generateTryOnImage = async (
  craftName: string,
  faceImageUrl: string,
  prompt: string,
  conceptImage?: string
): Promise<string> => {
  if (!GOOGLE_AI_API_KEY) {
    console.error('Google AI API key not found in environment variables');
    return "https://placehold.co/600x400";
  }

  try {
    const tryOnPrompt = `Create a detailed description for a virtual try-on image:

Craft: ${craftName}
User styling notes: ${prompt}
Face reference: Provided
${conceptImage ? 'Concept garment: Reference provided' : ''}

Generate a description for creating a realistic try-on image that shows:
- The person wearing the ${craftName} 
- Natural lighting and realistic fit
- Cultural authenticity in styling
- Professional photography quality
- Flattering angles and composition

Please follow strightly on the given face image and concept image.
Focus on how the garment would naturally drape and fit on the person.`;

    const requestParts: Array<{
      text?: string;
      inlineData?: { mimeType: string; data: string };
    }> = [];

    const faceInline = await imageUrlToInlineData(faceImageUrl);
    if (faceInline) {
      requestParts.push({ inlineData: faceInline });
    }

    if (conceptImage) {
      const conceptInline = await imageUrlToInlineData(conceptImage);
      if (conceptInline) {
        requestParts.push({ inlineData: conceptInline });
      }
    }

    requestParts.push({ text: tryOnPrompt });

    const requestBody = {
      contents: [{
        parts: requestParts,
      }],
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
    const parts = data.candidates[0]?.content?.parts ?? [];

    let imageBase64: string | null = null;
    let mimeType = 'image/png';
    let generatedDescription: string | undefined;

    for (const part of parts) {
      if (part.inlineData?.data) {
        imageBase64 = part.inlineData.data;
        if (part.inlineData.mimeType) {
          mimeType = part.inlineData.mimeType;
        }
      } else if (part.text && !generatedDescription) {
        generatedDescription = part.text;
      }
    }

    const imageUrl =
      imageBase64 ? `data:${mimeType};base64,${imageBase64}` : "https://placehold.co/600x400";

    console.log("=== Gemini Try-On Description ===");
    console.log("Craft:", craftName);
    console.log("Face Image:", faceImageUrl);
    console.log("Styling Notes:", prompt);
    console.log("Generated Description:", generatedDescription);
    console.log("==================================");

    // In a real implementation, this would use a try-on specific service
    return imageUrl;

  } catch (error) {
    console.error('Error generating try-on image:', error);
    return "https://placehold.co/600x400";
  }
};
