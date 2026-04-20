import { create } from "zustand";

interface LoadingStore {
  isLoading: boolean;
  activeRequests: number;
  startLoading: () => void;
  stopLoading: () => void;
}

export const useLoadingStore = create<LoadingStore>((set) => ({
  isLoading: false,
  activeRequests: 0,
  startLoading: () => set((state) => ({ 
    activeRequests: state.activeRequests + 1,
    isLoading: true 
  })),
  stopLoading: () => set((state) => {
    const nextRequests = Math.max(0, state.activeRequests - 1);
    return { 
      activeRequests: nextRequests,
      isLoading: nextRequests > 0 
    };
  }),
}));
