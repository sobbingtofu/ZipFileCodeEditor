import styled from "styled-components";

import {ThemeMode} from "@/src/store/useThemeStore";

export const TreeContainer = styled.aside<{$themeMode: ThemeMode}>`
  height: 100%;
  display: flex;
  flex-direction: column;
  border-right: 1px solid ${({$themeMode}) => ($themeMode === "light" ? "#d9d9d9" : "#2a2a2a")};
  background-color: ${({$themeMode}) => ($themeMode === "light" ? "#fafafa" : "#161616")};
  color: ${({$themeMode}) => ($themeMode === "light" ? "#2b2b2b" : "#e9e9e9")};
`;

export const TreeHeader = styled.div<{$themeMode: ThemeMode}>`
  padding: 12px;
  font-size: 13px;
  font-weight: 600;
  border-bottom: 1px solid ${({$themeMode}) => ($themeMode === "light" ? "#d9d9d9" : "#2a2a2a")};
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

export const TreeHeaderButtonWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  justify-content: flex-end;
`;

export const TreeHeaderButton = styled.button<{$themeMode: ThemeMode}>`
  margin-top: 4px;
  padding: 0px;
  border: none;
  background: transparent;
  color: ${({$themeMode}) => ($themeMode === "light" ? "#232323" : "#f0f0f0")};
  cursor: pointer;
`;

export const EmptyTreeContainer = styled.div<{$isHovering: boolean; $themeMode: ThemeMode}>`
  overflow: auto;
  flex: 1;
  padding: 6px 4px 10px;
  cursor: pointer;

  outline: 1px dashed transparent;
  outline-color: ${({$isHovering, $themeMode}) =>
    $isHovering ? ($themeMode === "light" ? "#9f9f9f" : "#6e6e6e") : "transparent"};
  outline-offset: -6px;
  background: ${({$themeMode}) => ($themeMode === "light" ? "#f4f4f4" : "#1b1b1b")};
  transition: outline-color 0.2s;

  > * > * {
    transform: scale(1);
    transform-origin: center;
    transition: transform 0.2s ease;
    will-change: transform;
  }

  &:hover > * > * {
    transform: scale(1.05);
  }
`;

export const EmptyMessageContainer = styled.div<{$themeMode: ThemeMode}>`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 4px;
  color: ${({$themeMode}) => ($themeMode === "light" ? "#777777" : "#979797")};
  font-size: 13px;
  padding: 60px 24px 8px 8px;
  user-select: none;
`;

export const TreeScrollArea = styled.div<{$isHovering: boolean; $themeMode: ThemeMode}>`
  overflow: auto;
  flex: 1;
  padding: 6px 4px 60px;
  background: ${({$themeMode}) => ($themeMode === "light" ? "#fafafa" : "#161616")};
  outline: 1px solid
    ${({$isHovering, $themeMode}) => {
      if ($themeMode === "light") {
        return $isHovering ? "#d3d3d3" : "#e0e0e0";
      }
      return $isHovering ? "#343434" : "#2b2b2b";
    }};
  outline-offset: -1px;

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

export const TreeNodeDiv = styled.div<{$depth: number; $isActive: boolean; $themeMode: ThemeMode}>`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  min-width: 200px;
  border: 0;
  text-align: left;
  background: ${({$isActive, $themeMode}) => {
    if (!$isActive) {
      return "transparent";
    }
    return $themeMode === "light" ? "#e7e7e7" : "#2b2b2b";
  }};
  color: inherit;
  border-radius: 6px;
  padding: 7px 8px;
  padding-left: ${({$depth}) => 10 + $depth * 16}px;
  font-size: 13px;
  cursor: pointer;

  &:hover {
    background: ${({$themeMode}) => ($themeMode === "light" ? "#e7e7e7" : "#2b2b2b")};
  }
`;

export const UploadGuide = styled.div<{$themeMode: ThemeMode}>`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  color: ${({$themeMode}) => ($themeMode === "light" ? "#7d7d7d" : "#6e6e6e")};
`;

export const FolderPrefix = styled.span`
  display: inline-block;
  width: 22px;
`;

export const RenameInputWrapper = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
  gap: 6px;
`;

export const RenameInput = styled.input<{$themeMode: ThemeMode}>`
  flex: 1;
  min-width: 0;
  border: 1px solid ${({$themeMode}) => ($themeMode === "light" ? "#cfcfcf" : "#3b3b3b")};
  background: ${({$themeMode}) => ($themeMode === "light" ? "#ffffff" : "#1f1f1f")};
  color: inherit;
  border-radius: 4px;
  font-size: 12px;
  padding: 2px 6px;
  height: 24px;

  &:focus {
    outline: 1px solid ${({$themeMode}) => ($themeMode === "light" ? "#9f9f9f" : "#5f5f5f")};
  }
`;

export const RenameCancelButton = styled.button<{$themeMode: ThemeMode}>`
  width: 18px;
  height: 18px;
  border: 0;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  line-height: 1;
  font-size: 12px;
  color: ${({$themeMode}) => ($themeMode === "light" ? "#4d4d4d" : "#d5d5d5")};
  background: ${({$themeMode}) => ($themeMode === "light" ? "#e3e3e3" : "#323232")};

  &:hover {
    background: ${({$themeMode}) => ($themeMode === "light" ? "#d5d5d5" : "#3a3a3a")};
  }
`;
