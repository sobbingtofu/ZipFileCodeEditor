import {useFileStore} from "@/src/store/useFileStore";
import {isZipFile, parseZipFileToTree} from "../logic/zipService";
import {useEditorStore} from "@/src/store/useEditorStore";

import {ChangeEvent, DragEvent} from "react";
import {FileNode} from "@/src/types/fileType";

function useHandleZipUpload() {
  const setFileTree = useFileStore((state) => state.setFileTree);
  const setIsLoading = useFileStore((state) => state.setIsLoading);
  const openFileTab = useEditorStore((state) => state.openFileTab);
  const resetEditorState = useEditorStore((state) => state.resetEditorState);

  const findFirstFileNode = (nodes: FileNode[]): FileNode | null => {
    for (const node of nodes) {
      if (node.type === "file") {
        return node;
      }

      if (node.type === "folder" && node.children) {
        const foundFileNode = findFirstFileNode(node.children);
        if (foundFileNode) {
          return foundFileNode;
        }
      }
    }

    return null;
  };
  /** Zip 업로드 후 트리 초기화 & 첫 파일 자동 오픈 */
  const handleZipFileUpload = async (uploadedFile: File): Promise<{success: boolean; error: string | null}> => {
    try {
      if (!isZipFile(uploadedFile)) {
        const errorMsg = "업로드된 파일이 Zip 형식이 아닙니다.";
        console.error(errorMsg);
        return {success: false, error: errorMsg};
      }

      setIsLoading(true);

      const parsedTree = await parseZipFileToTree(uploadedFile);
      setFileTree(parsedTree);
      resetEditorState();

      const firstFileNode = findFirstFileNode(parsedTree);
      if (firstFileNode) {
        openFileTab(firstFileNode.path);
      }
      return {success: true, error: null};
    } finally {
      setIsLoading(false);
    }
  };

  const handleZipFileInputChange = async (event: ChangeEvent<HTMLInputElement, HTMLInputElement>) => {
    const uploadedFile = event.target.files?.[0];
    if (!uploadedFile) {
      return;
    }
    try {
      await handleZipFileUpload(uploadedFile);
    } finally {
      // 재업로드 안정성 보장
      event.target.value = "";
    }
  };

  const handleZipFileDrop = async (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();

    const droppedFile = event.dataTransfer.files?.[0];
    if (!droppedFile) {
      return;
    }

    const uploadResult = await handleZipFileUpload(droppedFile);
    return uploadResult;
  };

  return {
    handleZipFileUpload,
    handleZipFileInputChange,
    handleZipFileDrop,
  };
}

export {useHandleZipUpload};
