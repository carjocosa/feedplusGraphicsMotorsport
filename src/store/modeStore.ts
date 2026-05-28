import { create } from 'zustand';
import type { DiscipMode } from '@/types/circuit';

interface ModeStore {
  mode: DiscipMode;
  setMode: (m: DiscipMode) => void;
}

const KEY = 'rallystream-mode';

export const useModeStore = create<ModeStore>((set) => ({
  mode: ((typeof localStorage !== 'undefined' && localStorage.getItem(KEY)) as DiscipMode) || 'rally',
  setMode: (m) => {
    if (typeof localStorage !== 'undefined') localStorage.setItem(KEY, m);
    set({ mode: m });
  },
}));
