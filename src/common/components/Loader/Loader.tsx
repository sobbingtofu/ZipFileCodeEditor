"use client";

import {createPortal} from "react-dom";
import {useEffect, useState} from "react";

import {useFileStore} from "@/src/store/useFileStore";
import {useThemeStore} from "@/src/store/useThemeStore";

import * as S from "./Loader.styles";

function Loader() {
  const [isMounted, setIsMounted] = useState(false);
  const isLoading = useFileStore((state) => state.isLoading);
  const loadingType = useFileStore((state) => state.loadingType);
  const theme = useThemeStore((state) => state.theme);

  // 포털 안전장치
  useEffect(() => {
    setIsMounted(true);

    return () => {
      setIsMounted(false);
    };
  }, []);

  if (!isMounted || !isLoading) {
    return null;
  }

  const loadingMessageByType =
    loadingType === "upload"
      ? "업로드 중입니다. 잠시만 기다려주세요"
      : loadingType === "download"
        ? "다운로드 준비중입니다"
        : "로딩 중입니다";

  return createPortal(
    <S.LoaderBackdrop $themeMode={theme}>
      <S.LoaderContainer $themeMode={theme} role="status" aria-live="polite" aria-busy="true">
        <S.Spinner $themeMode={theme} />
        <S.LoaderMessage $themeMode={theme}>{loadingMessageByType}</S.LoaderMessage>
      </S.LoaderContainer>
    </S.LoaderBackdrop>,
    document.body,
  );
}

export {Loader};
