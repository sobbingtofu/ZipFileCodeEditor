import {useCallback, useState} from "react";

import {FileNode} from "@/src/types/fileType";
import {useFileStore} from "@/src/store/useFileStore";
import {useEditorStore} from "@/src/store/useEditorStore";

import {findNodeByPath} from "../logic/findNodeByPath";
import {appendFileNodeToTargetFolder, buildUniqueFileName, getParentPath} from "../logic/addFileFolderLogic";

interface UseAddFileProps {
  fileTree: FileNode[];
  selectedFileFolderPath: string | null;
  onInvalidAddFileName: () => void;
  onOverlapFileName: () => void;
}

function useAddFile({fileTree, selectedFileFolderPath, onInvalidAddFileName, onOverlapFileName}: UseAddFileProps) {
  const setFileTree = useFileStore((state) => state.setFileTree);
  const triggerShowInTreeTargetPath = useFileStore((state) => state.triggerShowInTreeTargetPath);
  const openFileTab = useEditorStore((state) => state.openFileTab);

  const [pendingAddTargetFolderPath, setPendingAddTargetFolderPath] = useState<string | null | undefined>(undefined);
  const [pendingAddInputValue, setPendingAddInputValue] = useState("");

  /**
   * 새 파일 추가 대상 폴더 경로를 반환하는 함수
   */
  const getAddTargetFolderPath = useCallback((): string | null => {
    const selectedNode = selectedFileFolderPath ? findNodeByPath(fileTree, selectedFileFolderPath) : null;

    if (!selectedNode) {
      return null;
    }

    return selectedNode.type === "folder" ? selectedNode.path : getParentPath(selectedNode.path);
  }, [fileTree, selectedFileFolderPath]);

  /**
   * 새 파일 노드를 추가할 대상 폴더의 자식 노드 배열을 반환하는 함수
   */
  const getAddTargetFolderSiblings = useCallback(
    (targetFolderPath: string | null): FileNode[] => {
      if (!targetFolderPath) {
        return fileTree;
      }

      const targetFolderNode = findNodeByPath(fileTree, targetFolderPath);
      return targetFolderNode?.type === "folder" ? (targetFolderNode.children ?? []) : fileTree;
    },
    [fileTree],
  );

  const handleAddFileCancel = useCallback(() => {
    setPendingAddTargetFolderPath(undefined);
    setPendingAddInputValue("");
  }, []);

  const handleAddFileBtnClick = useCallback(() => {
    const targetFolderPath = getAddTargetFolderPath();

    if (targetFolderPath) {
      triggerShowInTreeTargetPath(targetFolderPath);
    }

    setPendingAddTargetFolderPath(targetFolderPath);
    setPendingAddInputValue("");
  }, [getAddTargetFolderPath, triggerShowInTreeTargetPath]);

  const handleAddFileSubmit = useCallback(() => {
    if (pendingAddTargetFolderPath === undefined) {
      return;
    }
    const nextInputName = pendingAddInputValue.trim();
    if (nextInputName === "") {
      handleAddFileCancel();
      return;
    }

    const targetSiblings = getAddTargetFolderSiblings(pendingAddTargetFolderPath);

    if (targetSiblings.some((node) => node.name === nextInputName)) {
      onOverlapFileName();
      handleAddFileCancel();
      return;
    }

    if (nextInputName.includes("/") || nextInputName.includes("\\")) {
      onInvalidAddFileName();
      handleAddFileCancel();
      return;
    }

    const nextFilePath = pendingAddTargetFolderPath ? `${pendingAddTargetFolderPath}/${nextInputName}` : nextInputName;

    const newFileNode: FileNode = {
      id: `node:${nextFilePath}`,
      name: nextInputName,
      type: "file",
      path: nextFilePath,
      content: "",
      isBinary: false,
      haveUnsavedChange: false,
    };

    const nextTree = appendFileNodeToTargetFolder(fileTree, pendingAddTargetFolderPath, newFileNode);

    setFileTree(nextTree);
    triggerShowInTreeTargetPath(nextFilePath);
    openFileTab(nextFilePath);
    handleAddFileCancel();
  }, [
    fileTree,
    handleAddFileCancel,
    onInvalidAddFileName,
    onOverlapFileName,
    openFileTab,
    pendingAddInputValue,
    pendingAddTargetFolderPath,
    getAddTargetFolderSiblings,
    setFileTree,
    triggerShowInTreeTargetPath,
  ]);

  return {
    pendingAddTargetFolderPath,
    pendingAddInputValue,
    setPendingAddInputValue,
    handleAddFileSubmit,
    handleAddFileCancel,
    handleAddFileBtnClick,
  };
}

export {useAddFile};
