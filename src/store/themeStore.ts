import { create } from 'zustand';

type Theme = 'dark' | 'light';

interface ThemeStore {
  theme: Theme;
  setTheme: (t: Theme) => void;
  toggleTheme: () => void;
}

const KEY = 'feedplus-theme';

export const useThemeStore = create<ThemeStore>((set) => ({
  theme: ((typeof localStorage !== 'undefined' && localStorage.getItem(KEY)) as Theme) || 'dark',
  setTheme: (t) => {
    if (typeof localStorage !== 'undefined') localStorage.setItem(KEY, t);
    set({ theme: t });
  },
  toggleTheme: () => {
    set((s) => {
      const next = s.theme === 'dark' ? 'light' : 'dark';
      if (typeof localStorage !== 'undefined') localStorage.setItem(KEY, next);
      return { theme: next };
    });
  },
}));
