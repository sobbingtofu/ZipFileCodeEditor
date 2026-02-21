import styled, {keyframes} from "styled-components";

import {ThemeMode} from "@/src/store/useThemeStore";

const spin = keyframes`
	from {
		transform: rotate(0deg);
	}

	to {
		transform: rotate(360deg);
	}
`;

export const LoaderBackdrop = styled.div<{$themeMode: ThemeMode}>`
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({$themeMode}) => ($themeMode === "light" ? "rgba(0, 0, 0, 0.2)" : "rgba(0, 0, 0, 0.45)")};
  z-index: 1000;
`;

export const LoaderContainer = styled.div<{$themeMode: ThemeMode}>`
  width: min(360px, calc(100vw - 32px));
  border: 1px solid ${({$themeMode}) => ($themeMode === "light" ? "#d9d9d9" : "#2f2f2f")};
  border-radius: 12px;
  background: ${({$themeMode}) => ($themeMode === "light" ? "#ffffff" : "#1b1b1b")};
  color: ${({$themeMode}) => ($themeMode === "light" ? "#232323" : "#f0f0f0")};
  padding: 24px 28px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
`;

export const Spinner = styled.div<{$themeMode: ThemeMode}>`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 3px solid ${({$themeMode}) => ($themeMode === "light" ? "#d9d9d9" : "#3b3b3b")};
  border-top-color: ${({$themeMode}) => ($themeMode === "light" ? "#666666" : "#f0f0f0")};
  animation: ${spin} 0.9s linear infinite;
`;

export const LoaderMessage = styled.p<{$themeMode: ThemeMode}>`
  margin: 0;
  font-size: 14px;
  color: ${({$themeMode}) => ($themeMode === "light" ? "#666666" : "#b7b7b7")};
  line-height: 1.45;
  text-align: center;
`;
