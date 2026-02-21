import {useCallback, useState} from "react";

import {FileNode} from "@/src/types/fileType";
import {useFileStore} from "@/src/store/useFileStore";
import {useEditorStore} from "@/src/store/useEditorStore";

import {findNodeByPath} from "../logic/findNodeByPath";
import {appendFileNodeToTargetFolder, appendFolderNodeToTargetFolder, getParentPath} from "../logic/addFileFolderLogic";

interface UseAddFileFolderProps {
  fileTree: FileNode[];
  selectedFileFolderPath: string | null;
  onInvalidAddFileName: () => void;
  onOverlapFileName: () => void;
  onInvalidAddFolderName: () => void;
  onOverlapFolderName: () => void;
}

function useAddFileFolder({
  fileTree,
  selectedFileFolderPath,
  onInvalidAddFileName,
  onOverlapFileName,
  onInvalidAddFolderName,
  onOverlapFolderName,
}: UseAddFileFolderProps) {
  const setFileTree = useFileStore((state) => state.setFileTree);
  const triggerShowInTreeTargetPath = useFileStore((state) => state.triggerShowInTreeTargetPath);
  const openFileTab = useEditorStore((state) => state.openFileTab);
  const setActiveFilePath = useEditorStore((state) => state.setActiveFilePath);

  const [pendingAddFileTargetFolderPath, setPendingAddFileTargetFolderPath] = useState<string | null | undefined>(
    undefined,
  );
  const [pendingAddFileInputValue, setPendingAddFileInputValue] = useState("");
  const [pendingAddFolderTargetFolderPath, setPendingAddFolderTargetFolderPath] = useState<string | null | undefined>(
    undefined,
  );
  const [pendingAddFolderInputValue, setPendingAddFolderInputValue] = useState("");

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

  const handleAddFileCancel = useCallback(() => {
    setPendingAddFileTargetFolderPath(undefined);
    setPendingAddFileInputValue("");
  }, []);

  const handleAddFolderCancel = useCallback(() => {
    setPendingAddFolderTargetFolderPath(undefined);
    setPendingAddFolderInputValue("");
  }, []);

  const handleAddFileBtnClick = useCallback(() => {
    const targetFolderPath = getAddTargetFolderPath();

    if (targetFolderPath) {
      triggerShowInTreeTargetPath(targetFolderPath);
    }

    setPendingAddFileTargetFolderPath(targetFolderPath);
    setPendingAddFileInputValue("");
    handleAddFolderCancel();
  }, [getAddTargetFolderPath, handleAddFolderCancel, triggerShowInTreeTargetPath]);

  const handleAddFolderBtnClick = useCallback(() => {
    const targetFolderPath = getAddTargetFolderPath();

    if (targetFolderPath) {
      triggerShowInTreeTargetPath(targetFolderPath);
    }

    setPendingAddFolderTargetFolderPath(targetFolderPath);
    setPendingAddFolderInputValue("");
    handleAddFileCancel();
  }, [getAddTargetFolderPath, handleAddFileCancel, triggerShowInTreeTargetPath]);

  const handleAddFileSubmit = useCallback(() => {
    if (pendingAddFileTargetFolderPath === undefined) {
      return;
    }

    const nextInputName = pendingAddFileInputValue.trim();
    if (nextInputName === "") {
      handleAddFileCancel();
      return;
    }

    const targetSiblings = getAddTargetFolderSiblings(pendingAddFileTargetFolderPath);
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

    const nextFilePath = pendingAddFileTargetFolderPath
      ? `${pendingAddFileTargetFolderPath}/${nextInputName}`
      : nextInputName;

    const newFileNode: FileNode = {
      id: `node:${nextFilePath}`,
      name: nextInputName,
      type: "file",
      path: nextFilePath,
      content: "",
      isBinary: false,
      haveUnsavedChange: false,
    };

    const nextTree = appendFileNodeToTargetFolder(fileTree, pendingAddFileTargetFolderPath, newFileNode);
    setFileTree(nextTree);
    triggerShowInTreeTargetPath(nextFilePath);
    openFileTab(nextFilePath);
    handleAddFileCancel();
  }, [
    fileTree,
    getAddTargetFolderSiblings,
    handleAddFileCancel,
    onInvalidAddFileName,
    onOverlapFileName,
    openFileTab,
    pendingAddFileInputValue,
    pendingAddFileTargetFolderPath,
    setFileTree,
    triggerShowInTreeTargetPath,
  ]);

  const handleAddFolderSubmit = useCallback(() => {
    if (pendingAddFolderTargetFolderPath === undefined) {
      return;
    }

    const nextInputName = pendingAddFolderInputValue.trim();
    if (nextInputName === "") {
      handleAddFolderCancel();
      return;
    }

    const targetSiblings = getAddTargetFolderSiblings(pendingAddFolderTargetFolderPath);
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

    const nextFolderPath = pendingAddFolderTargetFolderPath
      ? `${pendingAddFolderTargetFolderPath}/${nextInputName}`
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

    const nextTree = appendFolderNodeToTargetFolder(fileTree, pendingAddFolderTargetFolderPath, newFolderNode);
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
    pendingAddFolderInputValue,
    pendingAddFolderTargetFolderPath,
    setActiveFilePath,
    setFileTree,
    triggerShowInTreeTargetPath,
  ]);

  return {
    pendingAddFileTargetFolderPath,
    pendingAddFileInputValue,
    setPendingAddFileInputValue,
    handleAddFileSubmit,
    handleAddFileCancel,
    handleAddFileBtnClick,
    pendingAddFolderTargetFolderPath,
    pendingAddFolderInputValue,
    setPendingAddFolderInputValue,
    handleAddFolderSubmit,
    handleAddFolderCancel,
    handleAddFolderBtnClick,
  };
}

export {useAddFileFolder};
