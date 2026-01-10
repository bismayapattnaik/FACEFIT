export interface PricingPlan {
  id: string;
  name: string;
  price: string;
  period?: string;
  features: string[];
  recommended?: boolean;
  type: 'B2C' | 'B2B';
}

export interface GeneratedImage {
  url: string;
  timestamp: number;
}

export interface TryOnState {
  faceImage: string | null; // Base64
  clothImage: string | null; // Base64
  generatedImage: string | null; // Base64 or URL
  isGenerating: boolean;
  error: string | null;
}

export interface WardrobeItem {
  id: string;
  image: string;
  timestamp: number;
}

export interface StyleRecommendation {
  analysis: string;
  suggestions: {
    item: string;
    reason: string;
    color: string;
  }[];
  complementaryItem?: {
    name: string;
    searchQuery: string;
    priceRange: string;
  };
}