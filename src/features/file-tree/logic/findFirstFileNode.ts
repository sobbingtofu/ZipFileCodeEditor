import {FileNode} from "@/src/types/fileType";

export const findFirstFileNode = (nodes: FileNode[]): FileNode | null => {
  for (const node of nodes) {
    if (node.type === "file") {
      return node;
    }

    if (node.type === "folder" && node.children) {
      const foundFileNode = findFirstFileNode(node.children);
      if (foundFileNode) {
        return foundFileNode;
      }
    }
  }

  return null;
};
