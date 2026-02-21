import {DarkModeIcon, LightModeIcon} from "@/public/icon";
import {useThemeStore} from "@/src/store/useThemeStore";

import * as S from "./ThemeToggleButton.styles";

function ThemeToggleButton() {
  const theme = useThemeStore((state) => state.theme);
  const toggleTheme = useThemeStore((state) => state.toggleTheme);

  return (
    <S.ThemeToggleButton
      type="button"
      $themeMode={theme}
      onClick={toggleTheme}
      aria-label="Toggle Theme"
      title={theme === "light" ? "다크모드로 전환" : "라이트모드로 전환"}
    >
      {theme === "light" ? <DarkModeIcon /> : <LightModeIcon />}
    </S.ThemeToggleButton>
  );
}

export {ThemeToggleButton};
