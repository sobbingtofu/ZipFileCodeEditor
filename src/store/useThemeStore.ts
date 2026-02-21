import {create} from "zustand";

export type ThemeMode = "light" | "dark";

interface ThemeStoreState {
  theme: ThemeMode;
  toggleTheme: () => void;
}

export const useThemeStore = create<ThemeStoreState>((set) => ({
  theme: "dark",
  toggleTheme: () => set((state) => ({theme: state.theme === "light" ? "dark" : "light"})),
}));
