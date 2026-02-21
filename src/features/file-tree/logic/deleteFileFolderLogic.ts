import {FileNode} from "@/src/types/fileType";

/**
 * 파일 트리에서 특정 파일/폴더 노드를 삭제하는 함수
 * - nodes: 파일 트리 노드 배열
 * - targetPath: 삭제할 파일/폴더 노드의 경로
 */
export const removeNodeByPath = (nodes: FileNode[], targetPath: string): FileNode[] => {
  return nodes
    .filter((node) => node.path !== targetPath)
    .map((node) => {
      if (node.type === "folder" && node.children) {
        return {
          ...node,
          children: removeNodeByPath(node.children, targetPath),
        };
      }

      return node;
    });
};
