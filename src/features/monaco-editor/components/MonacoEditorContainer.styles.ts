import styled from "styled-components";

import {ThemeMode} from "@/src/store/useThemeStore";

export const EditorWrapper = styled.section<{$themeMode: ThemeMode}>`
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: ${({$themeMode}) => ($themeMode === "light" ? "#ffffff" : "#1e1e1e")};
`;

export const TabContainer = styled.div<{$themeMode: ThemeMode}>`
  display: flex;
  align-items: stretch;
  overflow-x: auto;
  border-bottom: 1px solid ${({$themeMode}) => ($themeMode === "light" ? "#d9d9d9" : "#2a2a2a")};
  background-color: ${({$themeMode}) => ($themeMode === "light" ? "#f7f7f7" : "#181818")};

  overflow-x: auto;

  scrollbar-color: ${({$themeMode}) => ($themeMode === "light" ? "#c4c4c4 #f2f2f2" : "#333333 #161616")};

  &::-webkit-scrollbar {
    width: 9px;
    height: 9px;
  }

  &::-webkit-scrollbar-track {
    background: ${({$themeMode}) => ($themeMode === "light" ? "#f2f2f2" : "#161616")};
  }

  &::-webkit-scrollbar-thumb {
    background: ${({$themeMode}) => ($themeMode === "light" ? "#c4c4c4" : "#333333")};
    border-radius: 999px;
    border: 2px solid ${({$themeMode}) => ($themeMode === "light" ? "#f2f2f2" : "#161616")};
  }

  &::-webkit-scrollbar-thumb:hover {
    background: ${({$themeMode}) => ($themeMode === "light" ? "#b5b5b5" : "#3a3a3a")};
  }
`;

export const TabDiv = styled.div<{$isActive: boolean; $themeMode: ThemeMode}>`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  border: 0;
  border-right: 1px solid ${({$themeMode}) => ($themeMode === "light" ? "#d9d9d9" : "#2a2a2a")};
  background-color: ${({$isActive, $themeMode}) => {
    if ($themeMode === "light") {
      return $isActive ? "#ffffff" : "#f7f7f7";
    }
    return $isActive ? "#1f1f1f" : "#181818";
  }};
  color: ${({$isActive, $themeMode}) => {
    if ($themeMode === "light") {
      return $isActive ? "#242424" : "#6a6a6a";
    }
    return $isActive ? "#ffffff" : "#bdbdbd";
  }};
  padding: 8px 12px;
  cursor: pointer;
  white-space: nowrap;
`;

export const TabLabel = styled.span`
  display: inline-block;
`;

export const TabActionGroup = styled.span`
  width: 28px;
  display: inline-flex;
  align-items: center;
  justify-content: space-between;
`;

export const UnsavedDot = styled.span<{$visible: boolean; $themeMode: ThemeMode}>`
  width: 6px;
  height: 6px;
  border-radius: 999px;
  background: ${({$themeMode}) => ($themeMode === "light" ? "#1f1f1f" : "#ffffff")};
  opacity: ${({$visible}) => ($visible ? 1 : 0)};
`;

export const CloseButton = styled.button<{$themeMode: ThemeMode}>`
  width: 18px;
  height: 18px;
  border: 0;
  border-radius: 4px;
  background: transparent;
  color: inherit;
  cursor: pointer;

  &:hover {
    background: ${({$themeMode}) => ($themeMode === "light" ? "#e7e7e7" : "#353535")};
  }
`;

export const PathNameIndicatorBar = styled.div<{$themeMode: ThemeMode}>`
  height: 24px;
  border-bottom: 1px solid ${({$themeMode}) => ($themeMode === "light" ? "#d9d9d9" : "#2a2a2a")};
  display: flex;
  font-size: 12px;
  color: ${({$themeMode}) => ($themeMode === "light" ? "#666666" : "#bdbdbd")};
  padding: 4px 4px 2px 12px;
`;

export const EditorBody = styled.div`
  flex: 1;
  min-height: 0;
  position: relative;
  overflow: hidden;
  padding: 16px 0px 0px 0px;
`;

export const MonacoHost = styled.div`
  width: 100%;
  height: 100%;
`;

export const EmptyState = styled.div<{$themeMode: ThemeMode}>`
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({$themeMode}) => ($themeMode === "light" ? "#737373" : "#a0a0a0")};
  font-size: 14px;
`;

export const ImageViewer = styled.div`
  height: 100%;
  width: 100%;
  min-height: 0;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
`;

export const ImageViewport = styled.div`
  position: relative;
  padding: 20px;
  width: 85%;
  height: 85%;
`;
