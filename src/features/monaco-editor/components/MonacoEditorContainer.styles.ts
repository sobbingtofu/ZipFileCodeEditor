import styled from "styled-components";

export const EditorWrapper = styled.section`
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: #1e1e1e;
`;

export const TabContainer = styled.div`
  display: flex;
  align-items: stretch;
  overflow-x: auto;
  border-bottom: 1px solid #2a2a2a;
  background-color: #181818;

  overflow-x: auto;

  scrollbar-color: #333333 #161616;

  &::-webkit-scrollbar {
    width: 9px;
    height: 9px;
  }

  &::-webkit-scrollbar-track {
    background: #161616;
  }

  &::-webkit-scrollbar-thumb {
    background: #333333;
    border-radius: 999px;
    border: 2px solid #161616;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: #3a3a3a;
  }
`;

export const TabDiv = styled.div<{$isActive: boolean}>`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  border: 0;
  border-right: 1px solid #2a2a2a;
  background-color: ${({$isActive}) => ($isActive ? "#1f1f1f" : "#181818")};
  color: ${({$isActive}) => ($isActive ? "#ffffff" : "#bdbdbd")};
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

export const UnsavedDot = styled.span<{$visible: boolean}>`
  width: 6px;
  height: 6px;
  border-radius: 999px;
  background: #ffffff;
  opacity: ${({$visible}) => ($visible ? 1 : 0)};
`;

export const CloseButton = styled.button`
  width: 18px;
  height: 18px;
  border: 0;
  border-radius: 4px;
  background: transparent;
  color: inherit;
  cursor: pointer;

  &:hover {
    background: #353535;
  }
`;

export const EditorBody = styled.div`
  flex: 1;
  min-height: 0;
  position: relative;
  overflow: hidden;
  padding: 24px 0px 0px 0px;
`;

export const MonacoHost = styled.div`
  width: 100%;
  height: 100%;
`;

export const EmptyState = styled.div`
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #a0a0a0;
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
