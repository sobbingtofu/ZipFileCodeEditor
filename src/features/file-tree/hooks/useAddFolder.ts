import {useCallback, useState} from "react";

import {FileNode} from "@/src/types/fileType";
import {useFileStore} from "@/src/store/useFileStore";
import {useEditorStore} from "@/src/store/useEditorStore";

import {findNodeByPath} from "../logic/findNodeByPath";
import {appendFolderNodeToTargetFolder, getParentPath} from "../logic/addFileFolderLogic";

interface UseAddFolderProps {
  fileTree: FileNode[];
  selectedFileFolderPath: string | null;
  onInvalidAddFolderName: () => void;
  onOverlapFolderName: () => void;
}

function useAddFolder({
  fileTree,
  selectedFileFolderPath,
  onInvalidAddFolderName,
  onOverlapFolderName,
}: UseAddFolderProps) {
  const setFileTree = useFileStore((state) => state.setFileTree);
  const triggerShowInTreeTargetPath = useFileStore((state) => state.triggerShowInTreeTargetPath);
  const setActiveFilePath = useEditorStore((state) => state.setActiveFilePath);

  const [pendingAddTargetFolderPath, setPendingAddTargetFolderPath] = useState<string | null | undefined>(undefined);
  const [pendingAddInputValue, setPendingAddInputValue] = useState("");

  const getAddTargetFolderPath = useCallback((): string | null => {
    const selectedNode = selectedFileFolderPath ? findNodeByPath(fileTree, selectedFileFolderPath) : null;

    if (!selectedNode) {
      return null;
    }

    return selectedNode.type === "folder" ? selectedNode.path : getParentPath(selectedNode.path);
  }, [fileTree, selectedFileFolderPath]);

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

  const handleAddFolderCancel = useCallback(() => {
    setPendingAddTargetFolderPath(undefined);
    setPendingAddInputValue("");
  }, []);

  const handleAddFolderBtnClick = useCallback(() => {
    const targetFolderPath = getAddTargetFolderPath();

    if (targetFolderPath) {
      triggerShowInTreeTargetPath(targetFolderPath);
    }

    setPendingAddTargetFolderPath(targetFolderPath);
    setPendingAddInputValue("");
  }, [getAddTargetFolderPath, triggerShowInTreeTargetPath]);

  const handleAddFolderSubmit = useCallback(() => {
    if (pendingAddTargetFolderPath === undefined) {
      return;
    }

    const nextInputName = pendingAddInputValue.trim();
    if (nextInputName === "") {
      handleAddFolderCancel();
      return;
    }

    const targetSiblings = getAddTargetFolderSiblings(pendingAddTargetFolderPath);
    if (targetSiblings.some((node) => node.name === nextInputName)) {
      onOverlapFolderName();
      handleAddFolderCancel();
      return;
    }

    if (nextInputName.includes("/") || nextInputName.includes("\\")) {
      onInvalidAddFolderName();
      handleAddFolderCancel();
      return;
    }

    const nextFolderPath = pendingAddTargetFolderPath
      ? `${pendingAddTargetFolderPath}/${nextInputName}`
      : nextInputName;

    const newFolderNode: FileNode = {
      id: `node:${nextFolderPath}`,
      name: nextInputName,
      type: "folder",
      path: nextFolderPath,
      children: [],
      isBinary: false,
      haveUnsavedChange: false,
    };

    const nextTree = appendFolderNodeToTargetFolder(fileTree, pendingAddTargetFolderPath, newFolderNode);
    setFileTree(nextTree);
    triggerShowInTreeTargetPath(nextFolderPath);
    setActiveFilePath(nextFolderPath);
    handleAddFolderCancel();
  }, [
    fileTree,
    getAddTargetFolderSiblings,
    handleAddFolderCancel,
    onInvalidAddFolderName,
    onOverlapFolderName,
    pendingAddInputValue,
    pendingAddTargetFolderPath,
    setActiveFilePath,
    setFileTree,
    triggerShowInTreeTargetPath,
  ]);

  return {
    pendingAddTargetFolderPath,
    pendingAddInputValue,
    setPendingAddInputValue,
    handleAddFolderSubmit,
    handleAddFolderCancel,
    handleAddFolderBtnClick,
  };
}

export {useAddFolder};
