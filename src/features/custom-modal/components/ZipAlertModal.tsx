"use client";

import {useEffect, useState} from "react";
import {createPortal} from "react-dom";

import * as S from "@/src/features/custom-modal/components/ZipAlertModal.styles";

type ZipAlertModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function ZipAlertModal({isOpen, onClose}: ZipAlertModalProps) {
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
        <S.AlertDescription>Zip 파일만 업로드할 수 있습니다. Zip 파일을 선택해주세요.</S.AlertDescription>
        <S.AlertButton type="button" onClick={onClose}>
          확인
        </S.AlertButton>
      </S.AlertModal>
    </S.AlertOverlay>,
    document.body,
  );
}
