import {FileNode} from "@/src/types/fileType";

/**
 * 파일 트리에서 특정 경로를 가진 노드를 찾는 재귀 함수
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
