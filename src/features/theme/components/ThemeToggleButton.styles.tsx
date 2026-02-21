import styled from "styled-components";

import {ThemeMode} from "@/src/store/useThemeStore";

export const ThemeToggleButton = styled.button<{$themeMode: ThemeMode}>`
  width: 64px;
  height: 32px;
  background-color: ${({$themeMode}) => ($themeMode === "light" ? "#f2f2f2" : "#252525")};
  border: 1px solid ${({$themeMode}) => ($themeMode === "light" ? "#d2d2d2" : "#3b3b3b")};
  color: ${({$themeMode}) => ($themeMode === "light" ? "#2b2b2b" : "#f0f0f0")};
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  cursor: pointer;
  box-shadow: 0px 1px 3px rgba(0, 0, 0, 0.2);

  &:hover {
    background-color: ${({$themeMode}) => ($themeMode === "light" ? "#e9e9e9" : "#2f2f2f")};
  }
`;
