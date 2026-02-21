import {useCallback, useState} from "react";

import {FileNode} from "@/src/types/fileType";
import {useFileStore} from "@/src/store/useFileStore";
import {useEditorStore} from "@/src/store/useEditorStore";

import {appendFileNodeToTargetFolder, appendFolderNodeToTargetFolder, getParentPath} from "../logic/addFileFolderLogic";
import {getNodeByPathFromIndex} from "../logic/treeHandlingLogic";
import {getIsEditableTextFile} from "../../zip-handler";
import useScrollTreeToTargetFile from "./useScrollTreeToTargetFile";

interface UseAddFileFolderProps {
  fileTree: FileNode[];
  selectedFileFolderPath: string | null;
  onInvalidAddFileName: () => void;
  onOverlapFileName: () => void;
  onInvalidAddFolderName: () => void;
  onOverlapFolderName: () => void;
  treeScrollAreaRef: React.RefObject<HTMLDivElement | null>;
}

function useAddFileFolder({
  fileTree,
  selectedFileFolderPath,
  onInvalidAddFileName,
  onOverlapFileName,
  onInvalidAddFolderName,
  onOverlapFolderName,
  treeScrollAreaRef,
}: UseAddFileFolderProps) {
  const setFileTree = useFileStore((state) => state.setFileTree);
  const fileTreeIndex = useFileStore((state) => state.fileTreeIndex);
  const triggerShowInTreeTargetPath = useFileStore((state) => state.triggerShowInTreeTargetPath);
  const openFileTab = useEditorStore((state) => state.openFileTab);
  const setActiveFilePath = useEditorStore((state) => state.setActiveFilePath);

  const {scrollToTargetFile} = useScrollTreeToTargetFile(treeScrollAreaRef);

  const [pendingAddTargetFolderPath, setpendingAddTargetFolderPath] = useState<string | null | undefined>(undefined);
  const [pendingAddInputValue, setPendingAddInputValue] = useState("");
  const [pendingAddFolderTargetFolderPath, setPendingAddFolderTargetFolderPath] = useState<string | null | undefined>(
    undefined,
  );
  const [pendingAddFolderInputValue, setPendingAddFolderInputValue] = useState("");

  const getAddTargetFolderPath = useCallback((): string | null => {
    const selectedNode = selectedFileFolderPath ? getNodeByPathFromIndex(fileTreeIndex, selectedFileFolderPath) : null;

    if (!selectedNode) {
      return null;
    }

    return selectedNode.type === "folder" ? selectedNode.path : getParentPath(selectedNode.path);
  }, [fileTreeIndex, selectedFileFolderPath]);

  const getAddTargetFolderSiblings = useCallback(
    (targetFolderPath: string | null): FileNode[] => {
      if (!targetFolderPath) {
        return fileTree;
      }

      const targetFolderNode = getNodeByPathFromIndex(fileTreeIndex, targetFolderPath);
      return targetFolderNode?.type === "folder" ? (targetFolderNode.children ?? []) : fileTree;
    },
    [fileTree, fileTreeIndex],
  );

  const handleAddFileCancel = useCallback(() => {
    setpendingAddTargetFolderPath(undefined);
    setPendingAddInputValue("");
  }, []);

  const handleAddFolderCancel = useCallback(() => {
    setPendingAddFolderTargetFolderPath(undefined);
    setPendingAddFolderInputValue("");
  }, []);

  const handleAddFileBtnClick = useCallback(() => {
    const targetFolderPath = getAddTargetFolderPath();

    if (targetFolderPath) {
      triggerShowInTreeTargetPath(targetFolderPath);
      scrollToTargetFile(targetFolderPath);
    }

    setpendingAddTargetFolderPath(targetFolderPath);
    setPendingAddInputValue("");
    handleAddFolderCancel();
  }, [getAddTargetFolderPath, handleAddFolderCancel, triggerShowInTreeTargetPath]);

  const handleAddFolderBtnClick = useCallback(() => {
    const targetFolderPath = getAddTargetFolderPath();

    if (targetFolderPath) {
      triggerShowInTreeTargetPath(targetFolderPath);
      scrollToTargetFile(targetFolderPath);
    }

    setPendingAddFolderTargetFolderPath(targetFolderPath);
    setPendingAddFolderInputValue("");
    handleAddFileCancel();
  }, [getAddTargetFolderPath, handleAddFileCancel, triggerShowInTreeTargetPath]);

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

    const isEditableText = getIsEditableTextFile(nextFilePath);

    const newFileNode: FileNode = {
      id: `node:${nextFilePath}`,
      name: nextInputName,
      type: "file",
      path: nextFilePath,
      content: "",
      isBinary: false,
      isEditableText: isEditableText,
      haveUnsavedChange: false,
    };

    const nextTree = appendFileNodeToTargetFolder(fileTree, pendingAddTargetFolderPath, newFileNode);
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
    pendingAddInputValue,
    pendingAddTargetFolderPath,
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
  };
}

export {useAddFileFolder};
