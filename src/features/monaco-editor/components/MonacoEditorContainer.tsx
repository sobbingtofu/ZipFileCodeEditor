"use client";

import {useMemo} from "react";
import type {MouseEvent} from "react";
import {FileNode} from "@/src/types/fileType";
import {findFileNodeInTree, useFileStore} from "@/src/store/useFileStore";
import {useEditorStore} from "@/src/store/useEditorStore";

import * as S from "./MonacoEditorContainer.styles";

import {getTabName} from "../logic/editorLogics";
import {useMonacoEditorSync} from "@/src/features/monaco-editor";
import Image from "next/image";

interface MonacoEditorContainerEditorContainerProps {
  onFlushContentToStoreChange: (flushContentToStore: () => void) => void;
}

function MonacoEditorContainer({onFlushContentToStoreChange}: MonacoEditorContainerEditorContainerProps) {
  const fileTree = useFileStore((state) => state.fileTree);

  const activeFilePath = useEditorStore((state) => state.activeFilePath);
  const openedFilePaths = useEditorStore((state) => state.openedFilePaths);
  const setActiveFilePath = useEditorStore((state) => state.setActiveFilePath);
  const closeFileTab = useEditorStore((state) => state.closeFileTab);

  const activeFile = useMemo<FileNode | null>(() => {
    if (!activeFilePath) {
      return null;
    }

    return findFileNodeInTree(fileTree, activeFilePath);
  }, [fileTree, activeFilePath]);

  const {monacoHostRef, flushContentToStore} = useMonacoEditorSync({
    activeFilePath,
    activeFile,
    onFlushContentToStoreChange,
  });

  const handleTabClick = (filePath: string) => {
    if (filePath === activeFilePath) {
      return;
    }

    flushContentToStore(activeFilePath ?? undefined);
    setActiveFilePath(filePath);
  };

  const handleTabClose = (event: MouseEvent<HTMLButtonElement>, filePath: string) => {
    event.stopPropagation();

    flushContentToStore(filePath);
    closeFileTab(filePath);
  };

  return (
    <S.EditorWrapper>
      <S.TabContainer>
        {openedFilePaths.map((openedPath) => (
          <S.TabDiv
            key={openedPath}
            $isActive={openedPath === activeFilePath}
            onClick={() => handleTabClick(openedPath)}
          >
            <span>{getTabName(openedPath)}</span>
            <S.CloseButton type="button" onClick={(event) => handleTabClose(event, openedPath)}>
              ×
            </S.CloseButton>
          </S.TabDiv>
        ))}
      </S.TabContainer>
      <S.EditorBody>
        {!activeFilePath && <S.EmptyState>왼쪽 파일 트리에서 파일을 선택하세요.</S.EmptyState>}

        {activeFilePath && activeFile?.isBinary && (
          <S.ImageViewer>
            <S.ImageViewport>
              <Image
                src={activeFile.content ?? ""}
                alt={activeFile.name}
                fill
                unoptimized
                sizes="100vw"
                style={{objectFit: "contain", objectPosition: "center"}}
              />
            </S.ImageViewport>
          </S.ImageViewer>
        )}

        <S.MonacoHost
          ref={monacoHostRef}
          style={{display: activeFile?.isBinary || !activeFilePath ? "none" : "block"}}
        />
      </S.EditorBody>
    </S.EditorWrapper>
  );
}

export {MonacoEditorContainer};
