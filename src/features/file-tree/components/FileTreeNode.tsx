import {FileNode} from "@/src/types/fileType";
import {memo, useState} from "react";

import * as S from "@/src/features/file-tree/components/FileTree.styles";
import {useEditorStore} from "@/src/store/useEditorStore";

interface FileTreeNodeProps {
  node: FileNode;
  depth: number;
  activeFilePath: string | null;
}

const FileTreeNode = memo(function FileTreeNode({node, depth, activeFilePath}: FileTreeNodeProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const isFolder = node.type === "folder";
  const isActive = !isFolder && node.path === activeFilePath;

  const openFileTab = useEditorStore((state) => state.openFileTab);
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
      <S.TreeNodeDiv $depth={depth} $isActive={isActive} onClick={handleClickNode}>
        {isFolder ? <S.FolderPrefix>{isExpanded ? "📂" : "📁"}</S.FolderPrefix> : <S.FolderPrefix>📄</S.FolderPrefix>}
        {node.name}
      </S.TreeNodeDiv>

      {isFolder &&
        isExpanded &&
        node.children?.map((childNode) => (
          <FileTreeNode key={childNode.id} node={childNode} depth={depth + 1} activeFilePath={activeFilePath} />
        ))}
    </>
  );
});

export {FileTreeNode};
