"use client";

import {useCallback, useEffect, useRef} from "react";
import type * as MonacoEditor from "monaco-editor";
import {FileNode} from "@/src/types/fileType";
import {useFileStore} from "@/src/store/useFileStore";
import {getLanguageByFilePath} from "../logic/editorLogics";

interface UseMonacoEditorSyncParams {
  activeFilePath: string | null;
  activeFile: FileNode | null;
  onFlushContentToStoreChange: (flushContentToStore: () => void) => void;
}

interface UseMonacoEditorSyncResult {
  monacoHostRef: React.RefObject<HTMLDivElement | null>;
  flushContentToStore: (targetPath?: string) => void;
}

function useMonacoEditorSync({
  activeFilePath,
  activeFile,
  onFlushContentToStoreChange,
}: UseMonacoEditorSyncParams): UseMonacoEditorSyncResult {
  const updateFileContentByPath = useFileStore((state) => state.updateFileContentByPath);

  const monacoHostRef = useRef<HTMLDivElement | null>(null);
  const monacoRef = useRef<typeof MonacoEditor | null>(null);
  const editorRef = useRef<MonacoEditor.editor.IStandaloneCodeEditor | null>(null);
  const modelCacheRef = useRef<Map<string, MonacoEditor.editor.ITextModel>>(new Map());
  const activeModelPathRef = useRef<string | null>(null);
  const dirtyTextCacheRef = useRef<Map<string, string>>(new Map());

  /**
   * 현재 편집 중인 모델의 내용을 Zustand 스토어에 저장하는 함수
   * - 입력 중에는 Zustand를 업데이트하지 않고 Monaco 내부 상태를 사용, 편집 중인 내용은 dirtyTextCacheRef에 저장
   * - 탭 전환/저장 시점에만 Zustand로 내용을 커밋
   * - 편집 중인 내용이 있을 경우 이를 우선적으로 저장, 편집 중인 내용이 없을 경우 Monaco 모델의 내용을 저장
   * - 특정 파일 경로를 지정하면 해당 파일의 내용을 저장, 지정하지 않으면 현재 활성 모델의 내용을 저장
   */
  const flushContentToStore = useCallback(
    (targetPath?: string) => {
      const pathToFlush = targetPath ?? activeModelPathRef.current;
      if (!pathToFlush) {
        return;
      }

      const cachedDirtyValue = dirtyTextCacheRef.current.get(pathToFlush);

      if (typeof cachedDirtyValue === "string") {
        // 편집 중인 내용이 있을 경우 이를 zustand에 반영하고 dirty cache에서 해당 항목 제거
        updateFileContentByPath(pathToFlush, cachedDirtyValue);
        dirtyTextCacheRef.current.delete(pathToFlush);
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

  // 부모 컴포넌트에서 이 함수를 사용할 수 있도록 flushContentToStore 함수 전달
  useEffect(() => {
    onFlushContentToStoreChange(flushContentToStore);

    return () => {
      onFlushContentToStoreChange(() => {});
    };
  }, [onFlushContentToStoreChange, flushContentToStore]);

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

      // 편집 내용이 변경될 때마다 dirtyTextCacheRef에 편집 중인 내용을 저장
      // (Zustand 스토어 업데이트 빈도를 줄이기 위함임)
      editor.onDidChangeModelContent(() => {
        const currentPath = activeModelPathRef.current;
        const activeModel = editor.getModel();
        if (!currentPath || !activeModel) {
          return;
        }

        dirtyTextCacheRef.current.set(currentPath, activeModel.getValue());
      });

      editorRef.current = editor;
    };

    createMonacoEditor();

    return () => {
      flushContentToStore();
      editorRef.current?.dispose();
      editorRef.current = null;

      modelCacheRef.current.forEach((model) => model.dispose());
      modelCacheRef.current.clear();
      dirtyTextCacheRef.current.clear();
      activeModelPathRef.current = null;
    };
  }, [flushContentToStore]);

  // 선택된 파일이 변경될 때마다 해당 파일에 맞는 Monaco 모델로 에디터를 업데이트
  useEffect(() => {
    const editor = editorRef.current;
    const monaco = monacoRef.current;

    if (!editor || !monaco) {
      return;
    }

    const previousActivePath = activeModelPathRef.current;
    if (previousActivePath && previousActivePath !== activeFilePath) {
      flushContentToStore(previousActivePath);
    }

    if (!activeFilePath || !activeFile || activeFile.type !== "file" || activeFile.isBinary) {
      activeModelPathRef.current = null;
      editor.setModel(null);
      return;
    }

    const model = getOrCreateModel(monaco, activeFile);
    const dirtyValue = dirtyTextCacheRef.current.get(activeFile.path);

    if (typeof dirtyValue === "string" && dirtyValue !== model.getValue()) {
      model.setValue(dirtyValue);
    }

    editor.setModel(model);
    activeModelPathRef.current = activeFile.path;
  }, [activeFilePath, activeFile, getOrCreateModel, flushContentToStore]);

  return {
    monacoHostRef,
    flushContentToStore,
  };
}

export {useMonacoEditorSync};
