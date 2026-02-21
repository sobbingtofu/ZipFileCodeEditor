import {ThemeMode} from "@/src/store/useThemeStore";
import styled from "styled-components";

export const ModalBackdrop = styled.div<{$themeMode: ThemeMode}>`
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({$themeMode}) => ($themeMode === "light" ? "rgba(0, 0, 0, 0.2)" : "rgba(0, 0, 0, 0.45)")};
  z-index: 1000;
`;

export const CustomModal = styled.div<{$themeMode: ThemeMode}>`
  width: min(360px, calc(100vw - 32px));
  border: 1px solid ${({$themeMode}) => ($themeMode === "light" ? "#d9d9d9" : "#2f2f2f")};
  border-radius: 12px;
  background: ${({$themeMode}) => ($themeMode === "light" ? "#ffffff" : "#1b1b1b")};
  color: ${({$themeMode}) => ($themeMode === "light" ? "#232323" : "#f0f0f0")};
  padding: 24px 28px;
`;

export const ModalTitle = styled.h2`
  margin: 0;
  font-size: 16px;
`;

export const ModalDescription = styled.p<{$themeMode: ThemeMode}>`
  font-size: 14px;
  color: ${({$themeMode}) => ($themeMode === "light" ? "#666666" : "#b7b7b7")};
  line-height: 1.45;
`;

export const ModalButtonContainer = styled.div`
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
  gap: 8px;
`;

export const ModalButton = styled.button<{$themeMode: ThemeMode}>`
  height: 32px;
  padding: 0 12px;
  border-radius: 8px;
  border: 1px solid ${({$themeMode}) => ($themeMode === "light" ? "#cfcfcf" : "#3b3b3b")};
  background: ${({$themeMode}) => ($themeMode === "light" ? "#f2f2f2" : "#252525")};
  color: ${({$themeMode}) => ($themeMode === "light" ? "#232323" : "#f0f0f0")};
  cursor: pointer;
  font-size: 13px;

  &:hover {
    background: ${({$themeMode}) => ($themeMode === "light" ? "#e8e8e8" : "#2f2f2f")};
  }
`;
