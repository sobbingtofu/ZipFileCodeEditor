import {FileNode} from "@/src/types/fileType";

/**
 * 파일 경로가 포함된 originPath와 사용자가 입력한 nextName 기반으로 새로운 파일 경로를 생성하는 함수
 * - originPath: 원본 파일 경로
 * - nextName: 새로운 파일 이름
 * - 반환값: 새로운 파일 경로
 */
export const buildRenamedFilePath = (originPath: string, nextName: string): string => {
  const lastSlashIndex = originPath.lastIndexOf("/");
  if (lastSlashIndex < 0) {
    return nextName;
  }

  const parentPath = originPath.slice(0, lastSlashIndex);
  return `${parentPath}/${nextName}`;
};

/**
 * 파일 트리에서 특정 파일 노드를 업데이트하는 함수
 * - nodes: 파일 트리 노드 배열
 * - targetPath: 업데이트할 파일 노드의 경로
 * - nextName: 새로운 파일 이름
 * - nextPath: 새로운 파일 경로
 * - 반환값: 업데이트된 파일 트리 노드 배열
 */
export const updateTargetFileNodeInTree = (
  nodes: FileNode[],
  targetPath: string,
  nextName: string,
  nextPath: string,
): FileNode[] => {
  return nodes.map((node) => {
    if (node.type === "file" && node.path === targetPath) {
      return {
        ...node,
        id: `node:${nextPath}`,
        name: nextName,
        path: nextPath,
      };
    }

    if (node.type === "folder" && node.children) {
      return {
        ...node,
        children: updateTargetFileNodeInTree(node.children, targetPath, nextName, nextPath),
      };
    }

    return node;
  });
};
