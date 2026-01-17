import { GoogleGenerativeAI } from '@google/generative-ai';
import type { TryOnMode } from '@mirrorx/shared';

// Initialize Gemini client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// Model IDs
const IMAGE_MODEL = 'gemini-2.0-flash-exp';
const TEXT_MODEL = 'gemini-1.5-flash';

// Expert prompt for photorealistic try-on
const TRYON_PROMPT = `You are an expert virtual fashion try-on system. Generate a realistic image of the person in the first image wearing the clothing item shown in the second image.

REQUIREMENTS:
1. Keep the person's face and body exactly the same
2. Only change their clothing to match the product image
3. Make it look natural and realistic
4. Maintain proper lighting and shadows

Generate the image now.`;

interface GenerationResult {
  image: string;
  success: boolean;
  error?: string;
}

export async function generateTryOnImage(
  selfieBase64: string,
  productBase64: string,
  mode: TryOnMode = 'PART'
): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({
      model: IMAGE_MODEL,
    });

    // Clean base64 strings
    const cleanSelfie = selfieBase64.replace(/^data:image\/\w+;base64,/, '');
    const cleanProduct = productBase64.replace(/^data:image\/\w+;base64,/, '');

    const prompt = mode === 'FULL_FIT'
      ? `${TRYON_PROMPT} Create a complete outfit look.`
      : TRYON_PROMPT;

    const result = await model.generateContent([
      { text: prompt },
      {
        inlineData: {
          mimeType: 'image/jpeg',
          data: cleanSelfie,
        },
      },
      {
        inlineData: {
          mimeType: 'image/jpeg',
          data: cleanProduct,
        },
      },
    ]);

    const response = result.response;
    const candidates = response.candidates;

    if (!candidates || candidates.length === 0) {
      throw new Error('No response from AI model');
    }

    // Check for image in response
    for (const part of candidates[0].content.parts) {
      if ((part as any).inlineData?.mimeType?.startsWith('image/')) {
        const inlineData = (part as any).inlineData;
        return `data:${inlineData.mimeType};base64,${inlineData.data}`;
      }
    }

    // If no image, the model might have returned text instead
    // For now, return an error - we need image output
    const text = response.text();
    console.log('Model returned text instead of image:', text.substring(0, 200));

    throw new Error('Model did not generate an image. Virtual try-on requires image generation capability.');

  } catch (error) {
    console.error('Gemini generation error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Image generation failed: ${message}`);
  }
}

// Style recommendations using text model
export async function getStyleRecommendations(productBase64: string): Promise<{
  analysis: string;
  suggestions: string[];
  complementaryItems: Array<{ type: string; description: string; priceRange: string }>;
}> {
  try {
    const model = genAI.getGenerativeModel({ model: TEXT_MODEL });

    const cleanProduct = productBase64.replace(/^data:image\/\w+;base64,/, '');

    const prompt = `Analyze this fashion item and provide styling recommendations for Indian consumers.

Return a JSON object with:
- "analysis": Brief description of the item (type, style, color, material)
- "suggestions": Array of 3-5 styling tips
- "complementaryItems": Array of 3-4 complementary items, each with:
  - "type": Category (e.g., "Footwear", "Accessories", "Bottom wear")
  - "description": Specific recommendation
  - "priceRange": Estimated price in INR (e.g., "₹1,500 - ₹3,000")

Focus on Indian fashion sensibilities and practical styling advice. Return ONLY the JSON object, no other text.`;

    const result = await model.generateContent([
      { text: prompt },
      {
        inlineData: {
          mimeType: 'image/jpeg',
          data: cleanProduct,
        },
      },
    ]);

    const text = result.response.text();
    const jsonMatch = text.match(/\{[\s\S]*\}/);

    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }

    return {
      analysis: 'Unable to analyze the item',
      suggestions: [],
      complementaryItems: [],
    };
  } catch (error) {
    console.error('Style recommendations error:', error);
    return {
      analysis: 'Unable to analyze the item',
      suggestions: [],
      complementaryItems: [],
    };
  }
}

export default {
  generateTryOnImage,
  getStyleRecommendations,
};
