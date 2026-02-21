import {create} from "zustand";
import {FileNode} from "@/src/types/fileType";

interface FileStoreState {
  fileTree: FileNode[];
  isLoading: boolean;
  showInTreeTargetPath: string | null;
  showSignal: number;
  setFileTree: (fileTree: FileNode[]) => void;
  setIsLoading: (isLoading: boolean) => void;
  triggerShowInTreeTargetPath: (targetPath: string) => void;
  resetFileTree: () => void;
  updateFileContentByPath: (targetPath: string, updatedContent: string) => void;
  setHaveUnsavedChangeByPath: (targetPath: string, haveUnsavedChange: boolean) => void;
  hasUnsavedChanges: () => boolean;
}

/** 업데이트할 파일 내용 재귀적으로 생성 */
const generateNewFileContentInTree = (nodes: FileNode[], targetPath: string, updatedContent: string): FileNode[] => {
  return nodes.map((node) => {
    if (node.type === "file" && node.path === targetPath) {
      return {...node, content: updatedContent, haveUnsavedChange: false};
    }

    if (node.type === "folder" && node.children) {
      return {...node, children: generateNewFileContentInTree(node.children, targetPath, updatedContent)};
    }

    return node;
  });
};

/** 특정 파일 경로에 대해 haveUnsavedChange 플래그를 업데이트하는 함수
 * - targetPath에 해당하는 파일 노드를 찾아 haveUnsavedChange 값을 업데이트
 * - 폴더 노드의 경우 재귀적으로 하위 노드에도 동일한 업데이트 적용
 * - 트리 구조는 유지해 변경된 노드만 새로운 객체로 생성하여 반환 (>> 불변성 유지)
 */
const updateHaveUnsavedChangeInTree = (
  nodes: FileNode[],
  targetPath: string,
  haveUnsavedChange: boolean,
): FileNode[] => {
  return nodes.map((node) => {
    if (node.type === "file" && node.path === targetPath) {
      return {...node, haveUnsavedChange};
    }

    if (node.type === "folder" && node.children) {
      return {...node, children: updateHaveUnsavedChangeInTree(node.children, targetPath, haveUnsavedChange)};
    }

    return node;
  });
};

/** 트리에서 저장되지 않은 변경사항이 있는지 확인해 true/false 반환 */
const hasUnsavedChangesInTree = (nodes: FileNode[]): boolean => {
  return nodes.some((node) => {
    if (node.type === "file") {
      return node.haveUnsavedChange === true;
    }

    if (node.type === "folder" && node.children) {
      return hasUnsavedChangesInTree(node.children);
    }

    return false;
  });
};

/** 트리에서 특정 경로에 해당하는 파일 노드를 찾아 반환하는 함수
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

export const useFileStore = create<FileStoreState>((set, get) => ({
  fileTree: [],
  isLoading: false,
  showInTreeTargetPath: null,
  showSignal: 0,
  setFileTree: (fileTree) => set({fileTree}),
  setIsLoading: (isLoading) => set({isLoading}),
  triggerShowInTreeTargetPath: (targetPath) =>
    set((state) => ({
      showInTreeTargetPath: targetPath,
      showSignal: state.showSignal + 1,
    })),
  resetFileTree: () => set({fileTree: [], isLoading: false, showInTreeTargetPath: null, showSignal: 0}),
  updateFileContentByPath: (targetPath, updatedContent) =>
    set((state) => ({
      fileTree: generateNewFileContentInTree(state.fileTree, targetPath, updatedContent),
    })),
  setHaveUnsavedChangeByPath: (targetPath, haveUnsavedChange) =>
    set((state) => ({
      fileTree: updateHaveUnsavedChangeInTree(state.fileTree, targetPath, haveUnsavedChange),
    })),
  hasUnsavedChanges: () => hasUnsavedChangesInTree(get().fileTree),
}));
