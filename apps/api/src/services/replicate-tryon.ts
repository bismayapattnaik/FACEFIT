import Replicate from 'replicate';

// Initialize Replicate client
const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN || '',
});

// Using fashn-ai tryon model - actively maintained and reliable
const FASHN_TRYON_MODEL = 'fashn-ai/tryon:9725fffb6fc8dfd9f0c58a37fee85c3b0e3f5eeefbdbcb9a450b6db4a22aa32d';

// IDM-VTON model as backup
const IDM_VTON_MODEL = 'cuuupid/idm-vton:c871bb9b046c1c045725e293bfe1e5847ae29f8d0bfc76b6bd32ed0dd89bf5eb';

type Category = 'tops' | 'bottoms' | 'one-pieces';

/**
 * Convert base64 to data URI
 */
function toDataUri(base64: string): string {
  // If already a URL or data URI, return as-is
  if (base64.startsWith('http://') || base64.startsWith('https://') || base64.startsWith('data:')) {
    return base64;
  }
  // Convert raw base64 to data URI
  return `data:image/jpeg;base64,${base64}`;
}

/**
 * Generate virtual try-on using fashn-ai model
 * This model preserves the exact face from the input image
 */
export async function generateTryOnWithFashn(
  personImage: string,
  garmentImage: string,
  category: Category = 'tops'
): Promise<string> {
  console.log('Starting fashn-ai tryon generation...');
  console.log('Category:', category);

  const output = await replicate.run(FASHN_TRYON_MODEL, {
    input: {
      model_image: toDataUri(personImage),
      garment_image: toDataUri(garmentImage),
      category: category,
      // Higher quality settings
      guidance_scale: 2.5,
      num_inference_steps: 50,
      garment_photo_type: 'auto',
      cover_feet: false,
      adjust_hands: true,
      restore_background: true,
      restore_clothes: true,
    },
  });

  console.log('fashn-ai output:', typeof output);

  // Handle output - could be string URL or array
  if (typeof output === 'string') {
    return output;
  } else if (Array.isArray(output) && output.length > 0) {
    return output[0] as string;
  } else if (output && typeof output === 'object' && 'image' in output) {
    return (output as { image: string }).image;
  }

  throw new Error('Unexpected output format from fashn-ai');
}

/**
 * Generate virtual try-on using IDM-VTON model (backup)
 */
export async function generateTryOnWithIDMVTON(
  personImage: string,
  garmentImage: string,
  category: 'upper_body' | 'lower_body' | 'dresses' = 'upper_body'
): Promise<string> {
  console.log('Starting IDM-VTON generation...');

  const output = await replicate.run(IDM_VTON_MODEL, {
    input: {
      human_img: toDataUri(personImage),
      garm_img: toDataUri(garmentImage),
      garment_des: category === 'upper_body' ? 'A stylish top' : category === 'dresses' ? 'A beautiful dress' : 'Stylish pants',
      category: category,
      denoise_steps: 30,
      seed: Math.floor(Math.random() * 1000000),
    },
  });

  if (typeof output === 'string') {
    return output;
  } else if (Array.isArray(output) && output.length > 0) {
    return output[0] as string;
  }

  throw new Error('Unexpected output format from IDM-VTON');
}

/**
 * Map our category to fashn-ai category
 */
function mapToFashnCategory(category: 'upper_body' | 'lower_body' | 'dresses'): Category {
  switch (category) {
    case 'upper_body':
      return 'tops';
    case 'lower_body':
      return 'bottoms';
    case 'dresses':
      return 'one-pieces';
    default:
      return 'tops';
  }
}

/**
 * Main function to run virtual try-on
 */
export async function runVirtualTryOn(
  personBase64: string,
  garmentBase64: string,
  category: 'upper_body' | 'lower_body' | 'dresses' = 'upper_body'
): Promise<string> {
  const fashnCategory = mapToFashnCategory(category);

  try {
    // Try fashn-ai first (more reliable)
    return await generateTryOnWithFashn(personBase64, garmentBase64, fashnCategory);
  } catch (error) {
    console.error('fashn-ai error:', error);

    // Try IDM-VTON as backup
    console.log('Trying IDM-VTON as backup...');
    try {
      return await generateTryOnWithIDMVTON(personBase64, garmentBase64, category);
    } catch (backupError) {
      console.error('IDM-VTON backup also failed:', backupError);
      throw new Error('Virtual try-on generation failed. Please try again.');
    }
  }
}

export default {
  runVirtualTryOn,
  generateTryOnWithFashn,
  generateTryOnWithIDMVTON,
};
