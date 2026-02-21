import {DarkModeIcon, LightModeIcon} from "@/public/icon";
import {useThemeStore} from "@/src/store/useThemeStore";

import * as S from "./ThemeToggleButton.styles";

function ThemeToggleButton() {
  const theme = useThemeStore((state) => state.theme);
  const toggleTheme = useThemeStore((state) => state.toggleTheme);

  return (
    <S.ThemeToggleButton theme={theme} onClick={toggleTheme}>
      {theme === "light" ? <DarkModeIcon /> : <LightModeIcon />}
    </S.ThemeToggleButton>
  );
}

export {ThemeToggleButton};
