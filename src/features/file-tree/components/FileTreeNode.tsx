import {FileNode} from "@/src/types/fileType";
import {memo, useEffect, useState} from "react";

import * as S from "@/src/features/file-tree/components/FileTree.styles";
import {useEditorStore} from "@/src/store/useEditorStore";
import {useFileStore} from "@/src/store/useFileStore";
import {isAncestorFolderPath, normalizePath} from "../../zip-handler";

interface FileTreeNodeProps {
  node: FileNode;
  depth: number;
  activeFilePath: string | null;
  theme: "light" | "dark";
  collapseAllSignal: number;
}

const FileTreeNode = memo(function FileTreeNode({
  node,
  depth,
  activeFilePath,
  theme,
  collapseAllSignal,
}: FileTreeNodeProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const revealTargetPath = useFileStore((state) => state.showInTreeTargetPath);
  const revealSignal = useFileStore((state) => state.showSignal);

  const isFolder = node.type === "folder";
  const isActive = !isFolder && node.path === activeFilePath;

  const openFileTab = useEditorStore((state) => state.openFileTab);

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
    if (!isFolder || revealSignal === 0 || !revealTargetPath) {
      return;
    }

    if (isAncestorFolderPath(node.path, revealTargetPath)) {
      setIsExpanded(true);
    }
  }, [isFolder, node.path, revealSignal, revealTargetPath]);

  const handleSelectFile = (selectedFileNode: FileNode) => {
    openFileTab(selectedFileNode.path);
  };

  const handleClickNode = () => {
    if (isFolder) {
      setIsExpanded((prev) => !prev);
      return;
    }

    handleSelectFile(node);
  };

  return (
    <>
      <S.TreeNodeDiv $depth={depth} $isActive={isActive} $themeMode={theme} onClick={handleClickNode}>
        {isFolder ? <S.FolderPrefix>{isExpanded ? "📂" : "📁"}</S.FolderPrefix> : <S.FolderPrefix>📄</S.FolderPrefix>}
        {node.name}
      </S.TreeNodeDiv>

      {isFolder &&
        isExpanded &&
        node.children?.map((childNode) => (
          <FileTreeNode
            key={childNode.id}
            node={childNode}
            depth={depth + 1}
            activeFilePath={activeFilePath}
            theme={theme}
            collapseAllSignal={collapseAllSignal}
          />
        ))}
    </>
  );
});

export {FileTreeNode};
