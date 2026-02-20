"use client";

import {DragEvent, useMemo, useState} from "react";

import * as S from "@/src/features/file-tree/components/FileTree.styles";

import {FileTreeNode} from "./FileTreeNode";
import {useFileStore} from "@/src/store/useFileStore";
import {useEditorStore} from "@/src/store/useEditorStore";
import {ZipAlertModal} from "@/src/features/custom-modal";
import {useHandleZipUpload} from "@/src/features/zip-handler";
import {UploadIcon} from "./UploadIcon";

function FileTree() {
  const fileTree = useFileStore((state) => state.fileTree);
  const activeFilePath = useEditorStore((state) => state.activeFilePath);
  const hasNodes = useMemo(() => fileTree.length > 0, [fileTree]);

  const [isHovering, setIsHovering] = useState(false);
  const [isZipAlertOpen, setIsZipAlertOpen] = useState(false);
  const [uploadErrMsg, setUploadErrMsg] = useState("");

  const {handleZipFileUpload} = useHandleZipUpload();

  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "copy";
  };

  const handleDragLeave = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const handleDrop = async (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();

    const droppedFile = event.dataTransfer.files?.[0];
    if (!droppedFile) {
      return;
    }

    const isUploaded = await handleZipFileUpload(droppedFile);
    if (!isUploaded.success) {
      setUploadErrMsg(isUploaded.error ?? "Zip 파일 업로드 중 오류가 발생했습니다.");
      setIsZipAlertOpen(true);
    }
  };

  const handleCloseZipAlert = () => {
    setIsZipAlertOpen(false);
    setUploadErrMsg("");
  };

  return (
    <S.TreeContainer>
      <S.TreeHeader>파일 탐색기</S.TreeHeader>
      {!hasNodes && (
        <S.EmptyTreeContainer
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
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
          <S.EmptyMessageContainer>
            <UploadIcon />
            <p>Zip 업로드 버튼을 클릭하거나 </p>
            <p>여기에 Zip 파일을 드래그&드롭하면</p>
            <p>트리가 표시됩니다.</p>
          </S.EmptyMessageContainer>
        </S.EmptyTreeContainer>
      )}
      {hasNodes && (
        <S.TreeScrollArea
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
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
            <FileTreeNode key={node.id} node={node} depth={0} activeFilePath={activeFilePath} />
          ))}
        </S.TreeScrollArea>
      )}
      <ZipAlertModal isOpen={isZipAlertOpen} onClose={handleCloseZipAlert} errorMessage={uploadErrMsg} />
    </S.TreeContainer>
  );
}

export {FileTree};
