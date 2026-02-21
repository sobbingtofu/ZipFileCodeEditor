import {FileNode} from "@/src/types/fileType";

export interface FileTreeIndex {
  nodeByPath: Map<string, FileNode>;
  parentPathByPath: Map<string, string | null>;
  childPathsByPath: Map<string, string[]>;
}

/**
 * 파일 트리를 한 번 순회해 path 기반 인덱스를 생성하는 함수
 * - nodeByPath: path -> 노드
 * - parentPathByPath: path -> 부모 path
 * - childPathsByPath: 폴더 path -> 직접 자식 path 목록
 */
export const buildFileTreeIndex = (nodes: FileNode[]): FileTreeIndex => {
  const nodeByPath = new Map<string, FileNode>();
  const parentPathByPath = new Map<string, string | null>();
  const childPathsByPath = new Map<string, string[]>();

  const traverse = (targetNodes: FileNode[], parentPath: string | null) => {
    for (const node of targetNodes) {
      nodeByPath.set(node.path, node);
      parentPathByPath.set(node.path, parentPath);

      if (node.type !== "folder") {
        continue;
      }

      const childPaths = (node.children ?? []).map((childNode) => childNode.path);
      childPathsByPath.set(node.path, childPaths);

      if (node.children && node.children.length > 0) {
        traverse(node.children, node.path);
      }
    }
  };

  traverse(nodes, null);

  return {
    nodeByPath,
    parentPathByPath,
    childPathsByPath,
  };
};

/**
 * 미리 생성된 인덱스로 path에 해당하는 노드를 O(1)로 조회하는 함수
 */
export const getNodeByPathFromIndex = (fileTreeIndex: FileTreeIndex, targetPath: string): FileNode | null => {
  return fileTreeIndex.nodeByPath.get(targetPath) ?? null;
};

/**
 * 미리 생성된 인덱스로 path에 해당하는 파일 노드를 O(1)로 조회하는 함수
 */
export const getFileNodeByPathFromIndex = (fileTreeIndex: FileTreeIndex, targetPath: string): FileNode | null => {
  const targetNode = fileTreeIndex.nodeByPath.get(targetPath);
  if (!targetNode || targetNode.type !== "file") {
    return null;
  }

  return targetNode;
};

/**
 * 파일 트리에서 특정 경로를 가진 노드를 찾는 재귀 함수 (인덱스 활용으로 대체, 로직 기록용)
 * - nodes: 탐색할 노드 배열
 * - targetPath: 찾고자 하는 노드의 경로
 * - 반환값: targetPath와 일치하는 노드가 있으면 해당 노드 반환, 없으면 null 반환
 */
export const findNodeByPath = (nodes: FileNode[], targetPath: string): FileNode | null => {
  for (const node of nodes) {
    if (node.path === targetPath) {
      return node;
    }

    if (node.type === "folder" && node.children) {
      const foundNode = findNodeByPath(node.children, targetPath);
      if (foundNode) {
        return foundNode;
      }
    }
  }

  return null;
};

/** 트리에서 특정 경로에 해당하는 파일 노드를 찾아 반환하는 함수 (인덱스 활용으로 대체, 로직 기록용)
 * - nodes 배열을 순회하며 targetPath와 일치하는 노드 탐색
 * - 폴더 노드의 경우 재귀적으로 하위 노드에서도 탐색 수행
 * - 일치하는 노드를 찾으면 해당 노드 반환, 찾지 못하면 null 반환
 */
export const findFileNodeInTree = (nodes: FileNode[], targetPath: string): FileNode | null => {
  for (const node of nodes) {
    if (node.path === targetPath) {
      return node;
    }

    if (node.type === "folder" && node.children) {
      const foundNode = findFileNodeInTree(node.children, targetPath);
      if (foundNode) {
        return foundNode;
      }
    }
  }

  return null;
};
