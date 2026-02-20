"use client";

import {useCallback, useRef, useState} from "react";
import {useFileStore} from "@/src/store/useFileStore";
import {FileTree, useHandleTreeContainerWidth} from "@/src/features/file-tree";
import * as S from "@/app/page.styles";
import {useHandleZipDownload, useHandleZipUpload} from "@/src/features/zip-handler";
import {MonacoEditorContainer} from "@/src/features/monaco-editor";
import {CustomModal} from "@/src/features/custom-modal";

export default function Home() {
  const bodyLayoutRef = useRef<HTMLDivElement>(null);
  const [isUnsavedAlertOpen, setIsUnsavedAlertOpen] = useState(false);
  const [flushAllMonacoToZustand, setFlushAllMonacoToZustand] = useState<() => void>(() => () => {});

  const {leftPanelWidth, handleResizeStart} = useHandleTreeContainerWidth({bodyLayoutRef});

  const fileTree = useFileStore((state) => state.fileTree);
  const isLoading = useFileStore((state) => state.isLoading);

  const {handleZipFileInputChange} = useHandleZipUpload();

  const hasUnsavedChanges = useFileStore((state) => state.hasUnsavedChanges);
  const handleDownloadZip = useHandleZipDownload();

  const handleFlushAllMonacoToZustandChange = useCallback((flushAll: () => void) => {
    setFlushAllMonacoToZustand(() => flushAll);
  }, []);

  const handleCloseUnsavedModal = () => {
    setIsUnsavedAlertOpen(false);
  };

  const handleSaveAllAndDownload = async () => {
    flushAllMonacoToZustand();
    await handleDownloadZip();
    handleCloseUnsavedModal();
  };

  const handleDownloadWithoutSave = async () => {
    await handleDownloadZip();
    handleCloseUnsavedModal();
  };

  const handleDownloadButtonClick = async () => {
    if (hasUnsavedChanges()) {
      setIsUnsavedAlertOpen(true);
      return;
    }

    await handleDownloadZip();
  };

  return (
    <S.Main>
      <S.TopBar>
        <S.TopBarTitle>Zip File Code Editor</S.TopBarTitle>
        <S.TopBarActions>
          <S.ZipUploadLabel htmlFor="zip-upload-input">Zip 업로드</S.ZipUploadLabel>
          <S.HiddenFileInput id="zip-upload-input" type="file" accept=".zip" onChange={handleZipFileInputChange} />

          <S.DownloadButton
            type="button"
            onClick={handleDownloadButtonClick}
            disabled={fileTree.length === 0 || isLoading}
          >
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
          <MonacoEditorContainer onFlushAllMonacoToZustandChange={handleFlushAllMonacoToZustandChange} />
        </S.RightPanel>
      </S.BodyLayout>
      <CustomModal
        modalType="multiBtns"
        isOpen={isUnsavedAlertOpen}
        onClose={handleCloseUnsavedModal}
        message="다운로드 전 변경내역을 저장할까요?"
        btnInfo={[
          {btnName: "저장 후 다운로드", btnFunc: handleSaveAllAndDownload},
          {btnName: "저장하지 않고 다운로드", btnFunc: handleDownloadWithoutSave},
          {btnName: "닫기", btnFunc: handleCloseUnsavedModal},
        ]}
      />
    </S.Main>
  );
}
