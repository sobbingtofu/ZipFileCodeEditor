"use client";

import {ChangeEvent, useCallback, useEffect, useRef, useState} from "react";
import {useFileStore} from "@/src/store/useFileStore";
import {FileTree, useHandleTreeContainerWidth} from "@/src/features/file-tree";
import * as S from "@/app/page.styles";
import {useHandleZipDownload, useHandleZipUpload} from "@/src/features/zip-handler";
import {MonacoEditorContainer} from "@/src/features/monaco-editor";

export default function Home() {
  const bodyLayoutRef = useRef<HTMLDivElement>(null);

  const [flushContentToStore, setFlushContentToStore] = useState<() => void>(() => () => {});

  const {leftPanelWidth, handleResizeStart} = useHandleTreeContainerWidth({bodyLayoutRef});

  const fileTree = useFileStore((state) => state.fileTree);
  const isLoading = useFileStore((state) => state.isLoading);

  const {handleZipFileUploadBtnClick} = useHandleZipUpload();

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
          <S.HiddenFileInput id="zip-upload-input" type="file" accept=".zip" onChange={handleZipFileUploadBtnClick} />

          <S.DownloadButton type="button" onClick={handleDownloadZip} disabled={fileTree.length === 0 || isLoading}>
            Zip 다운로드
          </S.DownloadButton>
        </S.TopBarActions>
      </S.TopBar>

      <S.BodyLayout ref={bodyLayoutRef}>
        <S.LeftPanel style={{width: `${leftPanelWidth}px`}}>
          <FileTree />
        </S.LeftPanel>

        <S.PanelResizer onMouseDown={handleResizeStart} />

        <S.RightPanel>
          <MonacoEditorContainer onFlushContentToStoreChange={handleFlushContentToStoreChange} />
        </S.RightPanel>
      </S.BodyLayout>
    </S.Main>
  );
}
