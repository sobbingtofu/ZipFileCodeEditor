import {ThemeMode} from "@/src/store/useThemeStore";
import styled from "styled-components";

export const Main = styled.main<{$themeMode: ThemeMode}>`
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: ${({$themeMode}) => ($themeMode === "light" ? "#f5f5f5" : "#111111")};
  color: ${({$themeMode}) => ($themeMode === "light" ? "#1f1f1f" : "#f0f0f0")};
`;

export const TopBar = styled.header<{$themeMode: ThemeMode}>`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 48px;
  padding: 10px 20px 10px 14px;
  border-bottom: 1px solid ${({$themeMode}) => ($themeMode === "light" ? "#d9d9d9" : "#2a2a2a")};
  background: ${({$themeMode}) => ($themeMode === "light" ? "#ffffff" : "#171717")};
`;

export const TopBarTitle = styled.h1`
  margin: 0;
  font-size: 14px;
  font-weight: 600;
`;

export const TopBarActionContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 48px;
  flex: 1;
  justify-content: space-between;
`;

export const TopBarFileActions = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const TopBarEditorActionThemeToggleWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 24px;
  justify-content: flex-end;
`;

export const TopBarEditorActions = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const ZipUploadLabel = styled.label<{$themeMode: ThemeMode}>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 32px;
  padding: 0 12px;
  border-radius: 8px;
  border: 1px solid ${({$themeMode}) => ($themeMode === "light" ? "#cfcfcf" : "#3b3b3b")};
  cursor: pointer;
  font-size: 13px;
  background: ${({$themeMode}) => ($themeMode === "light" ? "#f2f2f2" : "#252525")};
  &:hover {
    background: ${({$themeMode}) => ($themeMode === "light" ? "#e8e8e8" : "#2f2f2f")};
  }
`;

export const HiddenFileInput = styled.input`
  display: none;
`;

export const TopBarButton = styled.button<{$themeMode: ThemeMode}>`
  height: 32px;
  padding: 0 12px;
  border-radius: 8px;
  border: 1px solid ${({$themeMode}) => ($themeMode === "light" ? "#cfcfcf" : "#3b3b3b")};
  background: ${({$themeMode}) => ($themeMode === "light" ? "#f2f2f2" : "#252525")};
  color: ${({$themeMode}) => ($themeMode === "light" ? "#232323" : "#f0f0f0")};
  cursor: pointer;
  font-size: 13px;

  &:hover:not(:disabled) {
    background: ${({$themeMode}) => ($themeMode === "light" ? "#e8e8e8" : "#2f2f2f")};
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
`;

export const BodyLayout = styled.div`
  min-height: 0;
  flex: 1;
  display: flex;
  flex-direction: row;
`;

export const LeftPanel = styled.div`
  min-width: 0;
  min-height: 0;
  min-width: 200px;
  flex-shrink: 0;
`;

export const PanelResizer = styled.div<{$themeMode: ThemeMode}>`
  width: 6px;
  min-height: 0;
  cursor: col-resize;
  background: transparent;

  &:hover {
    background: ${({$themeMode}) => ($themeMode === "light" ? "#d9d9d9" : "#2a2a2a")};
  }
`;

export const RightPanel = styled.div`
  min-width: 0;
  min-height: 0;
  flex: 1;
`;
