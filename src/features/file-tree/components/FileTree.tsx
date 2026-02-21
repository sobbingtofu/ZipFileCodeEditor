"use client";

import {DragEvent, useMemo, useState} from "react";

import * as S from "@/src/features/file-tree/components/FileTree.styles";

import {FileTreeNode} from "./FileTreeNode";
import {useFileStore} from "@/src/store/useFileStore";
import {useEditorStore} from "@/src/store/useEditorStore";
import {CustomModal} from "@/src/features/custom-modal";
import {useHandleZipUpload} from "@/src/features/zip-handler";
import {CollapseIcon, UploadIcon} from "@/public/icon";
import {HiddenFileInput} from "@/app/page.styles";
import {useThemeStore} from "@/src/store/useThemeStore";

function FileTree() {
  const fileTree = useFileStore((state) => state.fileTree);
  const activeFilePath = useEditorStore((state) => state.activeFilePath);
  const hasNodes = useMemo(() => fileTree.length > 0, [fileTree]);
  const theme = useThemeStore((state) => state.theme);

  const [isHovering, setIsHovering] = useState(false);
  const [isZipAlertOpen, setIsZipAlertOpen] = useState(false);
  const [uploadErrMsg, setUploadErrMsg] = useState("");

  const {handleZipFileDrop, handleZipFileInputChange} = useHandleZipUpload();

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
      setUploadErrMsg(result.error || "알 수 없는 오류가 발생했습니다.");
      setIsZipAlertOpen(true);
    }
  };

  const handleCloseZipAlert = () => {
    setIsZipAlertOpen(false);
    setUploadErrMsg("");
  };

  return (
    <S.TreeContainer $themeMode={theme}>
      <S.TreeHeader $themeMode={theme}>
        <h3>파일 탐색기</h3>
        <S.CollapseAllFolderButton $themeMode={theme} aria-label="Collapse All" title="Collapse All Folders">
          <CollapseIcon />
        </S.CollapseAllFolderButton>
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
            <FileTreeNode key={node.id} node={node} depth={0} activeFilePath={activeFilePath} theme={theme} />
          ))}
        </S.TreeScrollArea>
      )}
      <CustomModal isOpen={isZipAlertOpen} onClose={handleCloseZipAlert} message={uploadErrMsg} />
    </S.TreeContainer>
  );
}

export {FileTree};
