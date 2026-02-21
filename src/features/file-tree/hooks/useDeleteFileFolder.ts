import {RefObject, useCallback, useEffect, useMemo, useState} from "react";

import {FileNode} from "@/src/types/fileType";
import {useFileStore} from "@/src/store/useFileStore";
import {useEditorStore} from "@/src/store/useEditorStore";

import {findNodeByPath} from "../logic/findNodeByPath";
import {removeNodeByPath} from "../logic/deleteFileFolderLogic";
import useScrollTreeToTargetFile from "./useScrollTreeToTargetFile";

interface UseDeleteFileFolderProps {
  fileTree: FileNode[];
  selectedFileFolderPath: string | null;
  treeScrollAreaRef: RefObject<HTMLDivElement | null>;
}

function useDeleteFileFolder({fileTree, selectedFileFolderPath, treeScrollAreaRef}: UseDeleteFileFolderProps) {
  const setFileTree = useFileStore((state) => state.setFileTree);
  const removeOpenedFileFolderPathsByPrefix = useEditorStore((state) => state.removeOpenedFileFolderPathsByPrefix);

  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  const {scrollToTargetFile} = useScrollTreeToTargetFile(treeScrollAreaRef);

  const selectedNode = useMemo(() => {
    if (!selectedFileFolderPath) {
      return null;
    }

    return findNodeByPath(fileTree, selectedFileFolderPath);
  }, [fileTree, selectedFileFolderPath]);

  const deleteConfirmMessage = useMemo(() => {
    if (!selectedNode) {
      return "";
    }

    if (selectedNode.type === "folder") {
      return `"${selectedNode.name}" 폴더와\n그 하위의 모든 파일/폴더를 정말로 삭제하시겠습니까?\n삭제 후엔 되돌릴 수 없습니다.`;
    }

    return `"${selectedNode.name}" 파일을 정말로 삭제하시겠습니까?\n삭제 후엔 되돌릴 수 없습니다.`;
  }, [selectedNode]);

  const handleDeleteCancel = useCallback(() => {
    setIsDeleteConfirmOpen(false);
  }, []);

  const handleDeleteBtnClick = useCallback(() => {
    if (!selectedNode || !selectedFileFolderPath) {
      return;
    }

    scrollToTargetFile(selectedFileFolderPath);
    setIsDeleteConfirmOpen(true);
  }, [selectedNode, scrollToTargetFile, selectedFileFolderPath]);

  const handleDeleteConfirm = useCallback(() => {
    if (!selectedNode || !selectedFileFolderPath) {
      setIsDeleteConfirmOpen(false);
      return;
    }

    const nextTree = removeNodeByPath(fileTree, selectedNode.path);
    setFileTree(nextTree);
    removeOpenedFileFolderPathsByPrefix(selectedNode.path);
    setIsDeleteConfirmOpen(false);
  }, [fileTree, removeOpenedFileFolderPathsByPrefix, selectedNode, setFileTree]);

  // Delete 키보드 이벤트 삭제 핸들러 등록
  useEffect(() => {
    const handleDeleteKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Delete") {
        return;
      }

      const eventTarget = event.target as HTMLElement | null;
      const isTypingTarget =
        eventTarget instanceof HTMLInputElement ||
        eventTarget instanceof HTMLTextAreaElement ||
        eventTarget?.isContentEditable;

      if (isTypingTarget || !selectedNode || isDeleteConfirmOpen) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();
      setIsDeleteConfirmOpen(true);
    };

    window.addEventListener("keydown", handleDeleteKeyDown);

    return () => {
      window.removeEventListener("keydown", handleDeleteKeyDown);
    };
  }, [isDeleteConfirmOpen, selectedNode]);

  return {
    isDeleteConfirmOpen,
    deleteConfirmMessage,
    handleDeleteBtnClick,
    handleDeleteConfirm,
    handleDeleteCancel,
  };
}

export {useDeleteFileFolder};
