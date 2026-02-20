"use client";

import {useEffect, useState} from "react";
import {createPortal} from "react-dom";

import * as S from "@/src/features/custom-modal/components/ZipAlertModal.styles";

type ZipAlertModalProps = {
  isOpen: boolean;
  onClose: () => void;
  errorMessage?: string;
};

export function ZipAlertModal({isOpen, onClose, errorMessage = "오류가 발생했습니다."}: ZipAlertModalProps) {
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
    <S.AlertOverlay role="dialog" aria-modal="true" aria-labelledby="zip-alert-title" onClick={onClose}>
      <S.AlertModal onClick={(event) => event.stopPropagation()}>
        <S.AlertTitle id="zip-alert-title">업로드 오류</S.AlertTitle>
        <S.AlertDescription>{errorMessage ?? "Zip 파일 업로드 중 오류가 발생했습니다."}</S.AlertDescription>
        <S.AlertButton type="button" onClick={onClose}>
          확인
        </S.AlertButton>
      </S.AlertModal>
    </S.AlertOverlay>,
    document.body,
  );
}
