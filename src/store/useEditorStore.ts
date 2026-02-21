import {create} from "zustand";
import {replacePathPrefix} from "@/src/features/file-tree";

interface EditorStoreState {
  selectedFileFolderPath: string | null;
  openedFilePaths: string[];
  openFileTab: (filePath: string) => void;
  closeFileTab: (filePath: string) => void;
  setActiveFilePath: (filePath: string | null) => void;
  replaceOpenedFilePath: (previousPath: string, nextPath: string) => void;
  resetEditorState: () => void;
}

export const useEditorStore = create<EditorStoreState>((set) => ({
  selectedFileFolderPath: null,
  openedFilePaths: [],

  openFileTab: (filePath) =>
    set((state) => {
      const isAlreadyOpened = state.openedFilePaths.includes(filePath);
      return {
        openedFilePaths: isAlreadyOpened ? state.openedFilePaths : [...state.openedFilePaths, filePath],
        selectedFileFolderPath: filePath,
      };
    }),

  closeFileTab: (filePath) =>
    set((state) => {
      const nextOpenedFilePaths = state.openedFilePaths.filter((openedPath) => openedPath !== filePath);

      if (state.selectedFileFolderPath !== filePath) {
        return {openedFilePaths: nextOpenedFilePaths};
      }

      const nextActivePath =
        nextOpenedFilePaths.length > 0 ? nextOpenedFilePaths[nextOpenedFilePaths.length - 1] : null;

      return {
        openedFilePaths: nextOpenedFilePaths,
        selectedFileFolderPath: nextActivePath,
      };
    }),

  setActiveFilePath: (filePath) => set({selectedFileFolderPath: filePath}),

  replaceOpenedFilePath: (previousPath, nextPath) =>
    set((state) => {
      const getNewPathName = (path: string): string => replacePathPrefix(path, previousPath, nextPath);

      return {
        openedFilePaths: state.openedFilePaths.map(getNewPathName),
        selectedFileFolderPath: state.selectedFileFolderPath
          ? getNewPathName(state.selectedFileFolderPath)
          : state.selectedFileFolderPath,
      };
    }),

  resetEditorState: () =>
    set({
      selectedFileFolderPath: null,
      openedFilePaths: [],
    }),
}));
