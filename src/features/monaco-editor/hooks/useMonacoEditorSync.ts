"use client";

import {useCallback, useEffect, useRef} from "react";
import type * as MonacoEditor from "monaco-editor";
import {FileNode} from "@/src/types/fileType";
import {useFileStore} from "@/src/store/useFileStore";
import {getLanguageByFilePath} from "../logic/editorLogics";
import {useThemeStore} from "@/src/store/useThemeStore";
import {getFileNodeByPathFromIndex} from "../../file-tree";

interface UseMonacoEditorSyncProps {
  editorActiveFilePath: string | null;
  activeFile: FileNode | null;
  onFlushAllMonacoToZustandChange: (flushAllMonacoToZustand: () => void) => void;
  onFlushActiveFileMonacoToZustandChange: (flushActiveFileMonacoToZustand: () => void) => void;
  onUndoActiveFileMonacoChange: (undoActiveFileMonaco: () => void) => void;
  onRedoActiveFileMonacoChange: (redoActiveFileMonaco: () => void) => void;
  autoSave?: boolean;
  handleTabClose: (filePath: string) => void;
}

interface UseMonacoEditorSyncResult {
  monacoHostRef: React.RefObject<HTMLDivElement | null>;
  flushMonacoToZustandByFilePath: (targetPath?: string) => void;
  flushAllMonacoToZustand: () => void;
  rollbackMonacoModelToZustandByFilePath: (targetPath: string) => void;
}

function useMonacoEditorSync({
  editorActiveFilePath: selectedFileFolderPath,
  activeFile,
  onFlushAllMonacoToZustandChange,
  autoSave = false,
  handleTabClose,
  onFlushActiveFileMonacoToZustandChange,
  onUndoActiveFileMonacoChange,
  onRedoActiveFileMonacoChange,
}: UseMonacoEditorSyncProps): UseMonacoEditorSyncResult {
  const updateFileContentByPath = useFileStore((state) => state.updateFileContentByPath);
  const setHaveUnsavedChangeByPath = useFileStore((state) => state.setHaveUnsavedChangeByPath);
  const theme = useThemeStore((state) => state.theme);

  const monacoHostRef = useRef<HTMLDivElement | null>(null);
  const monacoRef = useRef<typeof MonacoEditor | null>(null);
  const editorRef = useRef<MonacoEditor.editor.IStandaloneCodeEditor | null>(null);
  const modelCacheRef = useRef<Map<string, MonacoEditor.editor.ITextModel>>(new Map());

  /**
   * - (key: 파일 경로, value: 모델의 alternativeVersionId)
   * - alternativeVersionId : 변경될 때마다 계속 증가, undo/redo로 이전 상태로 돌아오면 같은 값을 다시 가짐
   */
  const savedAlternativeVersionIdByPathRef = useRef<Map<string, number>>(new Map());

  const activeModelPathRef = useRef<string | null>(null);
  const flushDebounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onDidChangeModelContentRef = useRef<MonacoEditor.IDisposable | null>(null);
  const isModelValueSyncingRef = useRef(false);

  /**
   * 현재 편집 중인 모델의 내용을 Zustand 스토어에 저장하는 함수
   * - 입력 중에는 Zustand를 업데이트하지 않고 Monaco 내부 상태를 사용, 사용자가 직접 저장 시에만 Zustand 업데이트
   * - 특정 파일 경로를 지정하면 해당 파일의 내용을 저장, 지정하지 않으면 현재 활성 모델의 내용을 저장
   */
  const flushMonacoToZustandByFilePath = useCallback(
    (targetPath?: string) => {
      const pathToFlush = targetPath ?? activeModelPathRef.current;
      if (!pathToFlush) {
        return;
      }
      const model = modelCacheRef.current.get(pathToFlush);
      if (model) {
        // 모델의 내용을 Zustand에 반영
        updateFileContentByPath(pathToFlush, model.getValue());

        // zustand에 반영하는 시점의 alternativeVersionId를 존재 여부 판단 baseLine으로 갱신
        savedAlternativeVersionIdByPathRef.current.set(pathToFlush, model.getAlternativeVersionId());
      }
    },
    [updateFileContentByPath],
  );

  const flushAllMonacoToZustand = useCallback(() => {
    for (const [modelPath, model] of modelCacheRef.current.entries()) {
      // 모델의 내용을 Zustand에 반영
      updateFileContentByPath(modelPath, model.getValue());

      // zustand에 반영하는 시점의 alternativeVersionId를 존재 여부 판단 baseLine으로 갱신
      savedAlternativeVersionIdByPathRef.current.set(modelPath, model.getAlternativeVersionId());
    }
  }, [updateFileContentByPath]);

  /** 현재 활성 파일의 Monaco 모델에서 undo 실행하는 함수 */
  const undoActiveFileMonaco = useCallback(() => {
    const editor = editorRef.current;
    if (!editor || !activeModelPathRef.current) {
      return;
    }

    editor.trigger("top-bar", "undo", null);
  }, []);

  /** 현재 활성 파일의 Monaco 모델에서 redo 실행하는 함수 */
  const redoActiveFileMonaco = useCallback(() => {
    const editor = editorRef.current;
    if (!editor || !activeModelPathRef.current) {
      return;
    }

    editor.trigger("top-bar", "redo", null);
  }, []);

  /**
   * Monaco 모델의 내용을 Zustand 스토어에 저장된 내용으로 롤백하는 함수
   * - 모델이 존재하지 않는 경우 : 롤백할 내용이 없으므로 haveUnsavedChange 플래그만 false로 설정
   * - 모델이 존재하지만 해당 경로에 파일 노드가 없거나 파일 노드가 파일이 아닌 경우 : 롤백할 내용이 없으므로 haveUnsavedChange 플래그만 false로 설정
   * - 모델과 파일 노드가 모두 존재하는 경우 : 모델의 내용을 파일 노드의 content로 덮어쓰고 haveUnsavedChange 플래그를 false로 설정
   * - 롤백 적용되는 시점에는 편집 중인 내용이 Monaco 모델에 반영되어 있으므로 isModelValueSyncingRef를 사용해 롤백으로 인한 모델 변경과 사용자의 편집으로 인한 모델 변경을 구분하여 무한 루프 방지
   */
  const rollbackMonacoModelToZustandByFilePath = useCallback(
    (targetPath: string) => {
      const model = modelCacheRef.current.get(targetPath);
      if (!model) {
        setHaveUnsavedChangeByPath(targetPath, false);
        return;
      }

      const latestTreeIndex = useFileStore.getState().fileTreeIndex;
      const targetNode = getFileNodeByPathFromIndex(latestTreeIndex, targetPath);
      if (!targetNode || targetNode.type !== "file") {
        setHaveUnsavedChangeByPath(targetPath, false);
        return;
      }

      isModelValueSyncingRef.current = true;
      // 모델의 내용을 zustand의 파일 노드 내용물로 덮어쓰기
      model.setValue(targetNode.content ?? "");
      isModelValueSyncingRef.current = false;

      // 롤백이 적용된 시점의 새로운 alternativeVersionId를 변경사항 존재 여부 판단 baseLine으로 갱신
      savedAlternativeVersionIdByPathRef.current.set(targetPath, model.getAlternativeVersionId());
      setHaveUnsavedChangeByPath(targetPath, false);
    },
    [setHaveUnsavedChangeByPath],
  );

  /**
   * 파일 경로에 해당하는 Monaco Editor 모델을 반환하는 함수
   * - 모델이 이미 캐시에 존재하면 해당 모델 반환
   * - 모델이 캐시에 없으면 새로운 모델 생성 후 캐시에 저장 및 반환
   * - 모델 URI는 `inmemory://zip-editor/${파일경로}` 형식으로 생성하여 Monaco 내부에서 고유하게 식별
   */
  const getOrCreateModel = useCallback(
    (monaco: typeof MonacoEditor, fileNode: FileNode): MonacoEditor.editor.ITextModel => {
      const cachedModel = modelCacheRef.current.get(fileNode.path);
      if (cachedModel) {
        if (!savedAlternativeVersionIdByPathRef.current.has(fileNode.path)) {
          // 모델이 새로 재사용 시
          // 해당 모델의 alternativeVersionId를 ref에 등록해서 이후 변경사항 존재 여부 판단 baseLine으로 활용
          savedAlternativeVersionIdByPathRef.current.set(fileNode.path, cachedModel.getAlternativeVersionId());
        }
        return cachedModel;
      }

      const modelUri = monaco.Uri.parse(`inmemory://zip-editor/${encodeURIComponent(fileNode.path)}`);
      const model = monaco.editor.createModel(fileNode.content ?? "", getLanguageByFilePath(fileNode.path), modelUri);
      modelCacheRef.current.set(fileNode.path, model);

      // 모델이 새로 생성 시
      // 해당 모델의 alternativeVersionId를 ref에 등록해서 이후 변경사항 존재 여부 판단 baseLine으로 활용
      savedAlternativeVersionIdByPathRef.current.set(fileNode.path, model.getAlternativeVersionId());
      return model;
    },
    [],
  );

  // 부모 컴포넌트에서 이 함수를 사용할 수 있도록 flushAllMonacoToZustand 함수 전달
  useEffect(() => {
    onFlushAllMonacoToZustandChange(flushAllMonacoToZustand);

    return () => {
      onFlushAllMonacoToZustandChange(() => {});
    };
  }, [onFlushAllMonacoToZustandChange, flushAllMonacoToZustand]);

  // 부모 컴포넌트에서 이 함수를 사용할 수 있도록 flushActiveFileMonacoToZustand 함수 전달
  useEffect(() => {
    onFlushActiveFileMonacoToZustandChange(flushMonacoToZustandByFilePath);

    return () => {
      onFlushActiveFileMonacoToZustandChange(() => {});
    };
  }, [onFlushActiveFileMonacoToZustandChange, flushMonacoToZustandByFilePath]);

  // 부모 컴포넌트에서 이 함수를 사용할 수 있도록 undoActiveFileMonaco 함수 전달
  useEffect(() => {
    onUndoActiveFileMonacoChange(undoActiveFileMonaco);

    return () => {
      onUndoActiveFileMonacoChange(() => {});
    };
  }, [onUndoActiveFileMonacoChange, undoActiveFileMonaco]);

  // 부모 컴포넌트에서 이 함수를 사용할 수 있도록 redoActiveFileMonaco 함수 전달
  useEffect(() => {
    onRedoActiveFileMonacoChange(redoActiveFileMonaco);

    return () => {
      onRedoActiveFileMonacoChange(() => {});
    };
  }, [onRedoActiveFileMonacoChange, redoActiveFileMonaco]);

  // Monaco Editor 초기화 및 정리
  useEffect(() => {
    const createMonacoEditor = async () => {
      if (!monacoHostRef.current || editorRef.current) {
        return;
      }

      const monaco = await import("monaco-editor");
      if (!monacoHostRef.current) {
        return;
      }

      monacoRef.current = monaco;
      const editor = monaco.editor.create(monacoHostRef.current, {
        value: "",
        language: "plaintext",
        automaticLayout: true,
        minimap: {enabled: false},
        fontSize: 13,
        theme: theme === "light" ? "vs" : "vs-dark",
      });

      onDidChangeModelContentRef.current = editor.onDidChangeModelContent(() => {
        // 모델 내용이 변경될 때마다 해당 내용을 Zustand에 반영하되,
        // isModelValueSyncingRef를 통해 롤백으로 인한 변경과 사용자의 편집으로 인한 변경을 구분하여 무한 루프 오류 방지
        if (isModelValueSyncingRef.current) {
          return;
        }

        const currentActivePath = activeModelPathRef.current;
        if (!currentActivePath) {
          return;
        }

        const currentModel = editor.getModel();
        if (!currentModel) {
          return;
        }

        // 현재 모델의 alternativeVersionId와 baseline을 비교하여 변경사항 존재 여부 판단
        const savedAlternativeVersionId = savedAlternativeVersionIdByPathRef.current.get(currentActivePath);
        const isContentSyncedWithZustand =
          savedAlternativeVersionId !== undefined &&
          currentModel.getAlternativeVersionId() === savedAlternativeVersionId;

        setHaveUnsavedChangeByPath(currentActivePath, !isContentSyncedWithZustand);

        if (isContentSyncedWithZustand) {
          if (flushDebounceTimerRef.current) {
            clearTimeout(flushDebounceTimerRef.current);
            flushDebounceTimerRef.current = null;
          }
          return;
        }

        if (autoSave) {
          if (flushDebounceTimerRef.current) {
            clearTimeout(flushDebounceTimerRef.current);
          }

          flushDebounceTimerRef.current = setTimeout(() => {
            flushMonacoToZustandByFilePath(currentActivePath);
          }, 5000);
        }
      });

      editorRef.current = editor;
    };

    createMonacoEditor();

    return () => {
      if (flushDebounceTimerRef.current) {
        clearTimeout(flushDebounceTimerRef.current);
      }

      onDidChangeModelContentRef.current?.dispose();
      onDidChangeModelContentRef.current = null;
      editorRef.current?.dispose();
      editorRef.current = null;

      modelCacheRef.current.forEach((model) => model.dispose());
      modelCacheRef.current.clear();
      savedAlternativeVersionIdByPathRef.current.clear();
      activeModelPathRef.current = null;
    };
  }, [autoSave, flushMonacoToZustandByFilePath, setHaveUnsavedChangeByPath]);

  useEffect(() => {
    if (!monacoRef.current) {
      return;
    }

    monacoRef.current.editor.setTheme(theme === "light" ? "vs" : "vs-dark");
  }, [theme]);

  // 선택된 파일이 변경될 때마다 해당 파일에 맞는 Monaco 모델로 에디터를 업데이트
  useEffect(() => {
    const editor = editorRef.current;
    const monaco = monacoRef.current;

    if (!editor || !monaco) {
      return;
    }

    if (!selectedFileFolderPath || !activeFile || activeFile.type !== "file" || activeFile.isBinary) {
      activeModelPathRef.current = null;
      editor.setModel(null);
      return;
    }

    const model = getOrCreateModel(monaco, activeFile);

    editor.setModel(model);
    activeModelPathRef.current = activeFile.path;
  }, [selectedFileFolderPath, activeFile, getOrCreateModel]);

  // Ctrl/Cmd + S 입력 시 브라우저 기본 저장 동작을 막고 현재 편집 내용을 Zustand에 반영
  useEffect(() => {
    const handleSaveShortcut = (event: KeyboardEvent) => {
      const isSaveShortcut = (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "s";
      if (!isSaveShortcut) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();

      if (flushDebounceTimerRef.current) {
        clearTimeout(flushDebounceTimerRef.current);
      }

      flushMonacoToZustandByFilePath();
    };

    window.addEventListener("keydown", handleSaveShortcut);

    return () => {
      window.removeEventListener("keydown", handleSaveShortcut);
    };
  }, [flushMonacoToZustandByFilePath]);

  // Ctrl/Cmd + W 입력 시 브라우저 기본 탭 닫기를 막고 현재 활성 파일 탭 닫기 로직 실행
  useEffect(() => {
    const handleCloseShortcut = (event: KeyboardEvent) => {
      const isCloseShortcut = (event.altKey || event.metaKey) && event.key.toLowerCase() === "w";
      if (!isCloseShortcut) {
        return;
      }

      if (!selectedFileFolderPath) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();
      handleTabClose(selectedFileFolderPath);
    };

    window.addEventListener("keydown", handleCloseShortcut);

    return () => {
      window.removeEventListener("keydown", handleCloseShortcut);
    };
  }, [selectedFileFolderPath, handleTabClose]);

  return {
    monacoHostRef,
    flushMonacoToZustandByFilePath,
    flushAllMonacoToZustand,
    rollbackMonacoModelToZustandByFilePath,
  };
}

export {useMonacoEditorSync};
