import styled from "styled-components";

export const Main = styled.main`
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #111111;
  color: #f0f0f0;
`;

export const TopBar = styled.header`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 48px;
  padding: 10px 14px;
  border-bottom: 1px solid #2a2a2a;
  background: #171717;
`;

export const TopBarTitle = styled.h1`
  margin: 0;
  font-size: 14px;
  font-weight: 600;
`;

export const TopBarActions = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const ZipUploadLabel = styled.label`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 32px;
  padding: 0 12px;
  border-radius: 8px;
  border: 1px solid #3b3b3b;
  cursor: pointer;
  font-size: 13px;
  background: #252525;
  &:hover {
    background: #2f2f2f;
  }
`;

export const HiddenFileInput = styled.input`
  display: none;
`;

export const DownloadButton = styled.button`
  height: 32px;
  padding: 0 12px;
  border-radius: 8px;
  border: 1px solid #3b3b3b;
  background: #252525;
  color: #f0f0f0;
  cursor: pointer;
  font-size: 13px;

  &:hover:not(:disabled) {
    background: #2f2f2f;
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
  width: 280px;
`;

export const RightPanel = styled.div`
  min-width: 0;
  min-height: 0;
  flex: 1;
`;
