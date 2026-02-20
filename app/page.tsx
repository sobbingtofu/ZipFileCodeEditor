"use client";

import {ChangeEvent, useCallback, useState} from "react";
import {useFileStore} from "@/src/store/useFileStore";
import {FileTree} from "@/src/features/file-tree";
import * as S from "@/app/page.styles";
import {useHandleZipDownload, useHandleZipUpload} from "@/src/features/zip-handler";
import {MonacoEditorContainer} from "@/src/features/monaco-editor";

export default function Home() {
  const [flushContentToStore, setFlushContentToStore] = useState<() => void>(() => () => {});

  const fileTree = useFileStore((state) => state.fileTree);
  const isLoading = useFileStore((state) => state.isLoading);

  const {handleZipFileUpload} = useHandleZipUpload();

  const handleFlushContentToStoreChange = useCallback((flush: () => void) => {
    setFlushContentToStore(() => flush);
  }, []);

  const handleDownloadZip = useHandleZipDownload({flushContentToStore});

  const handleZipFileUploadBtn = async (event: ChangeEvent<HTMLInputElement, HTMLInputElement>) => {
    const uploadedFile = event.target.files?.[0];
    if (!uploadedFile) {
      return;
    }
    try {
      await handleZipFileUpload(uploadedFile);
    } finally {
      // 재업로드 안정성 보장
      event.target.value = "";
    }
  };

  return (
    <S.Main>
      <S.TopBar>
        <S.TopBarTitle>Zip File Code Editor</S.TopBarTitle>
        <S.TopBarActions>
          <S.ZipUploadLabel htmlFor="zip-upload-input">Zip 업로드</S.ZipUploadLabel>
          <S.HiddenFileInput id="zip-upload-input" type="file" accept=".zip" onChange={handleZipFileUploadBtn} />

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
