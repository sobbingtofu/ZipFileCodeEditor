"use client";

import {useCallback, useEffect, useRef} from "react";
import type * as MonacoEditor from "monaco-editor";
import {FileNode} from "@/src/types/fileType";
import {findFileNodeInTree, useFileStore} from "@/src/store/useFileStore";
import {getLanguageByFilePath} from "../logic/editorLogics";

interface UseMonacoEditorSyncProps {
  activeFilePath: string | null;
  activeFile: FileNode | null;
  onFlushAllMonacoToZustandChange: (flushAllMonacoToZustand: () => void) => void;
  autoSave?: boolean;
}

interface UseMonacoEditorSyncResult {
  monacoHostRef: React.RefObject<HTMLDivElement | null>;
  flushMonacoToZustandByFilePath: (targetPath?: string) => void;
  flushAllMonacoToZustand: () => void;
  rollbackMonacoModelToZustandByFilePath: (targetPath: string) => void;
}

function useMonacoEditorSync({
  activeFilePath,
  activeFile,
  onFlushAllMonacoToZustandChange,
  autoSave = false,
}: UseMonacoEditorSyncProps): UseMonacoEditorSyncResult {
  const updateFileContentByPath = useFileStore((state) => state.updateFileContentByPath);
  const setHaveUnsavedChangeByPath = useFileStore((state) => state.setHaveUnsavedChangeByPath);

  const monacoHostRef = useRef<HTMLDivElement | null>(null);
  const monacoRef = useRef<typeof MonacoEditor | null>(null);
  const editorRef = useRef<MonacoEditor.editor.IStandaloneCodeEditor | null>(null);
  const modelCacheRef = useRef<Map<string, MonacoEditor.editor.ITextModel>>(new Map());
  const activeModelPathRef = useRef<string | null>(null);
  const flushDebounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onDidChangeModelContentRef = useRef<MonacoEditor.IDisposable | null>(null);
  const isModelValueSyncingRef = useRef(false);

  /**
   * 현재 편집 중인 모델의 내용을 Zustand 스토어에 저장하는 함수
   * - 입력 중에는 Zustand를 업데이트하지 않고 Monaco 내부 상태를 사용
   * - 탭 전환/저장 시점에만 Zustand로 내용을 커밋
   * - 편집 중인 내용이 있을 경우 이를 우선적으로 저장, 편집 중인 내용이 없을 경우 Monaco 모델의 내용을 저장
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
        // 편집 중인 내용이 없고 Monaco 모델이 존재하는 경우 모델의 내용을 zustand에 반영
        updateFileContentByPath(pathToFlush, model.getValue());
      }
    },
    [updateFileContentByPath],
  );

  const flushAllMonacoToZustand = useCallback(() => {
    for (const [modelPath, model] of modelCacheRef.current.entries()) {
      updateFileContentByPath(modelPath, model.getValue());
    }
  }, [updateFileContentByPath]);

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

      const latestTree = useFileStore.getState().fileTree;
      const targetNode = findFileNodeInTree(latestTree, targetPath);
      if (!targetNode || targetNode.type !== "file") {
        setHaveUnsavedChangeByPath(targetPath, false);
        return;
      }

      isModelValueSyncingRef.current = true;
      model.setValue(targetNode.content ?? "");
      isModelValueSyncingRef.current = false;
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
        return cachedModel;
      }

      const modelUri = monaco.Uri.parse(`inmemory://zip-editor/${encodeURIComponent(fileNode.path)}`);
      const model = monaco.editor.createModel(fileNode.content ?? "", getLanguageByFilePath(fileNode.path), modelUri);
      modelCacheRef.current.set(fileNode.path, model);
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
        theme: "vs-dark",
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

        setHaveUnsavedChangeByPath(currentActivePath, true);
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
      activeModelPathRef.current = null;
    };
  }, [autoSave, flushMonacoToZustandByFilePath, setHaveUnsavedChangeByPath]);

  // 선택된 파일이 변경될 때마다 해당 파일에 맞는 Monaco 모델로 에디터를 업데이트
  useEffect(() => {
    const editor = editorRef.current;
    const monaco = monacoRef.current;

    if (!editor || !monaco) {
      return;
    }

    if (!activeFilePath || !activeFile || activeFile.type !== "file" || activeFile.isBinary) {
      activeModelPathRef.current = null;
      editor.setModel(null);
      return;
    }

    const model = getOrCreateModel(monaco, activeFile);

    editor.setModel(model);
    activeModelPathRef.current = activeFile.path;
  }, [activeFilePath, activeFile, getOrCreateModel]);

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

  return {
    monacoHostRef,
    flushMonacoToZustandByFilePath,
    flushAllMonacoToZustand,
    rollbackMonacoModelToZustandByFilePath,
  };
}

export {useMonacoEditorSync};
