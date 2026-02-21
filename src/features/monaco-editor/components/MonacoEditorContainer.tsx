"use client";

import {useEffect, useMemo, useState} from "react";
import {FileNode} from "@/src/types/fileType";
import {useFileStore} from "@/src/store/useFileStore";
import {useEditorStore} from "@/src/store/useEditorStore";

import * as S from "./MonacoEditorContainer.styles";

import {getNextActivePathAfterClose, getTabName} from "@/src/features/monaco-editor";
import {useMonacoEditorSync} from "@/src/features/monaco-editor";
import Image from "next/image";
import {CustomModal} from "@/src/features/custom-modal";
import {useThemeStore} from "@/src/store/useThemeStore";
import {getNodeByPathFromIndex} from "../../file-tree";

interface MonacoEditorContainerEditorContainerProps {
  onFlushAllMonacoToZustandChange: (flushAllMonacoToZustand: () => void) => void;
  onFlushActiveFileMonacoToZustandChange: (flushActiveFileMonacoToZustand: () => void) => void;
  onUndoActiveFileMonacoChange: (undoActiveFileMonaco: () => void) => void;
  onRedoActiveFileMonacoChange: (redoActiveFileMonaco: () => void) => void;
}

function MonacoEditorContainer({
  onFlushAllMonacoToZustandChange,
  onFlushActiveFileMonacoToZustandChange,
  onUndoActiveFileMonacoChange,
  onRedoActiveFileMonacoChange,
}: MonacoEditorContainerEditorContainerProps) {
  const fileTree = useFileStore((state) => state.fileTree);
  const fileTreeIndex = useFileStore((state) => state.fileTreeIndex);
  const triggerRevealFilePath = useFileStore((state) => state.triggerShowInTreeTargetPath);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const theme = useThemeStore((state) => state.theme);

  const selectedFileFolderPath = useEditorStore((state) => state.selectedFileFolderPath);
  const openedFilePaths = useEditorStore((state) => state.openedFilePaths);
  const setActiveFilePath = useEditorStore((state) => state.setActiveFilePath);
  const closeFileTab = useEditorStore((state) => state.closeFileTab);
  const [editorActiveFilePath, setEditorActiveFilePath] = useState<string | null>(null);

  useEffect(() => {
    let nextEditorPath = editorActiveFilePath;

    // 트리에서 선택된 경로가 파일이면 에디터 활성 경로를 해당 파일로 동기화
    if (selectedFileFolderPath) {
      const selectedNode = getNodeByPathFromIndex(fileTreeIndex, selectedFileFolderPath);
      if (selectedNode?.type === "file") {
        nextEditorPath = selectedFileFolderPath;
      }
    }

    // 현재 에디터 활성 경로가 더 이상 유효하지 않으면 열린 탭의 마지막 파일로 fallback
    if (nextEditorPath) {
      const existingNode = getNodeByPathFromIndex(fileTreeIndex, nextEditorPath);
      if (!existingNode || existingNode.type !== "file") {
        nextEditorPath = openedFilePaths[openedFilePaths.length - 1] ?? null;
      }
    }

    if (nextEditorPath !== editorActiveFilePath) {
      setEditorActiveFilePath(nextEditorPath);
    }
  }, [editorActiveFilePath, fileTreeIndex, openedFilePaths, selectedFileFolderPath]);

  const activeFile = useMemo<FileNode | null>(() => {
    if (!editorActiveFilePath) {
      return null;
    }

    return getNodeByPathFromIndex(fileTreeIndex, editorActiveFilePath);
  }, [fileTreeIndex, editorActiveFilePath]);

  // 열린 파일 경로 목록과 파일 트리를 기반으로,
  // 각 열린 파일이 저장되지 않은 변경사항을 가지고 있는지 여부를 <파일의 path - 변경사항보유여부 boolean> 형태로 매핑한 객체 생성
  const unsavedByPath = useMemo<Record<string, boolean>>(() => {
    const unsavedMap: Record<string, boolean> = {};

    for (const openedPath of openedFilePaths) {
      const node = getNodeByPathFromIndex(fileTreeIndex, openedPath);
      unsavedMap[openedPath] = Boolean(node?.type === "file" && node.haveUnsavedChange);
    }

    return unsavedMap;
  }, [fileTreeIndex, openedFilePaths]);

  /* 파일 탭 닫기 버튼 클릭 핸들러
   * - 닫으려는 탭의 파일 경로에 저장되지 않은 변경사항이 있는 경우 : 저장 확인 모달 열기
   * - 닫으려는 탭의 파일 경로에 저장되지 않은 변경사항이 없는 경우 : 바로 탭 닫기
   */
  const handleTabClose = (filePath: string) => {
    const targetFileNode = getNodeByPathFromIndex(fileTreeIndex, filePath);
    if (targetFileNode?.type === "file" && targetFileNode.haveUnsavedChange) {
      setIsSaveModalOpen(true);
      return;
    }

    if (editorActiveFilePath === filePath) {
      setEditorActiveFilePath(getNextActivePathAfterClose(openedFilePaths, filePath).nextActivePath);
    }

    closeFileTab(filePath);
  };

  const {monacoHostRef, flushMonacoToZustandByFilePath, rollbackMonacoModelToZustandByFilePath} = useMonacoEditorSync({
    editorActiveFilePath,
    activeFile,
    onFlushAllMonacoToZustandChange,
    onFlushActiveFileMonacoToZustandChange,
    onUndoActiveFileMonacoChange,
    onRedoActiveFileMonacoChange,
    handleTabClose,
  });

  const handleTabClick = (filePath: string) => {
    triggerRevealFilePath(filePath);

    setActiveFilePath(filePath);
  };

  const handleEditorBodyMouseDownCapture = () => {
    if (!editorActiveFilePath || selectedFileFolderPath === editorActiveFilePath) {
      return;
    }

    triggerRevealFilePath(editorActiveFilePath);
    setActiveFilePath(editorActiveFilePath);
  };

  const handleCloseSaveCheckModal = () => {
    setIsSaveModalOpen(false);
  };

  const handleSaveBeforeClose = () => {
    if (!editorActiveFilePath) {
      return;
    }

    setEditorActiveFilePath(getNextActivePathAfterClose(openedFilePaths, editorActiveFilePath).nextActivePath);
    flushMonacoToZustandByFilePath(editorActiveFilePath);
    closeFileTab(editorActiveFilePath);
    handleCloseSaveCheckModal();
  };

  const handleNotSaveBeforeClose = () => {
    if (!editorActiveFilePath) {
      return;
    }

    setEditorActiveFilePath(getNextActivePathAfterClose(openedFilePaths, editorActiveFilePath).nextActivePath);
    rollbackMonacoModelToZustandByFilePath(editorActiveFilePath);
    closeFileTab(editorActiveFilePath);
    handleCloseSaveCheckModal();
  };

  return (
    <S.EditorWrapper $themeMode={theme}>
      <S.TabContainer $themeMode={theme}>
        {openedFilePaths.map((openedPath) => (
          <S.TabDiv
            key={openedPath}
            $isActive={openedPath === editorActiveFilePath}
            $themeMode={theme}
            onClick={() => handleTabClick(openedPath)}
          >
            <S.TabLabel>{getTabName(openedPath)}</S.TabLabel>
            <S.TabActionGroup>
              <S.UnsavedDot $themeMode={theme} $visible={Boolean(unsavedByPath[openedPath])} />
              <S.CloseButton
                $themeMode={theme}
                type="button"
                onMouseDown={(event) => {
                  event.stopPropagation();
                }}
                onClick={(event) => {
                  event.stopPropagation();
                  handleTabClose(openedPath);
                }}
              >
                ×
              </S.CloseButton>
            </S.TabActionGroup>
          </S.TabDiv>
        ))}
      </S.TabContainer>
      {editorActiveFilePath && (
        <S.PathNameIndicatorBar $themeMode={theme}>
          <span>{editorActiveFilePath.replace(/\\/g, "/").replace(/\//g, " > ")}</span>
        </S.PathNameIndicatorBar>
      )}
      <S.EditorBody onMouseDownCapture={handleEditorBodyMouseDownCapture}>
        {!editorActiveFilePath && <S.EmptyState $themeMode={theme}>왼쪽 파일 트리에서 파일을 선택하세요.</S.EmptyState>}

        {editorActiveFilePath && activeFile?.isBinary && (
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
          style={{
            display:
              activeFile?.isBinary || !editorActiveFilePath ? "none" : activeFile?.isEditableText ? "block" : "none",
          }}
        />

        <S.EditorErrorFallback
          $themeMode={theme}
          style={{display: activeFile && !activeFile.isEditableText ? "flex" : "none"}}
        >
          <p>이 파일은 열 수 없는 형식입니다.</p>
        </S.EditorErrorFallback>
      </S.EditorBody>
      <S.EditorBody style={{display: activeFile ? "block" : "none"}}></S.EditorBody>
      <CustomModal
        modalType="multiBtns"
        isOpen={isSaveModalOpen}
        onClose={handleCloseSaveCheckModal}
        message="닫기 전 변경내역을 저장할까요?"
        btnInfo={[
          {btnName: "저장", btnFunc: handleSaveBeforeClose},
          {btnName: "저장하지 않음", btnFunc: handleNotSaveBeforeClose},
          {btnName: "취소", btnFunc: handleCloseSaveCheckModal},
        ]}
      />
    </S.EditorWrapper>
  );
}

export {MonacoEditorContainer};
