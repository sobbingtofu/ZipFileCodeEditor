import styled from "styled-components";

export const ModalBackdrop = styled.div`
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.45);
  z-index: 1000;
`;

export const CustomModal = styled.div`
  width: min(360px, calc(100vw - 32px));
  border: 1px solid #2f2f2f;
  border-radius: 12px;
  background: #1b1b1b;
  color: #f0f0f0;
  padding: 18px 16px 14px;
`;

export const ModalTitle = styled.h2`
  margin: 0;
  font-size: 16px;
`;

export const ModalDescription = styled.p`
  margin: 10px 0 16px;
  font-size: 13px;
  color: #b7b7b7;
  line-height: 1.45;
`;

export const ModalButton = styled.button`
  height: 32px;
  padding: 0 12px;
  border-radius: 8px;
  border: 1px solid #3b3b3b;
  background: #252525;
  color: #f0f0f0;
  cursor: pointer;
  font-size: 13px;

  &:hover {
    background: #2f2f2f;
  }
`;
