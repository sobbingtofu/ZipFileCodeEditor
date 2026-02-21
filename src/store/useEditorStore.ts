import {create} from "zustand";
import {replacePathPrefix} from "@/src/features/file-tree";
import {getNextActivePathAfterClose} from "../features/monaco-editor";

interface EditorStoreState {
  selectedFileFolderPath: string | null;
  openedFilePaths: string[];
  openFileTab: (filePath: string) => void;
  closeFileTab: (filePath: string) => void;
  removeOpenedFileFolderPathsByPrefix: (targetPath: string) => void;
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
      const {nextOpenedFilePaths, nextActivePath} = getNextActivePathAfterClose(state.openedFilePaths, filePath);

      if (state.selectedFileFolderPath !== filePath) {
        return {openedFilePaths: nextOpenedFilePaths};
      }

      return {
        openedFilePaths: nextOpenedFilePaths,
        selectedFileFolderPath: nextActivePath,
      };
    }),

  /**
   * 특정 경로를 접두사로 가지는 열린 파일/폴더 경로들을 탭에서 모두 닫는 함수
   */
  removeOpenedFileFolderPathsByPrefix: (targetPath) =>
    set((state) => {
      const isDeletedPath = (path: string): boolean => path === targetPath || path.startsWith(`${targetPath}/`);

      const nextOpenedFilePaths = state.openedFilePaths.filter((openedPath) => !isDeletedPath(openedPath));
      const shouldResetSelected = state.selectedFileFolderPath !== null && isDeletedPath(state.selectedFileFolderPath);

      return {
        openedFilePaths: nextOpenedFilePaths,
        selectedFileFolderPath: shouldResetSelected
          ? (nextOpenedFilePaths[nextOpenedFilePaths.length - 1] ?? null)
          : state.selectedFileFolderPath,
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
