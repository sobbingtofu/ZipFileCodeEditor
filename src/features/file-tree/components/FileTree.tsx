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

  const {handleZipFileDrop} = useHandleZipUpload();

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
    <S.TreeContainer>
      <S.TreeHeader>파일 탐색기</S.TreeHeader>
      {!hasNodes && (
        <S.EmptyTreeContainer
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
          <S.EmptyMessageContainer>
            <div style={{display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", color: "#6e6e6e"}}>
              <UploadIcon />
              <p>Zip 업로드 버튼을 클릭하거나 </p>
              <p>여기에 Zip 파일을 드래그&드롭하면</p>
              <p>트리가 표시됩니다.</p>
            </div>
          </S.EmptyMessageContainer>
        </S.EmptyTreeContainer>
      )}
      {hasNodes && (
        <S.TreeScrollArea
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
