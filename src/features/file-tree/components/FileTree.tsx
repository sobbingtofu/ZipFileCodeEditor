"use client";

import {DragEvent, useCallback, useMemo, useRef, useState} from "react";

import * as S from "@/src/features/file-tree/components/FileTree.styles";

import {FileTreeNode} from "./FileTreeNode";
import {useFileStore} from "@/src/store/useFileStore";
import {useEditorStore} from "@/src/store/useEditorStore";
import {CustomModal} from "@/src/features/custom-modal";
import {useHandleZipUpload} from "@/src/features/zip-handler";
import {AddFileIcon, AddFolderIcon, CollapseIcon, RenameIcon, UploadIcon} from "@/public/icon";
import {HiddenFileInput} from "@/app/page.styles";
import {useThemeStore} from "@/src/store/useThemeStore";
import {useRenameFile} from "../hooks/useRenameFile";

function FileTree() {
  const fileTree = useFileStore((state) => state.fileTree);
  const activeFilePath = useEditorStore((state) => state.activeFilePath);
  const hasNodes = useMemo(() => fileTree.length > 0, [fileTree]);
  const theme = useThemeStore((state) => state.theme);
  const treeScrollAreaRef = useRef<HTMLDivElement | null>(null);

  const [isHovering, setIsHovering] = useState(false);
  const [isTreeAlertOpen, setIsTreeAlertOpen] = useState(false);
  const [treeErrMsg, setTreeErrMsg] = useState("");

  const [collapseAllSignal, setCollapseAllSignal] = useState(0);

  const {handleZipFileDrop, handleZipFileInputChange} = useHandleZipUpload();

  const {
    renamingTargetPath,
    renameInputValue,
    setRenameInputValue,
    handleRenameSubmit,
    handleRenameCancel,
    handleRenameBtnClick,
  } = useRenameFile({
    treeScrollAreaRef,
    fileTree,
    activeFilePath,
    onInvalidRenameName: () => {
      setTreeErrMsg("파일 이름에는 특수문자 /와 \\를 사용할 수 없습니다.");
      setIsTreeAlertOpen(true);
    },
  });

  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "copy";
  };

  const handleDragLeave = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const executeDropAndProcessResult = async (event: DragEvent<HTMLDivElement>) => {
    const result = await handleZipFileDrop(event);
    if (result && !result.success) {
      setTreeErrMsg(result.error || "알 수 없는 오류가 발생했습니다.");
      setIsTreeAlertOpen(true);
    }
  };

  const handleCloseZipAlert = () => {
    setIsTreeAlertOpen(false);
    setTreeErrMsg("");
  };

  const handleCollapseAllFolders = () => {
    setCollapseAllSignal((prev) => prev + 1);
  };

  return (
    <S.TreeContainer $themeMode={theme}>
      <S.TreeHeader $themeMode={theme}>
        <h3>파일 탐색기</h3>
        {hasNodes && (
          <S.TreeHeaderButtonWrapper>
            {/* 이름 변경 모드 토글 */}
            <S.TreeHeaderButton
              $themeMode={theme}
              aria-label="Rename"
              title="Rename"
              onMouseDown={(event) => {
                event.preventDefault();
              }}
              onClick={handleRenameBtnClick}
            >
              <RenameIcon />
            </S.TreeHeaderButton>

            {/* 파일 추가 */}
            <S.TreeHeaderButton $themeMode={theme} aria-label="Add File" title="Add File" onClick={() => {}}>
              <AddFileIcon />
            </S.TreeHeaderButton>

            {/* 폴더 추가 */}
            <S.TreeHeaderButton $themeMode={theme} aria-label="Add Folder" title="Add Folder" onClick={() => {}}>
              <AddFolderIcon />
            </S.TreeHeaderButton>

            {/* 모든 폴더 접기 */}
            <S.TreeHeaderButton
              $themeMode={theme}
              aria-label="Collapse All"
              title="Collapse All Folders"
              onClick={handleCollapseAllFolders}
            >
              <CollapseIcon />
            </S.TreeHeaderButton>
          </S.TreeHeaderButtonWrapper>
        )}
      </S.TreeHeader>
      {!hasNodes && (
        <>
          <HiddenFileInput id="zip-upload-input" type="file" accept=".zip" onChange={handleZipFileInputChange} />
          <label htmlFor="zip-upload-input" style={{height: "100%", display: "flex", flexDirection: "column"}}>
            <S.EmptyTreeContainer
              $themeMode={theme}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={executeDropAndProcessResult}
              $isHovering={isHovering}
              onMouseOver={() => {
                if (!hasNodes) {
                  setIsHovering(true);
                }
              }}
              onMouseOut={() => {
                if (!hasNodes) {
                  setIsHovering(false);
                }
              }}
            >
              <S.EmptyMessageContainer $themeMode={theme}>
                <S.UploadGuide $themeMode={theme}>
                  <UploadIcon />
                  <p>여기를 클릭하거나 드래그&드롭을 통해</p>
                  <p>Zip 파일을 업로드하면</p>
                  <p>트리가 표시됩니다.</p>
                </S.UploadGuide>
              </S.EmptyMessageContainer>
            </S.EmptyTreeContainer>
          </label>
        </>
      )}
      {hasNodes && (
        <S.TreeScrollArea
          ref={treeScrollAreaRef}
          $themeMode={theme}
          $isHovering={isHovering}
          onMouseOver={() => {
            if (hasNodes) {
              setIsHovering(true);
            }
          }}
          onMouseOut={() => {
            if (hasNodes) {
              setIsHovering(false);
            }
          }}
        >
          {fileTree.map((node) => (
            <FileTreeNode
              key={node.id}
              node={node}
              depth={0}
              activeFilePath={activeFilePath}
              theme={theme}
              collapseAllSignal={collapseAllSignal}
              renamingTargetPath={renamingTargetPath}
              renameInitialName={renameInputValue}
              onRenameChange={setRenameInputValue}
              onRenameSubmit={handleRenameSubmit}
              onRenameCancel={handleRenameCancel}
            />
          ))}
        </S.TreeScrollArea>
      )}
      <CustomModal isOpen={isTreeAlertOpen} onClose={handleCloseZipAlert} message={treeErrMsg} />
    </S.TreeContainer>
  );
}

export {FileTree};
