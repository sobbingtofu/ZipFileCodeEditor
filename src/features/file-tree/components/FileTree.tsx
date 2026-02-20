"use client";

import {useMemo} from "react";

import * as S from "@/src/features/file-tree/components/FileTree.styles";

import FileTreeNode from "./FileNode";
import {useFileStore} from "@/src/store/useFileStore";
import {useEditorStore} from "@/src/store/useEditorStore";

export default function FileTree() {
  const fileTree = useFileStore((state) => state.fileTree);
  const activeFilePath = useEditorStore((state) => state.activeFilePath);
  const hasNodes = useMemo(() => fileTree.length > 0, [fileTree]);

  return (
    <S.TreeContainer>
      <S.TreeHeader>파일 탐색기</S.TreeHeader>
      <S.TreeScrollArea>
        {!hasNodes && (
          <S.EmptyMessage>
            <p>Zip 업로드 버튼을 클릭하거나 </p>
            <p>여기에 Zip 파일을 드래그&드롭하면</p>
            <p>트리가 표시됩니다.</p>
          </S.EmptyMessage>
        )}
        {fileTree.map((node) => (
          <FileTreeNode key={node.id} node={node} depth={0} activeFilePath={activeFilePath} />
        ))}
      </S.TreeScrollArea>
    </S.TreeContainer>
  );
}
