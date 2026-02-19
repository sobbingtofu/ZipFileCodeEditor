"use client";

import {useState} from "react";
import type {ReactNode} from "react";
import {useServerInsertedHTML} from "next/navigation";
import {ServerStyleSheet, StyleSheetManager} from "styled-components";

export default function StyledComponentsRegistry({children}: {children: ReactNode}) {
  const [styledComponentsStyleSheet] = useState(() => new ServerStyleSheet());

  // 서버 사이드 렌더링 시 스타일을 주입
  useServerInsertedHTML(() => {
    const styles = styledComponentsStyleSheet.getStyleElement();
    styledComponentsStyleSheet.instance.clearTag();
    return <>{styles}</>;
  });

  if (typeof window !== "undefined") return <>{children}</>;

  return <StyleSheetManager sheet={styledComponentsStyleSheet.instance}>{children}</StyleSheetManager>;
}
