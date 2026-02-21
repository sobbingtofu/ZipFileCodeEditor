import {create} from "zustand";
import {FileNode} from "@/src/types/fileType";
import {buildFileTreeIndex, FileTreeIndex} from "@/src/features/file-tree";

export type loadingType = "upload" | "download" | null;

interface FileStoreState {
  fileTree: FileNode[];
  fileTreeIndex: FileTreeIndex;
  isLoading: boolean;
  showInTreeTargetPath: string | null;
  showSignal: number;
  loadingType: loadingType;
  setFileTree: (fileTree: FileNode[]) => void;
  setLoadingType: (loadingType: loadingType) => void;
  setIsLoading: (isLoading: boolean) => void;
  triggerShowInTreeTargetPath: (targetPath: string) => void;
  resetFileTree: () => void;
  updateFileContentByPath: (targetPath: string, updatedContent: string) => void;
  setHaveUnsavedChangeByPath: (targetPath: string, haveUnsavedChange: boolean) => void;
  hasUnsavedChanges: () => boolean;
}

/**
 * 파일 경로 기준으로 노드 1개를 갱신하고, 조상 폴더 체인만 재구성하는 함수
 * - 구조(path, parent-child 관계)가 바뀌지 않는 업데이트(content, unsaved flag)에 최적화
 * - nodeByPath는 변경된 노드 + 조상 폴더 노드만 새 객체로 교체
 * - parentPathByPath/childPathsByPath는 구조가 동일하므로 재사용
 */
const updateTreeAndIndexByPath = (
  fileTree: FileNode[],
  fileTreeIndex: FileTreeIndex,
  targetPath: string,
  updater: (targetNode: FileNode) => FileNode,
): {nextFileTree: FileNode[]; nextFileTreeIndex: FileTreeIndex} => {
  const targetNode = fileTreeIndex.nodeByPath.get(targetPath);
  if (!targetNode) {
    return {nextFileTree: fileTree, nextFileTreeIndex: fileTreeIndex};
  }

  const nextNodeByPath = new Map(fileTreeIndex.nodeByPath);
  nextNodeByPath.set(targetPath, updater(targetNode));

  let currentPath: string | null = targetPath;

  while (currentPath !== null) {
    const parentPath: string | null = fileTreeIndex.parentPathByPath.get(currentPath) ?? null;
    if (parentPath === null) {
      break;
    }

    const parentNode = nextNodeByPath.get(parentPath);
    if (parentNode?.type === "folder") {
      const childPaths = fileTreeIndex.childPathsByPath.get(parentPath) ?? [];
      const nextChildren = childPaths
        .map((childPath) => nextNodeByPath.get(childPath))
        .filter((childNode): childNode is FileNode => childNode !== undefined);

      nextNodeByPath.set(parentPath, {
        ...parentNode,
        children: nextChildren,
      });
    }

    currentPath = parentPath;
  }

  const nextFileTree = fileTree
    .map((rootNode) => nextNodeByPath.get(rootNode.path))
    .filter((rootNode): rootNode is FileNode => rootNode !== undefined);

  return {
    nextFileTree,
    nextFileTreeIndex: {
      nodeByPath: nextNodeByPath,
      parentPathByPath: fileTreeIndex.parentPathByPath,
      childPathsByPath: fileTreeIndex.childPathsByPath,
    },
  };
};

export const useFileStore = create<FileStoreState>((set, get) => ({
  fileTree: [],
  fileTreeIndex: buildFileTreeIndex([]),
  isLoading: false,
  showInTreeTargetPath: null,
  showSignal: 0,
  loadingType: null,
  setLoadingType: (loadingType) => set({loadingType}),
  setFileTree: (fileTree) => set({fileTree, fileTreeIndex: buildFileTreeIndex(fileTree)}),
  setIsLoading: (isLoading) => set({isLoading}),
  triggerShowInTreeTargetPath: (targetPath) =>
    set((state) => ({
      showInTreeTargetPath: targetPath,
      showSignal: state.showSignal + 1,
    })),
  resetFileTree: () =>
    set({
      fileTree: [],
      fileTreeIndex: buildFileTreeIndex([]),
      isLoading: false,
      showInTreeTargetPath: null,
      showSignal: 0,
      loadingType: null,
    }),
  updateFileContentByPath: (targetPath, updatedContent) =>
    set((state) => {
      const {nextFileTree, nextFileTreeIndex} = updateTreeAndIndexByPath(
        state.fileTree,
        state.fileTreeIndex,
        targetPath,
        (targetNode) => {
          if (targetNode.type !== "file") {
            return targetNode;
          }

          return {
            ...targetNode,
            content: updatedContent,
            haveUnsavedChange: false,
          };
        },
      );

      return {
        fileTree: nextFileTree,
        fileTreeIndex: nextFileTreeIndex,
      };
    }),
  setHaveUnsavedChangeByPath: (targetPath, haveUnsavedChange) =>
    set((state) => {
      const targetNode = state.fileTreeIndex.nodeByPath.get(targetPath);
      if (targetNode?.type !== "file") {
        return state;
      }

      if (Boolean(targetNode.haveUnsavedChange) === haveUnsavedChange) {
        return state;
      }

      const {nextFileTree, nextFileTreeIndex} = updateTreeAndIndexByPath(
        state.fileTree,
        state.fileTreeIndex,
        targetPath,
        (targetNode) => {
          if (targetNode.type !== "file") {
            return targetNode;
          }

          return {
            ...targetNode,
            haveUnsavedChange,
          };
        },
      );

      return {
        fileTree: nextFileTree,
        fileTreeIndex: nextFileTreeIndex,
      };
    }),
  hasUnsavedChanges: () => {
    for (const node of get().fileTreeIndex.nodeByPath.values()) {
      if (node.type === "file" && node.haveUnsavedChange === true) {
        return true;
      }
    }

    return false;
  },
}));
