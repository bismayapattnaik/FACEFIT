import { create } from 'zustand';
import type { WardrobeItem, TryOnResponse, TryOnMode } from '@mrrx/shared';

type Gender = 'male' | 'female';

interface TryOnState {
  selfieImage: string | null;
  productImage: string | null;
  productUrl: string | null;
  mode: TryOnMode;
  gender: Gender;
  currentJob: TryOnResponse | null;
  resultImage: string | null;
  feedbackSubmitted: boolean;
}

interface AppState {
  // Try-on state
  tryOn: TryOnState;
  setTryOnSelfie: (image: string | null) => void;
  setTryOnProduct: (image: string | null) => void;
  setTryOnProductUrl: (url: string | null) => void;
  setTryOnMode: (mode: TryOnMode) => void;
  setTryOnGender: (gender: Gender) => void;
  setTryOnJob: (job: TryOnResponse | null) => void;
  setTryOnResult: (image: string | null) => void;
  setFeedbackSubmitted: (submitted: boolean) => void;
  resetTryOn: () => void;

  // Wardrobe state
  wardrobeItems: WardrobeItem[];
  setWardrobeItems: (items: WardrobeItem[]) => void;
  addWardrobeItem: (item: WardrobeItem) => void;
  removeWardrobeItem: (id: string) => void;

  // UI state
  isSidebarOpen: boolean;
  toggleSidebar: () => void;

  // Credits info
  dailyFreeRemaining: number;
  setDailyFreeRemaining: (count: number) => void;
}

const initialTryOnState: TryOnState = {
  selfieImage: null,
  productImage: null,
  productUrl: null,
  mode: 'PART',
  gender: 'female',
  currentJob: null,
  resultImage: null,
  feedbackSubmitted: false,
};

export const useAppStore = create<AppState>((set) => ({
  // Try-on state
  tryOn: initialTryOnState,

  setTryOnSelfie: (image) =>
    set((state) => ({
      tryOn: { ...state.tryOn, selfieImage: image },
    })),

  setTryOnProduct: (image) =>
    set((state) => ({
      tryOn: { ...state.tryOn, productImage: image },
    })),

  setTryOnProductUrl: (url) =>
    set((state) => ({
      tryOn: { ...state.tryOn, productUrl: url },
    })),

  setTryOnMode: (mode) =>
    set((state) => ({
      tryOn: { ...state.tryOn, mode },
    })),

  setTryOnGender: (gender) =>
    set((state) => ({
      tryOn: { ...state.tryOn, gender },
    })),

  setTryOnJob: (job) =>
    set((state) => ({
      tryOn: { ...state.tryOn, currentJob: job },
    })),

  setTryOnResult: (image) =>
    set((state) => ({
      tryOn: { ...state.tryOn, resultImage: image },
    })),

  setFeedbackSubmitted: (submitted) =>
    set((state) => ({
      tryOn: { ...state.tryOn, feedbackSubmitted: submitted },
    })),

  resetTryOn: () => set({ tryOn: initialTryOnState }),

  // Wardrobe state
  wardrobeItems: [],

  setWardrobeItems: (items) => set({ wardrobeItems: items }),

  addWardrobeItem: (item) =>
    set((state) => ({
      wardrobeItems: [item, ...state.wardrobeItems],
    })),

  removeWardrobeItem: (id) =>
    set((state) => ({
      wardrobeItems: state.wardrobeItems.filter((item) => item.id !== id),
    })),

  // UI state
  isSidebarOpen: false,
  toggleSidebar: () =>
    set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),

  // Credits
  dailyFreeRemaining: 5,
  setDailyFreeRemaining: (count) => set({ dailyFreeRemaining: count }),
}));
