import {create} from "zustand";
import {FileNode} from "@/src/types/fileType";

interface FileStoreState {
  fileTree: FileNode[];
  isLoading: boolean;
  setFileTree: (fileTree: FileNode[]) => void;
  setIsLoading: (isLoading: boolean) => void;
  resetFileTree: () => void;
  updateFileContentByPath: (targetPath: string, updatedContent: string) => void;
}

const updateFileContentInTree = (nodes: FileNode[], targetPath: string, updatedContent: string): FileNode[] => {
  return nodes.map((node) => {
    if (node.type === "file" && node.path === targetPath) {
      return {...node, content: updatedContent};
    }

    if (node.type === "folder" && node.children) {
      return {...node, children: updateFileContentInTree(node.children, targetPath, updatedContent)};
    }

    return node;
  });
};

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

export const useFileStore = create<FileStoreState>((set) => ({
  fileTree: [],
  isLoading: false,
  setFileTree: (fileTree) => set({fileTree}),
  setIsLoading: (isLoading) => set({isLoading}),
  resetFileTree: () => set({fileTree: [], isLoading: false}),
  updateFileContentByPath: (targetPath, updatedContent) =>
    set((state) => ({
      fileTree: updateFileContentInTree(state.fileTree, targetPath, updatedContent),
    })),
}));
