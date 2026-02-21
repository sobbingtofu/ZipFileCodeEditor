import {FileNode} from "@/src/types/fileType";

export const getParentPath = (path: string): string | null => {
  const lastSlashIndex = path.lastIndexOf("/");
  if (lastSlashIndex < 0) {
    return null;
  }

  return path.slice(0, lastSlashIndex);
};

export const sortNodes = (nodes: FileNode[]): FileNode[] => {
  return [...nodes].sort((leftNode, rightNode) => {
    if (leftNode.type !== rightNode.type) {
      return leftNode.type === "folder" ? -1 : 1;
    }

    return leftNode.name.localeCompare(rightNode.name);
  });
};

export const buildUniqueFileName = (siblings: FileNode[]): string => {
  const baseName = "new-file";
  const extension = ".txt";

  const siblingNameSet = new Set(siblings.map((node) => node.name));
  const defaultName = `${baseName}${extension}`;
  if (!siblingNameSet.has(defaultName)) {
    return defaultName;
  }

  let serial = 1;
  while (true) {
    const nextName = `${baseName}-${serial}${extension}`;
    if (!siblingNameSet.has(nextName)) {
      return nextName;
    }
    serial += 1;
  }
};

/**
 * 파일 트리에 새로운 파일 노드를 추가하는 함수
 * - nodes: 파일 트리 노드 배열
 * - targetFolderPath: 새 파일 노드를 추가할 대상 폴더의 경로 (null인 경우 루트에 추가)
 * - newFileNode: 추가할 새 파일 노드
 * - 반환값: 업데이트된 파일 트리 노드 배열
 */
export const appendFileNodeToTargetFolder = (
  nodes: FileNode[],
  targetFolderPath: string | null,
  newFileNode: FileNode,
): FileNode[] => {
  if (!targetFolderPath) {
    return sortNodes([...nodes, newFileNode]);
  }

  return nodes.map((node) => {
    if (node.type === "folder" && node.path === targetFolderPath) {
      const nextChildren = sortNodes([...(node.children ?? []), newFileNode]);
      return {
        ...node,
        children: nextChildren,
      };
    }

    if (node.type === "folder" && node.children) {
      return {
        ...node,
        children: appendFileNodeToTargetFolder(node.children, targetFolderPath, newFileNode),
      };
    }

    return node;
  });
};
