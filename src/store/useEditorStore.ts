import {create} from "zustand";

interface EditorStoreState {
  activeFilePath: string | null;
  openedFilePaths: string[];
  openFileTab: (filePath: string) => void;
  closeFileTab: (filePath: string) => void;
  setActiveFilePath: (filePath: string | null) => void;
  replaceOpenedFilePath: (previousPath: string, nextPath: string) => void;
  resetEditorState: () => void;
}

export const useEditorStore = create<EditorStoreState>((set) => ({
  activeFilePath: null,
  openedFilePaths: [],

  openFileTab: (filePath) =>
    set((state) => {
      const isAlreadyOpened = state.openedFilePaths.includes(filePath);
      return {
        openedFilePaths: isAlreadyOpened ? state.openedFilePaths : [...state.openedFilePaths, filePath],
        activeFilePath: filePath,
      };
    }),

  closeFileTab: (filePath) =>
    set((state) => {
      const nextOpenedFilePaths = state.openedFilePaths.filter((openedPath) => openedPath !== filePath);

      if (state.activeFilePath !== filePath) {
        return {openedFilePaths: nextOpenedFilePaths};
      }

      const nextActivePath =
        nextOpenedFilePaths.length > 0 ? nextOpenedFilePaths[nextOpenedFilePaths.length - 1] : null;

      return {
        openedFilePaths: nextOpenedFilePaths,
        activeFilePath: nextActivePath,
      };
    }),

  setActiveFilePath: (filePath) => set({activeFilePath: filePath}),

  replaceOpenedFilePath: (previousPath, nextPath) =>
    set((state) => ({
      openedFilePaths: state.openedFilePaths.map((openedPath) => (openedPath === previousPath ? nextPath : openedPath)),
      activeFilePath: state.activeFilePath === previousPath ? nextPath : state.activeFilePath,
    })),

  resetEditorState: () =>
    set({
      activeFilePath: null,
      openedFilePaths: [],
    }),
}));
