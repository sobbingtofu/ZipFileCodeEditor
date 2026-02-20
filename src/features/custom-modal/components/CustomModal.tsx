"use client";

import {useEffect, useState} from "react";
import {createPortal} from "react-dom";

import * as S from "@/src/features/custom-modal/components/CustomModal.styles";

type CustomModalProps = {
  modalType: "alert" | "confirm" | "save";
  isOpen: boolean;
  onClose: () => void;
  errorMessage?: string;
  onConfirm?: () => void;
  onSave?: () => void;
  onNotSave?: () => void;
};

export function CustomModal({
  modalType = "alert",
  isOpen,
  onClose,
  errorMessage = "오류가 발생했습니다.",
  onConfirm,
  onSave,
  onNotSave,
}: CustomModalProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    return () => {
      setIsMounted(false);
    };
  }, []);

  if (!isMounted || !isOpen) {
    return null;
  }

  return createPortal(
    <S.ModalBackdrop role="dialog" aria-modal="true" aria-labelledby="zip-alert-title" onClick={onClose}>
      <S.CustomModal onClick={(event) => event.stopPropagation()}>
        <S.ModalTitle id="zip-alert-title">업로드 오류</S.ModalTitle>
        <S.ModalDescription>{errorMessage ?? "Zip 파일 업로드 중 오류가 발생했습니다."}</S.ModalDescription>
        {modalType == "alert" && (
          <S.ModalButton type="button" onClick={onClose}>
            확인
          </S.ModalButton>
        )}
        {modalType == "confirm" && (
          <>
            <S.ModalButton type="button" onClick={onClose}>
              취소
            </S.ModalButton>
            <S.ModalButton type="button" onClick={onConfirm}>
              확인
            </S.ModalButton>
          </>
        )}
        {modalType == "save" && (
          <>
            <S.ModalButton type="button" onClick={onSave}>
              저장
            </S.ModalButton>
            <S.ModalButton type="button" onClick={onNotSave}>
              저장하지 않음
            </S.ModalButton>
            <S.ModalButton type="button" onClick={onClose}>
              취소
            </S.ModalButton>
          </>
        )}
      </S.CustomModal>
    </S.ModalBackdrop>,
    document.body,
  );
}
