import {FileNode} from "@/src/types/fileType";
import {KeyboardEvent, memo, useEffect, useRef, useState} from "react";

import * as S from "@/src/features/file-tree/components/FileTree.styles";
import {useEditorStore} from "@/src/store/useEditorStore";
import {useFileStore} from "@/src/store/useFileStore";
import {isAncestorFolderPath} from "@/src/features/zip-handler";

interface FileTreeNodeProps {
  node: FileNode;
  depth: number;
  selectedFileFolderPath: string | null;
  theme: "light" | "dark";
  collapseAllSignal: number;
  renamingTargetPath: string | null;
  renameInitialName: string;
  onRenameChange: (nextName: string) => void;
  onRenameSubmit: () => void;
  onRenameCancel: () => void;
  addFileTargetFolderPath: string | null | undefined;
  pendingAddFileInputValue: string;
  setPendingAddFileInputValue: (nextName: string) => void;
  handleAddFileSubmit: () => void;
  handleAddFileCancel: () => void;
  addFolderTargetFolderPath: string | null | undefined;
  pendingAddFolderInputValue: string;
  setPendingAddFolderInputValue: (nextName: string) => void;
  handleAddFolderSubmit: () => void;
  handleAddFolderCancel: () => void;
}

const FileTreeNode = memo(function FileTreeNode({
  node,
  depth,
  selectedFileFolderPath,
  theme,
  collapseAllSignal,
  renamingTargetPath,
  renameInitialName,
  onRenameChange,
  onRenameSubmit,
  onRenameCancel,
  addFileTargetFolderPath: pendingAddFileTargetFolderPath,
  pendingAddFileInputValue,
  setPendingAddFileInputValue: onPendingAddFileInputChange,
  handleAddFileSubmit: onPendingAddFileSubmit,
  handleAddFileCancel: onPendingAddFileCancel,
  addFolderTargetFolderPath: pendingAddFolderTargetFolderPath,
  pendingAddFolderInputValue,
  setPendingAddFolderInputValue: onPendingAddFolderInputChange,
  handleAddFolderSubmit: onPendingAddFolderSubmit,
  handleAddFolderCancel: onPendingAddFolderCancel,
}: FileTreeNodeProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const renameInputRef = useRef<HTMLInputElement | null>(null);
  const addFileInputRef = useRef<HTMLInputElement | null>(null);
  const addFolderInputRef = useRef<HTMLInputElement | null>(null);

  const showInTreeTargetPath = useFileStore((state) => state.showInTreeTargetPath);
  const revealSignal = useFileStore((state) => state.showSignal);

  const isFolder = node.type === "folder";
  const isActive = node.path === selectedFileFolderPath;
  const isRenaming = node.path === renamingTargetPath;
  const isPendingAddFileInCurrentFolder = isFolder && pendingAddFileTargetFolderPath === node.path;
  const isPendingAddFolderInCurrentFolder = isFolder && pendingAddFolderTargetFolderPath === node.path;

  const openFileTab = useEditorStore((state) => state.openFileTab);
  const setActiveFilePath = useEditorStore((state) => state.setActiveFilePath);

  useEffect(() => {
    if (collapseAllSignal === 0) {
      return;
    }

    if (isFolder) {
      setIsExpanded(false);
    }
  }, [collapseAllSignal, isFolder]);

  // showInTreeTargetPath이 변경될 때마다, 해당 경로가 이 노드의 경로의 조상인지 검사 >> 조상인 경우 이 노드를 자동으로 확장하여 자식 노드가 보이도록 처리
  useEffect(() => {
    if (!isFolder || revealSignal === 0 || !showInTreeTargetPath) {
      return;
    }

    if (node.path === showInTreeTargetPath || isAncestorFolderPath(node.path, showInTreeTargetPath)) {
      setIsExpanded(true);
    }
  }, [isFolder, node.path, revealSignal, showInTreeTargetPath]);

  // isRenaming이 true가 되면 renameInputRef에 포커스 및 텍스트 선택 처리
  useEffect(() => {
    if (!isRenaming || !renameInputRef.current) {
      return;
    }

    renameInputRef.current.focus();
    renameInputRef.current.select();
  }, [isRenaming]);

  useEffect(() => {
    if (!isPendingAddFileInCurrentFolder || !addFileInputRef.current) {
      return;
    }

    addFileInputRef.current.focus();
  }, [isPendingAddFileInCurrentFolder]);

  useEffect(() => {
    if (!isPendingAddFolderInCurrentFolder || !addFolderInputRef.current) {
      return;
    }

    addFolderInputRef.current.focus();
  }, [isPendingAddFolderInCurrentFolder]);

  const handleClickNode = () => {
    if (isRenaming) {
      return;
    }

    if (isFolder) {
      setIsExpanded((prev) => !prev);
      setActiveFilePath(node.path);
      return;
    }

    openFileTab(node.path);
  };

  const handleRenameInputKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      onRenameSubmit();
      return;
    }

    if (event.key === "Escape") {
      event.preventDefault();
      onRenameCancel();
    }
  };

  const handleAddFileInputKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      onPendingAddFileSubmit();
      return;
    }

    if (event.key === "Escape") {
      event.preventDefault();
      onPendingAddFileCancel();
    }
  };

  const handleAddFolderInputKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      onPendingAddFolderSubmit();
      return;
    }

    if (event.key === "Escape") {
      event.preventDefault();
      onPendingAddFolderCancel();
    }
  };

  return (
    <>
      <S.TreeNodeDiv
        $depth={depth}
        $isActive={isActive}
        $themeMode={theme}
        onClick={handleClickNode}
        data-file-path={node.path}
      >
        {isFolder ? <S.FolderPrefix>{isExpanded ? "📂" : "📁"}</S.FolderPrefix> : <S.FolderPrefix>📄</S.FolderPrefix>}
        {isRenaming ? (
          <S.RenameInputWrapper onClick={(event) => event.stopPropagation()}>
            <S.RenameInput
              ref={renameInputRef}
              $themeMode={theme}
              value={renameInitialName}
              onChange={(event) => onRenameChange(event.target.value)}
              onBlur={onRenameSubmit}
              onKeyDown={handleRenameInputKeyDown}
            />
            <S.RenameCancelButton
              type="button"
              $themeMode={theme}
              aria-label="Cancel rename"
              title="Cancel rename"
              onMouseDown={(event) => {
                event.preventDefault();
              }}
              onClick={(event) => {
                event.stopPropagation();
                onRenameCancel();
              }}
            >
              ×
            </S.RenameCancelButton>
          </S.RenameInputWrapper>
        ) : (
          <p>{node.name}</p>
        )}
      </S.TreeNodeDiv>

      {isFolder &&
        isExpanded &&
        node.children?.map((childNode) => (
          <FileTreeNode
            key={childNode.id}
            node={childNode}
            depth={depth + 1}
            selectedFileFolderPath={selectedFileFolderPath}
            theme={theme}
            collapseAllSignal={collapseAllSignal}
            renamingTargetPath={renamingTargetPath}
            renameInitialName={renameInitialName}
            onRenameChange={onRenameChange}
            onRenameSubmit={onRenameSubmit}
            onRenameCancel={onRenameCancel}
            addFileTargetFolderPath={pendingAddFileTargetFolderPath}
            pendingAddFileInputValue={pendingAddFileInputValue}
            setPendingAddFileInputValue={onPendingAddFileInputChange}
            handleAddFileSubmit={onPendingAddFileSubmit}
            handleAddFileCancel={onPendingAddFileCancel}
            addFolderTargetFolderPath={pendingAddFolderTargetFolderPath}
            pendingAddFolderInputValue={pendingAddFolderInputValue}
            setPendingAddFolderInputValue={onPendingAddFolderInputChange}
            handleAddFolderSubmit={onPendingAddFolderSubmit}
            handleAddFolderCancel={onPendingAddFolderCancel}
          />
        ))}

      {isPendingAddFileInCurrentFolder && isExpanded && (
        <S.TreeNodeDiv $depth={depth + 1} $isActive={false} $themeMode={theme}>
          <S.FolderPrefix>📄</S.FolderPrefix>
          <S.RenameInputWrapper onClick={(event) => event.stopPropagation()}>
            <S.RenameInput
              ref={addFileInputRef}
              $themeMode={theme}
              value={pendingAddFileInputValue}
              onChange={(event) => onPendingAddFileInputChange(event.target.value)}
              onBlur={onPendingAddFileSubmit}
              onKeyDown={handleAddFileInputKeyDown}
            />
          </S.RenameInputWrapper>
        </S.TreeNodeDiv>
      )}

      {isPendingAddFolderInCurrentFolder && isExpanded && (
        <S.TreeNodeDiv $depth={depth + 1} $isActive={false} $themeMode={theme}>
          <S.FolderPrefix>📁</S.FolderPrefix>
          <S.RenameInputWrapper onClick={(event) => event.stopPropagation()}>
            <S.RenameInput
              ref={addFolderInputRef}
              $themeMode={theme}
              value={pendingAddFolderInputValue}
              onChange={(event) => onPendingAddFolderInputChange(event.target.value)}
              onBlur={onPendingAddFolderSubmit}
              onKeyDown={handleAddFolderInputKeyDown}
            />
          </S.RenameInputWrapper>
        </S.TreeNodeDiv>
      )}
    </>
  );
});

export {FileTreeNode};
