import styled from "styled-components";

export const TreeContainer = styled.aside`
  height: 100%;
  display: flex;
  flex-direction: column;
  border-right: 1px solid #2a2a2a;
  background-color: #161616;
  color: #e9e9e9;
`;

export const TreeHeader = styled.div`
  padding: 12px;
  font-size: 13px;
  font-weight: 600;
  border-bottom: 1px solid #2a2a2a;
`;

export const TreeScrollArea = styled.div`
  overflow: auto;
  flex: 1;
  padding: 6px 4px 10px;
`;

export const TreeNodeDiv = styled.div<{$depth: number; $isActive: boolean}>`
  width: 100%;
  border: 0;
  text-align: left;
  background: ${({$isActive}) => ($isActive ? "#2b2b2b" : "transparent")};
  color: inherit;
  border-radius: 6px;
  padding: 7px 8px;
  padding-left: ${({$depth}) => 10 + $depth * 16}px;
  font-size: 13px;
  cursor: pointer;

  &:hover {
    background: #2b2b2b;
  }
`;

export const FolderPrefix = styled.span`
  display: inline-block;
  width: 22px;
`;

export const EmptyMessage = styled.div`
  color: #979797;
  font-size: 12px;
  padding: 8px;
`;
