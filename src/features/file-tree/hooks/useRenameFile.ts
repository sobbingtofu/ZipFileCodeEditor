import {RefObject, useCallback, useState} from "react";
import {findNodeByPath} from "../logic/findNodeByPath";
import {useFileStore} from "@/src/store/useFileStore";
import {FileNode} from "@/src/types/fileType";
import {buildRenamedFilePath, updateTargetFileNodeInTree} from "../logic/renameFileLogic";
import {useEditorStore} from "@/src/store/useEditorStore";

interface UseRenameFileProps {
  treeScrollAreaRef: RefObject<HTMLDivElement | null>;
  fileTree: FileNode[];
  selectedFileFolderPath: string | null;
  onInvalidRenameName: () => void;
}

function useRenameFile({treeScrollAreaRef, fileTree, selectedFileFolderPath, onInvalidRenameName}: UseRenameFileProps) {
  // 이름 변경 대상 파일의 경로 관리용 상태. null이면 이름 변경 모드가 아님을 의미
  const [renamingTargetPath, setRenamingTargetPath] = useState<string | null>(null);

  // 입력 필드의 값 관리용 상태
  const [renameInputValue, setRenameInputValue] = useState("");

  const setFileTree = useFileStore((state) => state.setFileTree);
  const triggerShowInTreeTargetPath = useFileStore((state) => state.triggerShowInTreeTargetPath);
  const replaceOpenedFilePath = useEditorStore((state) => state.replaceOpenedFilePath);

  /**
   * 이름 변경 모드 진입 시, 해당 파일이 보이는 위치로 스크롤을 이동시키는 함수
   * - 트리 전체를 탐색하여 이름 변경 대상 파일의 DOM 요소를 찾은 뒤, 해당 요소가 트리 컨테이너 안에서 완전히 보이는지 검사
   * - 완전히 보이지 않는 경우, scrollIntoView 메서드를 사용하여 스크롤을 이동시킴
   */
  const scrollToRenamingFile = useCallback(
    (targetPath: string) => {
      const container = treeScrollAreaRef.current;
      if (!container) {
        return;
      }

      const nodeElements = container.querySelectorAll<HTMLElement>("[data-file-path]");
      const targetElement = [...nodeElements].find((element) => element.getAttribute("data-file-path") === targetPath);
      if (!targetElement) {
        return;
      }

      const containerRect = container.getBoundingClientRect();
      const targetRect = targetElement.getBoundingClientRect();
      const isFullyVisible = targetRect.top >= containerRect.top && targetRect.bottom <= containerRect.bottom;
      if (isFullyVisible) {
        return;
      }

      targetElement.scrollIntoView({block: "nearest"});
    },
    [treeScrollAreaRef],
  );

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

  const handleRenameBtnClick = () => {
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
    scrollToRenamingFile(selectedFileFolderPath);

    setRenamingTargetPath(selectedFileFolderPath);
    setRenameInputValue(activeNode.name);
  };

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
