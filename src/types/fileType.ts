export interface FileNode {
  id: string;
  name: string;
  type: "file" | "folder";
  path: string;
  children?: FileNode[];
  content?: string;
  isEditableText?: boolean;
  isBinary?: boolean;
  haveUnsavedChange?: boolean;
}
