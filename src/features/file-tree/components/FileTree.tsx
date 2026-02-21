"use client";

import {DragEvent, KeyboardEvent, MouseEvent, useEffect, useMemo, useRef, useState} from "react";

import * as S from "@/src/features/file-tree/components/FileTree.styles";

import {FileTreeNode} from "./FileTreeNode";
import {useFileStore} from "@/src/store/useFileStore";
import {useEditorStore} from "@/src/store/useEditorStore";
import {CustomModal} from "@/src/features/custom-modal";
import {useHandleZipUpload} from "@/src/features/zip-handler";
import {AddFileIcon, AddFolderIcon, CollapseIcon, DeleteIcon, RenameIcon, UploadIcon} from "@/public/icon";
import {HiddenFileInput} from "@/app/page.styles";
import {useThemeStore} from "@/src/store/useThemeStore";
import {useRenameFile} from "../hooks/useRenameFile";
import {useAddFileFolder} from "../hooks/useAddFileFolder";
import {useDeleteFileFolder} from "../hooks/useDeleteFileFolder";

function FileTree() {
  const fileTree = useFileStore((state) => state.fileTree);
  const selectedFileFolderPath = useEditorStore((state) => state.selectedFileFolderPath);
  const setActiveFilePath = useEditorStore((state) => state.setActiveFilePath);
  const hasNodes = useMemo(() => fileTree.length > 0, [fileTree]);
  const theme = useThemeStore((state) => state.theme);
  const treeScrollAreaRef = useRef<HTMLDivElement | null>(null);
  const pendingRootAddInputRef = useRef<HTMLInputElement | null>(null);
  const pendingRootAddFolderInputRef = useRef<HTMLInputElement | null>(null);

  const [isHovering, setIsHovering] = useState(false);
  const [isTreeAlertOpen, setIsTreeAlertOpen] = useState(false);
  const [treeErrMsg, setTreeErrMsg] = useState("");

  const [collapseAllSignal, setCollapseAllSignal] = useState(0);

  const {handleZipFileDrop, handleZipFileInputChange} = useHandleZipUpload();

  // 파일/폴더 커스텀 훅 설정
  const {
    pendingAddTargetFolderPath,
    pendingAddInputValue,
    setPendingAddInputValue,
    handleAddFileSubmit,
    handleAddFileCancel,
    handleAddFileBtnClick,
    pendingAddFolderTargetFolderPath,
    pendingAddFolderInputValue,
    setPendingAddFolderInputValue,
    handleAddFolderSubmit,
    handleAddFolderCancel,
    handleAddFolderBtnClick,
  } = useAddFileFolder({
    fileTree,
    selectedFileFolderPath,
    onInvalidAddFileName: () => {
      setTreeErrMsg("파일 이름에는 특수문자 /와 \\를 사용할 수 없습니다.");
      setIsTreeAlertOpen(true);
    },
    onOverlapFileName: () => {
      setTreeErrMsg("같은 이름의 파일이 이미 존재합니다.");
      setIsTreeAlertOpen(true);
    },
    onInvalidAddFolderName: () => {
      setTreeErrMsg("폴더 이름에는 특수문자 /와 \\를 사용할 수 없습니다.");
      setIsTreeAlertOpen(true);
    },
    onOverlapFolderName: () => {
      setTreeErrMsg("같은 이름의 폴더가 이미 존재합니다.");
      setIsTreeAlertOpen(true);
    },
  });

  // 파일/폴더 이름 변경 커스텀 훅 설정
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
    selectedFileFolderPath,
    onInvalidRenameName: () => {
      setTreeErrMsg("파일 이름에는 특수문자 /와 \\를 사용할 수 없습니다.");
      setIsTreeAlertOpen(true);
      handleRenameCancel();
    },
  });

  // 파일/폴더 삭제 커스텀 훅 설정
  const {isDeleteConfirmOpen, deleteConfirmMessage, handleDeleteBtnClick, handleDeleteConfirm, handleDeleteCancel} =
    useDeleteFileFolder({
      fileTree,
      selectedFileFolderPath,
      treeScrollAreaRef,
    });

  // 트리에 ZIP 파일 드래그&드롭 추가 관련
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

  const handleCloseTreeAlert = () => {
    setIsTreeAlertOpen(false);
    setTreeErrMsg("");
  };

  const handleCollapseAllFolders = () => {
    setCollapseAllSignal((prev) => prev + 1);
  };

  const handleTreeScrollAreaClick = (event: MouseEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget) {
      return;
    }

    setActiveFilePath(null);
  };

  // pendingAddTargetFolderPath가 null (root 위치에 파일/폴더추가하는 경우)
  useEffect(() => {
    if (pendingAddTargetFolderPath !== null || !pendingRootAddInputRef.current) {
      return;
    }

    pendingRootAddInputRef.current.focus();
  }, [pendingAddTargetFolderPath]);

  useEffect(() => {
    if (pendingAddFolderTargetFolderPath !== null || !pendingRootAddFolderInputRef.current) {
      return;
    }

    pendingRootAddFolderInputRef.current.focus();
  }, [pendingAddFolderTargetFolderPath]);

  const handlePendingAddInputKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handleAddFileSubmit();
      return;
    }

    if (event.key === "Escape") {
      event.preventDefault();
      handleAddFileCancel();
    }
  };

  const handlePendingAddFolderInputKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handleAddFolderSubmit();
      return;
    }

    if (event.key === "Escape") {
      event.preventDefault();
      handleAddFolderCancel();
    }
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
              title="Rename / F2"
              onMouseDown={(event) => {
                event.preventDefault();
              }}
              onClick={handleRenameBtnClick}
            >
              <RenameIcon />
            </S.TreeHeaderButton>

            {/* 삭제 */}
            <S.TreeHeaderButton
              $themeMode={theme}
              aria-label="Delete"
              title="Delete / Del"
              onClick={handleDeleteBtnClick}
            >
              <DeleteIcon />
            </S.TreeHeaderButton>

            {/* 파일 추가 */}
            <S.TreeHeaderButton
              $themeMode={theme}
              aria-label="Add File"
              title="Add File"
              onClick={handleAddFileBtnClick}
            >
              <AddFileIcon />
            </S.TreeHeaderButton>

            {/* 폴더 추가 */}
            <S.TreeHeaderButton
              $themeMode={theme}
              aria-label="Add Folder"
              title="Add Folder"
              onClick={handleAddFolderBtnClick}
            >
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
          onClick={handleTreeScrollAreaClick}
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
              selectedFileFolderPath={selectedFileFolderPath}
              theme={theme}
              collapseAllSignal={collapseAllSignal}
              renamingTargetPath={renamingTargetPath}
              renameInitialName={renameInputValue}
              onRenameChange={setRenameInputValue}
              onRenameSubmit={handleRenameSubmit}
              onRenameCancel={handleRenameCancel}
              addFileTargetFolderPath={pendingAddTargetFolderPath}
              pendingAddFileInputValue={pendingAddInputValue}
              setPendingAddFileInputValue={setPendingAddInputValue}
              handleAddFileSubmit={handleAddFileSubmit}
              handleAddFileCancel={handleAddFileCancel}
              addFolderTargetFolderPath={pendingAddFolderTargetFolderPath}
              pendingAddFolderInputValue={pendingAddFolderInputValue}
              setPendingAddFolderInputValue={setPendingAddFolderInputValue}
              handleAddFolderSubmit={handleAddFolderSubmit}
              handleAddFolderCancel={handleAddFolderCancel}
            />
          ))}

          {pendingAddTargetFolderPath === null && (
            <S.TreeNodeDiv $depth={0} $isActive={false} $themeMode={theme}>
              <S.FolderPrefix>📄</S.FolderPrefix>
              <S.RenameInputWrapper onClick={(event) => event.stopPropagation()}>
                <S.RenameInput
                  ref={pendingRootAddInputRef}
                  $themeMode={theme}
                  value={pendingAddInputValue}
                  onChange={(event) => setPendingAddInputValue(event.target.value)}
                  onBlur={handleAddFileSubmit}
                  onKeyDown={handlePendingAddInputKeyDown}
                />
              </S.RenameInputWrapper>
            </S.TreeNodeDiv>
          )}

          {pendingAddFolderTargetFolderPath === null && (
            <S.TreeNodeDiv $depth={0} $isActive={false} $themeMode={theme}>
              <S.FolderPrefix>📁</S.FolderPrefix>
              <S.RenameInputWrapper onClick={(event) => event.stopPropagation()}>
                <S.RenameInput
                  ref={pendingRootAddFolderInputRef}
                  $themeMode={theme}
                  value={pendingAddFolderInputValue}
                  onChange={(event) => setPendingAddFolderInputValue(event.target.value)}
                  onBlur={handleAddFolderSubmit}
                  onKeyDown={handlePendingAddFolderInputKeyDown}
                />
              </S.RenameInputWrapper>
            </S.TreeNodeDiv>
          )}
        </S.TreeScrollArea>
      )}
      <CustomModal isOpen={isTreeAlertOpen} onClose={handleCloseTreeAlert} message={treeErrMsg} />
      <CustomModal
        modalType="confirm"
        isOpen={isDeleteConfirmOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        message={deleteConfirmMessage}
      />
    </S.TreeContainer>
  );
}

export {FileTree};
