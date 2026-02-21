"use client";

import {useCallback, useRef, useState} from "react";
import {useFileStore} from "@/src/store/useFileStore";
import {FileTree, useHandleTreeContainerWidth} from "@/src/features/file-tree";
import * as S from "@/app/page.styles";
import {useHandleZipDownload, useHandleZipUpload, useSampleZipDownload} from "@/src/features/zip-handler";
import {MonacoEditorContainer} from "@/src/features/monaco-editor";
import {CustomModal} from "@/src/features/custom-modal";
import {useEditorStore} from "@/src/store/useEditorStore";
import {Loader} from "@/src/common/components";
import {RedoIcon, SaveIcon, UndoIcon} from "@/src/common/icon";
import {ThemeToggleButton} from "@/src/features/theme";
import {useThemeStore} from "@/src/store/useThemeStore";

export default function Home() {
  const bodyLayoutRef = useRef<HTMLDivElement>(null);

  const [isUnsavedAlertOpen, setIsUnsavedAlertOpen] = useState(false);
  const [isSampleZipDownloadConfirmOpen, setIsSampleZipDownloadConfirmOpen] = useState(false);

  const [flushAllMonacoToZustand, setFlushAllMonacoToZustand] = useState<() => void>(() => () => {});
  const [flushActiveFileMonacoToZustand, setFlushActiveFileMonacoToZustand] = useState<() => void>(() => () => {});
  const [undoActiveFileMonaco, setUndoActiveFileMonaco] = useState<() => void>(() => () => {});
  const [redoActiveFileMonaco, setRedoActiveFileMonaco] = useState<() => void>(() => () => {});

  const {leftPanelWidth, handleResizeStart} = useHandleTreeContainerWidth({bodyLayoutRef});

  const fileTree = useFileStore((state) => state.fileTree);
  const isLoading = useFileStore((state) => state.isLoading);

  const {handleZipFileInputChange} = useHandleZipUpload();

  const hasUnsavedChanges = useFileStore((state) => state.hasUnsavedChanges);

  const handleDownloadZip = useHandleZipDownload();
  const handleDownloadSampleZip = useSampleZipDownload();

  const handleFlushAllMonacoToZustandChange = useCallback((flushAll: () => void) => {
    setFlushAllMonacoToZustand(() => flushAll);
  }, []);

  const handleFlushActiveFileMonacoToZustandChange = useCallback((flushActive: () => void) => {
    setFlushActiveFileMonacoToZustand(() => flushActive);
  }, []);

  const handleUndoActiveFileMonacoChange = useCallback((undoActive: () => void) => {
    setUndoActiveFileMonaco(() => undoActive);
  }, []);

  const handleRedoActiveFileMonacoChange = useCallback((redoActive: () => void) => {
    setRedoActiveFileMonaco(() => redoActive);
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

  const selectedFileFolderPath = useEditorStore((state) => state.selectedFileFolderPath);
  const theme = useThemeStore((state) => state.theme);

  const handleCloseSampleZipDownloadModal = () => {
    setIsSampleZipDownloadConfirmOpen(false);
  };

  const handleClickSampleZipDownload = () => {
    handleDownloadSampleZip();
  };

  return (
    <S.Main $themeMode={theme}>
      <S.TopBar $themeMode={theme}>
        <S.TopBarTitle>Zip File Code Editor</S.TopBarTitle>
        <S.TopBarActionContainer>
          <S.TopBarFileActions>
            <S.ZipUploadLabel $themeMode={theme} htmlFor="zip-upload-input" aria-label="Upload-Zip">
              Zip 업로드
            </S.ZipUploadLabel>
            <S.HiddenFileInput id="zip-upload-input" type="file" accept=".zip" onChange={handleZipFileInputChange} />

            <S.TopBarButton
              $themeMode={theme}
              type="button"
              onClick={handleDownloadButtonClick}
              disabled={fileTree.length === 0 || isLoading}
              aria-label="Download-Zip"
            >
              Zip 다운로드
            </S.TopBarButton>

            <div style={{width: "12px"}}></div>
            <S.TopBarButton
              $themeMode={theme}
              type="button"
              onClick={() => setIsSampleZipDownloadConfirmOpen(true)}
              aria-label="Download-Sample-Zip"
              title="다운받은 샘플을 업로드한 후 기능을 사용해보세요!"
            >
              샘플 Zip 다운로드
            </S.TopBarButton>
          </S.TopBarFileActions>
          <S.TopBarEditorActionThemeToggleWrapper>
            {selectedFileFolderPath && (
              <S.TopBarEditorActions>
                <S.TopBarButton
                  $themeMode={theme}
                  type="button"
                  aria-label="Undo"
                  title="Undo / Ctrl+Z"
                  onClick={() => undoActiveFileMonaco()}
                  disabled={fileTree.length === 0 || isLoading}
                >
                  <UndoIcon />
                </S.TopBarButton>
                <S.TopBarButton
                  $themeMode={theme}
                  type="button"
                  aria-label="Redo"
                  title="Redo / Ctrl+Y"
                  onClick={() => redoActiveFileMonaco()}
                  disabled={fileTree.length === 0 || isLoading}
                >
                  <RedoIcon />
                </S.TopBarButton>
                <S.TopBarButton
                  $themeMode={theme}
                  type="button"
                  aria-label="Save"
                  title="Save / Ctrl+S"
                  onClick={() => flushActiveFileMonacoToZustand()}
                  disabled={fileTree.length === 0 || isLoading}
                >
                  <SaveIcon />
                </S.TopBarButton>
              </S.TopBarEditorActions>
            )}
            <ThemeToggleButton />
          </S.TopBarEditorActionThemeToggleWrapper>
        </S.TopBarActionContainer>
      </S.TopBar>

      <S.BodyLayout ref={bodyLayoutRef}>
        <S.LeftPanel style={{width: `${leftPanelWidth}px`}}>
          <FileTree />
        </S.LeftPanel>

        <S.PanelResizer $themeMode={theme} onMouseDown={handleResizeStart} />

        <S.RightPanel>
          <MonacoEditorContainer
            onFlushAllMonacoToZustandChange={handleFlushAllMonacoToZustandChange}
            onFlushActiveFileMonacoToZustandChange={handleFlushActiveFileMonacoToZustandChange}
            onUndoActiveFileMonacoChange={handleUndoActiveFileMonacoChange}
            onRedoActiveFileMonacoChange={handleRedoActiveFileMonacoChange}
          />
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
      <CustomModal
        modalType="confirm"
        isOpen={isSampleZipDownloadConfirmOpen}
        onClose={handleCloseSampleZipDownloadModal}
        message="코드베이스 형태의 샘플 Zip 파일을 다운로드 받으시겠습니까?"
        onConfirm={() => {
          handleCloseSampleZipDownloadModal();
          handleClickSampleZipDownload();
        }}
      />
      <Loader />
    </S.Main>
  );
}
