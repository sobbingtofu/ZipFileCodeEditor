"use client";

import {useCallback, useState} from "react";
import {useFileStore} from "@/src/store/useFileStore";
import FileTree from "@/src/features/file-tree/components/FileTree";
import * as S from "@/app/page.styles";
import useHandleZipUpload from "@/src/features/zip-handler/hooks/useHandleZipUpload";
import useHandleZipDownload from "@/src/features/zip-handler/hooks/useHandleZipDownload";
import MonacoEditorContainer from "@/src/features/monaco-editor/components/MonacoEditorContainer";

export default function Home() {
  const [flushContentToStore, setFlushContentToStore] = useState<() => void>(() => () => {});

  const fileTree = useFileStore((state) => state.fileTree);
  const isLoading = useFileStore((state) => state.isLoading);

  const handleZipUpload = useHandleZipUpload();

  const handleFlushContentToStoreChange = useCallback((flush: () => void) => {
    setFlushContentToStore(() => flush);
  }, []);

  const handleDownloadZip = useHandleZipDownload({flushContentToStore});

  return (
    <S.Main>
      <S.TopBar>
        <S.TopBarTitle>Zip File Code Editor</S.TopBarTitle>
        <S.TopBarActions>
          <S.ZipUploadLabel htmlFor="zip-upload-input">Zip 업로드</S.ZipUploadLabel>
          <S.HiddenFileInput id="zip-upload-input" type="file" accept=".zip" onChange={handleZipUpload} />

          <S.DownloadButton type="button" onClick={handleDownloadZip} disabled={fileTree.length === 0 || isLoading}>
            Zip 다운로드
          </S.DownloadButton>
        </S.TopBarActions>
      </S.TopBar>

      <S.BodyLayout>
        <S.LeftPanel>
          <FileTree />
        </S.LeftPanel>

        <S.RightPanel>
          <MonacoEditorContainer onFlushContentToStoreChange={handleFlushContentToStoreChange} />
        </S.RightPanel>
      </S.BodyLayout>
    </S.Main>
  );
}
