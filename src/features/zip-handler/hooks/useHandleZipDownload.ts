import {useFileStore} from "@/src/store/useFileStore";
import {createZipBlobFromTree} from "../logic/zipService";

const getBaseNameFromPath = (path: string): string => {
  const normalizedPath = path.replace(/\\/g, "/");
  return normalizedPath.split("/").pop() || "downloaded-file";
};

const createBlobFromDataUrl = (dataUrl: string): Blob | null => {
  const dataUrlMatch = dataUrl.match(/^data:([^;,]+)?;base64,(.*)$/);
  if (!dataUrlMatch) {
    return null;
  }

  const mimeType = dataUrlMatch[1] || "application/octet-stream";
  const base64Content = dataUrlMatch[2] || "";

  const binaryString = atob(base64Content);
  const byteArray = new Uint8Array(binaryString.length);
  for (let index = 0; index < binaryString.length; index += 1) {
    byteArray[index] = binaryString.charCodeAt(index);
  }

  return new Blob([byteArray], {type: mimeType});
};

function useHandleZipDownload() {
  const setIsLoading = useFileStore((state) => state.setIsLoading);
  const setLoadingType = useFileStore((state) => state.setLoadingType);

  const handleDownloadZip = async () => {
    try {
      setIsLoading(true);
      setLoadingType("download");

      // getState()는 호출된 시점의 상태를 한 번 읽어오며 이후의 변경 사항을 추적하지 않으며 리렌더링 유발X (비구독형 활용)
      const latestTree = useFileStore.getState().fileTree;
      if (latestTree.length === 0) {
        return;
      }

      if (latestTree.length === 0) {
        return;
      }

      const shouldDownloadSingleFile = latestTree.length === 1;
      const singleFileNode = shouldDownloadSingleFile ? latestTree[0] : null;

      const downloadBlob = shouldDownloadSingleFile
        ? singleFileNode?.isBinary
          ? createBlobFromDataUrl(singleFileNode.content ?? "") || new Blob([], {type: "application/octet-stream"})
          : new Blob([singleFileNode?.content ?? ""], {type: "text/plain;charset=utf-8"})
        : await createZipBlobFromTree(latestTree);

      const downloadFileName = shouldDownloadSingleFile
        ? getBaseNameFromPath(singleFileNode?.path ?? "")
        : "edited-project.zip";

      const objectUrl = URL.createObjectURL(downloadBlob);

      const anchorElement = document.createElement("a");
      anchorElement.href = objectUrl;
      anchorElement.download = downloadFileName;
      anchorElement.click();

      URL.revokeObjectURL(objectUrl);
    } catch (error) {
      console.error("Zip 파일 생성 및 다운로드 중 오류 발생:", error);
    } finally {
      setIsLoading(false);
      setLoadingType(null);
    }
  };

  return handleDownloadZip;
}

export {useHandleZipDownload};
