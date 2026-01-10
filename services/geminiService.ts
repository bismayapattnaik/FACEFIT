import { GoogleGenAI, Type } from "@google/genai";

// Helper to check and prompt for API Key selection
export const checkAndEnsureApiKey = async (): Promise<boolean> => {
  const win = window as any;
  if (win.aistudio && win.aistudio.hasSelectedApiKey) {
    const hasKey = await win.aistudio.hasSelectedApiKey();
    if (!hasKey) {
      if (win.aistudio.openSelectKey) {
        await win.aistudio.openSelectKey();
        return true; // Assume success after modal interaction due to race condition guidance
      }
      return false;
    }
    return true;
  }
  // Fallback for dev environments without the special window object
  return true;
};

export const generateTryOnImage = async (
  faceImageBase64: string,
  clothImageBase64: string
): Promise<string> => {
  await checkAndEnsureApiKey();
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const cleanFace = faceImageBase64.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, "");
  const cleanCloth = clothImageBase64.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, "");

  // Priority list: Try high-quality model first, then fast model
  const modelsToTry = [
    'gemini-3-pro-image-preview', // Essential for complex body generation
    'gemini-2.5-flash-image'      // Fallback
  ];

  let lastError: any = null;

  for (const modelName of modelsToTry) {
    try {
      console.log(`Attempting generation with model: ${modelName}`);
      
      const promptText = `
      ACT AS A WORLD-CLASS FASHION PHOTOGRAPHER AND VFX COMPOSITOR.

      TASK: Create a hyper-realistic full-body fashion editorial image.

      INPUTS:
      1. FACE: The user's exact facial features, skin texture, and hair (from Input 1).
      2. CLOTH: The garment to be worn (from Input 2).

      STRICT REALISM & GENERATION RULES:
      1. **IDENTITY PRESERVATION (PRIORITY #1)**: 
         - The face MUST be an exact match to Input 1. Preserve identity, age, and ethnicity 100%. 
         - Skin texture must show natural pores and subsurface scattering. No plastic/waxy skin.

      2. **BODY & POSE**: 
         - Generate a completely NEW, anatomically perfect fashion model body that fits the head naturally.
         - Pose: Relaxed, natural, high-fashion stance (e.g., casual walk, hand in pocket, slight lean). Avoid stiffness.
         - Proportions: realistic human proportions, not stylized or cartoonish.

      3. **CLOTHING & TEXTURE PHYSICS**:
         - The model MUST wear the exact cloth from Input 2.
         - **Fabric Simulation**: The fabric must drape realistically over the body, showing weight, tension folds, and wrinkles appropriate for the material (e.g., stiff denim vs. soft cotton).
         - **Texture**: Retain all fine details (stitching, logos, weave).
         - **Outfit Completion**: If Input 2 is a top, generating matching bottoms (Jeans, Chinos, Trousers) that complement the style. If it's a dress, add appropriate footwear.

      4. **LIGHTING & SHADOWS**:
         - Use cinematic, soft-box studio lighting or natural golden hour light.
         - **Shadow Integration**: Ensure complex self-shadowing (cloth casting shadows on skin, arm casting shadow on body). 
         - Global illumination: Light must bounce naturally off the fabric onto the skin.

      5. **ENVIRONMENT**: 
         - Background: Soft-focus (bokeh) modern urban street, luxury boutique interior, or minimal architectural studio.
      
      OUTPUT: A raw, 8k resolution, photorealistic photograph.
      `;

      const response = await ai.models.generateContent({
        model: modelName,
        contents: {
          parts: [
            { text: promptText },
            { inlineData: { mimeType: 'image/png', data: cleanFace } },
            { inlineData: { mimeType: 'image/png', data: cleanCloth } }
          ]
        },
        config: {
          imageConfig: {
            aspectRatio: "3:4",
             ...(modelName.includes('pro') ? { imageSize: "2K" } : {})
          }
        }
      });

      if (response.candidates && response.candidates.length > 0) {
        const parts = response.candidates[0].content.parts;
        for (const part of parts) {
          if (part.inlineData && part.inlineData.data) {
            return `data:image/png;base64,${part.inlineData.data}`;
          }
        }
      }
      throw new Error(`Model ${modelName} returned no image data.`);

    } catch (error: any) {
      console.warn(`Model ${modelName} failed:`, error.message);
      lastError = error;
      
      const isPermissionError = error.message?.includes("PERMISSION_DENIED") || 
                                error.status === 403 || 
                                error.message?.includes("Requested entity was not found");
      
      if (!isPermissionError && modelName === modelsToTry[0]) {
         // Continue loop
      }
      if (modelName === modelsToTry[modelsToTry.length - 1]) {
         break;
      }
    }
  }

  const win = window as any;
  if (
    (lastError?.message?.includes("Requested entity was not found") || 
     lastError?.status === 403 || 
     lastError?.message?.includes("PERMISSION_DENIED")) && 
    win.aistudio?.openSelectKey
  ) {
     await win.aistudio.openSelectKey();
     throw new Error("Access Denied. Please select a valid API Key.");
  }

  throw new Error(lastError?.message || "Failed to generate realistic image. Please try again.");
};

export const getStyleRecommendations = async (
  faceImageBase64: string,
  clothImageBase64: string
): Promise<any> => {
  await checkAndEnsureApiKey();
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const cleanCloth = clothImageBase64.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, "");

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          { 
            text: `You are a fashion stylist. 
            1. Analyze this clothing item.
            2. Suggest a specific pair of PANTS/BOTTOMS that would match this item perfectly for a modern look.
            3. Provide a search query I can use on Google Shopping to find these specific pants.
            
            Return JSON.`
          },
          { inlineData: { mimeType: 'image/png', data: cleanCloth } }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            analysis: { type: Type.STRING, description: "Brief thought on the vibe of the cloth" },
            complementaryItem: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING, description: "Name of the suggested pants (e.g. Beige Cargo Pants)" },
                searchQuery: { type: Type.STRING, description: "Search query for shopping (e.g. men beige cargo pants slim fit)" },
                priceRange: { type: Type.STRING, description: "Estimated price range in INR" }
              }
            },
            suggestions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  item: { type: Type.STRING },
                  reason: { type: Type.STRING },
                  color: { type: Type.STRING },
                }
              }
            }
          }
        }
      }
    });

    return JSON.parse(response.text || "{}");
  } catch (error: any) {
    console.error("Style Recommendation Error:", error);
    return null;
  }
};