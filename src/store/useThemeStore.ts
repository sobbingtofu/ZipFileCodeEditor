import {create} from "zustand";

interface ThemeStoreState {
  theme: "light" | "dark";
  toggleTheme: () => void;
}

export const useThemeStore = create<ThemeStoreState>((set) => ({
  theme: "dark",
  toggleTheme: () => set((state) => ({theme: state.theme === "light" ? "dark" : "light"})),
}));
