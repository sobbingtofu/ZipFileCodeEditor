"use client";

import {useMemo} from "react";
import {useState} from "react";
import {FileNode} from "@/src/types/fileType";
import {findFileNodeInTree, useFileStore} from "@/src/store/useFileStore";
import {useEditorStore} from "@/src/store/useEditorStore";

import * as S from "./MonacoEditorContainer.styles";

import {getTabName} from "../logic/editorLogics";
import {useMonacoEditorSync} from "@/src/features/monaco-editor";
import Image from "next/image";
import {CustomModal} from "@/src/features/custom-modal";

interface MonacoEditorContainerEditorContainerProps {
  onFlushAllMonacoToZustandChange: (flushAllMonacoToZustand: () => void) => void;
}

function MonacoEditorContainer({onFlushAllMonacoToZustandChange}: MonacoEditorContainerEditorContainerProps) {
  const fileTree = useFileStore((state) => state.fileTree);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);

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

  // 열린 파일 경로 목록과 파일 트리를 기반으로,
  // 각 열린 파일이 저장되지 않은 변경사항을 가지고 있는지 여부를 <파일의 path - 변경사항보유여부 boolean> 형태로 매핑한 객체 생성
  const unsavedByPath = useMemo<Record<string, boolean>>(() => {
    const unsavedMap: Record<string, boolean> = {};

    for (const openedPath of openedFilePaths) {
      const node = findFileNodeInTree(fileTree, openedPath);
      unsavedMap[openedPath] = Boolean(node?.type === "file" && node.haveUnsavedChange);
    }

    return unsavedMap;
  }, [fileTree, openedFilePaths]);

  /* 파일 탭 닫기 버튼 클릭 핸들러
   * - 닫으려는 탭의 파일 경로에 저장되지 않은 변경사항이 있는 경우 : 저장 확인 모달 열기
   * - 닫으려는 탭의 파일 경로에 저장되지 않은 변경사항이 없는 경우 : 바로 탭 닫기
   */
  const handleTabClose = (filePath: string) => {
    const targetFileNode = findFileNodeInTree(fileTree, filePath);
    if (targetFileNode?.type === "file" && targetFileNode.haveUnsavedChange) {
      setIsSaveModalOpen(true);
      return;
    }

    closeFileTab(filePath);
  };

  const {monacoHostRef, flushMonacoToZustandByFilePath, rollbackMonacoModelToZustandByFilePath} = useMonacoEditorSync({
    activeFilePath,
    activeFile,
    onFlushAllMonacoToZustandChange,
    handleTabClose,
  });

  const handleTabClick = (filePath: string) => {
    if (filePath === activeFilePath) {
      return;
    }
    setActiveFilePath(filePath);
  };

  const handleCloseSaveCheckModal = () => {
    setIsSaveModalOpen(false);
  };

  const handleSaveBeforeClose = () => {
    if (!activeFilePath) {
      return;
    }

    flushMonacoToZustandByFilePath(activeFilePath);
    closeFileTab(activeFilePath);
    handleCloseSaveCheckModal();
  };

  const handleNotSaveBeforeClose = () => {
    if (!activeFilePath) {
      return;
    }

    rollbackMonacoModelToZustandByFilePath(activeFilePath);
    closeFileTab(activeFilePath);
    handleCloseSaveCheckModal();
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
            <S.TabLabel>{getTabName(openedPath)}</S.TabLabel>
            <S.TabActionGroup>
              <S.UnsavedDot $visible={Boolean(unsavedByPath[openedPath])} />
              <S.CloseButton
                type="button"
                onClick={() => {
                  handleTabClose(openedPath);
                }}
              >
                ×
              </S.CloseButton>
            </S.TabActionGroup>
          </S.TabDiv>
        ))}
      </S.TabContainer>
      {activeFilePath && (
        <S.PathNameIndicatorBar>
          <span>{activeFilePath.replace(/\\/g, "/").replace(/\//g, " > ")}</span>
        </S.PathNameIndicatorBar>
      )}
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
