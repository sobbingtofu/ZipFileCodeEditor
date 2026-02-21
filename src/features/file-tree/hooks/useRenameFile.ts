import {RefObject, useCallback, useEffect, useState} from "react";
import {useFileStore} from "@/src/store/useFileStore";
import {FileNode} from "@/src/types/fileType";
import {buildRenamedFilePath, updateTargetFileNodeInTree} from "../logic/renameFileLogic";
import {useEditorStore} from "@/src/store/useEditorStore";
import useScrollTreeToTargetFile from "./useScrollTreeToTargetFile";
import {findNodeByPath} from "../logic/treeHandlingLogic";

interface UseRenameFileProps {
  treeScrollAreaRef: RefObject<HTMLDivElement | null>;
  fileTree: FileNode[];
  selectedFileFolderPath: string | null;
  onInvalidRenameName: () => void;
}

function useRenameFile({treeScrollAreaRef, fileTree, selectedFileFolderPath, onInvalidRenameName}: UseRenameFileProps) {
  const {scrollToTargetFile} = useScrollTreeToTargetFile(treeScrollAreaRef);

  // 이름 변경 대상 파일의 경로 관리용 상태. null이면 이름 변경 모드가 아님을 의미
  const [renamingTargetPath, setRenamingTargetPath] = useState<string | null>(null);

  // 입력 필드의 값 관리용 상태
  const [renameInputValue, setRenameInputValue] = useState("");

  const setFileTree = useFileStore((state) => state.setFileTree);
  const triggerShowInTreeTargetPath = useFileStore((state) => state.triggerShowInTreeTargetPath);
  const replaceOpenedFilePath = useEditorStore((state) => state.replaceOpenedFilePath);

  /**
   * 이름 변경 모드 취소 핸들러
   */
  const handleRenameCancel = useCallback(() => {
    setRenamingTargetPath(null);
    setRenameInputValue("");
  }, []);

  /**
   * 이름 변경 제출 핸들러
   */
  const handleRenameSubmit = useCallback(() => {
    if (!renamingTargetPath) {
      return;
    }

    const originalNode = findNodeByPath(fileTree, renamingTargetPath);

    if (!originalNode) {
      handleRenameCancel();
      return;
    }

    const nextName = renameInputValue.trim();

    // 사용자가 입력한 이름 검증
    if (!nextName || nextName === originalNode.name) {
      handleRenameCancel();
      return;
    }

    // 파일 이름에 사용할 수 없는 문자 검사
    if (nextName.includes("/") || nextName.includes("\\")) {
      onInvalidRenameName();
      return;
    }

    const nextPath = buildRenamedFilePath(renamingTargetPath, nextName);
    const renamedTree = updateTargetFileNodeInTree(fileTree, renamingTargetPath, nextName, nextPath);

    setFileTree(renamedTree);
    replaceOpenedFilePath(renamingTargetPath, nextPath);
    triggerShowInTreeTargetPath(nextPath);
    handleRenameCancel();
  }, [
    fileTree,
    handleRenameCancel,
    renameInputValue,
    renamingTargetPath,
    replaceOpenedFilePath,
    setFileTree,
    triggerShowInTreeTargetPath,
    onInvalidRenameName,
  ]);

  const handleRenameBtnClick = useCallback(() => {
    if (!selectedFileFolderPath) {
      return;
    }

    if (renamingTargetPath) {
      // 이미 이름 변경 모드인 파일이 다시 클릭된 경우 >> 이름 변경 모드 종료
      handleRenameCancel();
      return;
    }

    const activeNode = findNodeByPath(fileTree, selectedFileFolderPath);

    if (!activeNode) {
      return;
    }

    triggerShowInTreeTargetPath(selectedFileFolderPath);
    scrollToTargetFile(selectedFileFolderPath);

    setRenamingTargetPath(selectedFileFolderPath);
    setRenameInputValue(activeNode.name);
  }, [
    fileTree,
    renamingTargetPath,
    selectedFileFolderPath,
    handleRenameCancel,
    scrollToTargetFile,
    triggerShowInTreeTargetPath,
  ]);

  // F2 키를 누르면 이름 변경 모드 진입 & submit 처리
  useEffect(() => {
    const handleF2KeyDown = (event: KeyboardEvent) => {
      if (event.key !== "F2") {
        return;
      }

      if (!selectedFileFolderPath) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();

      if (renamingTargetPath) {
        handleRenameSubmit();
        return;
      }

      handleRenameBtnClick();
    };

    window.addEventListener("keydown", handleF2KeyDown);

    return () => {
      window.removeEventListener("keydown", handleF2KeyDown);
    };
  }, [handleRenameBtnClick, handleRenameSubmit, renamingTargetPath, selectedFileFolderPath]);

  return {
    renamingTargetPath,
    renameInputValue,
    setRenameInputValue,
    handleRenameSubmit,
    handleRenameCancel,
    handleRenameBtnClick,
  };
}

export {useRenameFile};
