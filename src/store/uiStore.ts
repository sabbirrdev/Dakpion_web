import { create } from 'zustand';

export interface Toast {
  id: string;
  variant: 'success' | 'error' | 'info';
  message: string;
}

interface UiState {
  toasts: Toast[];
  pushToast: (variant: Toast['variant'], message: string) => void;
  dismissToast: (id: string) => void;
  currentlyPlayingAudioId: string | null;
  setCurrentlyPlayingAudioId: (id: string | null) => void;
}

export const useUiStore = create<UiState>((set) => ({
  toasts: [],
  pushToast: (variant, message) =>
    set((state) => ({
      toasts: [...state.toasts, { id: crypto.randomUUID(), variant, message }],
    })),
  dismissToast: (id) =>
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
  currentlyPlayingAudioId: null,
  setCurrentlyPlayingAudioId: (id) => set({ currentlyPlayingAudioId: id }),
}));
