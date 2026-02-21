"use client";

import {useEffect, useRef, useState} from "react";
import {createPortal} from "react-dom";

import * as S from "@/src/features/custom-modal/components/CustomModal.styles";
import {useThemeStore} from "@/src/store/useThemeStore";

type ModalButtonInfo = {
  btnName: string;
  btnFunc: () => void;
};

type CustomModalProps = {
  modalType?: "alert" | "confirm" | "multiBtns";
  isOpen: boolean;
  onClose: () => void;
  message?: string;
  onConfirm?: () => void;
  btnInfo?: ModalButtonInfo[];
};

export function CustomModal({
  modalType = "alert",
  isOpen,
  onClose,
  message = "",
  onConfirm,
  btnInfo = [],
}: CustomModalProps) {
  const [isMounted, setIsMounted] = useState(false);
  const modalRef = useRef<HTMLDivElement | null>(null);
  const theme = useThemeStore((state) => state.theme);

  useEffect(() => {
    setIsMounted(true);
    return () => {
      setIsMounted(false);
    };
  }, []);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    modalRef.current?.focus();

    const handleEscapeKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") {
        return;
      }

      event.preventDefault();
      event.stopPropagation();
      onClose();
    };

    window.addEventListener("keydown", handleEscapeKeyDown, true);

    return () => {
      window.removeEventListener("keydown", handleEscapeKeyDown, true);
    };
  }, [isOpen, onClose]);

  if (!isMounted || !isOpen) {
    return null;
  }

  return createPortal(
    <S.ModalBackdrop $themeMode={theme} onClick={onClose}>
      <S.CustomModal $themeMode={theme} ref={modalRef} tabIndex={-1} onClick={(event) => event.stopPropagation()}>
        <S.ModalDescription $themeMode={theme}>{message}</S.ModalDescription>
        <S.ModalButtonContainer>
          {modalType == "alert" && (
            <S.ModalButton $themeMode={theme} type="button" onClick={onClose}>
              확인
            </S.ModalButton>
          )}
          {modalType == "confirm" && (
            <>
              <S.ModalButton $themeMode={theme} type="button" onClick={onClose}>
                취소
              </S.ModalButton>
              <S.ModalButton $themeMode={theme} type="button" onClick={onConfirm}>
                확인
              </S.ModalButton>
            </>
          )}
          {modalType == "multiBtns" && (
            <>
              {btnInfo.map((buttonInfo, index) => (
                <S.ModalButton
                  $themeMode={theme}
                  key={`${buttonInfo.btnName}-${index}`}
                  type="button"
                  onClick={buttonInfo.btnFunc}
                >
                  {buttonInfo.btnName}
                </S.ModalButton>
              ))}
            </>
          )}
        </S.ModalButtonContainer>
      </S.CustomModal>
    </S.ModalBackdrop>,
    document.body,
  );
}
