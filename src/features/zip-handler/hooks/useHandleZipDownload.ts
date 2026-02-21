import {useFileStore} from "@/src/store/useFileStore";
import {createZipBlobFromTree} from "../logic/zipService";

function useHandleZipDownload() {
  const handleDownloadZip = async () => {
    // getState()는 호출된 시점의 상태를 한 번 읽어오며 이후의 변경 사항을 추적하지 않으며 리렌더링 유발X (비구독형 활용)
    const latestTree = useFileStore.getState().fileTree;
    if (latestTree.length === 0) {
      return;
    }

    const zipBlob = await createZipBlobFromTree(latestTree);
    const objectUrl = URL.createObjectURL(zipBlob);

    const anchorElement = document.createElement("a");
    anchorElement.href = objectUrl;
    anchorElement.download = "edited-project.zip";
    anchorElement.click();

    URL.revokeObjectURL(objectUrl);
  };

  return handleDownloadZip;
}

export {useHandleZipDownload};
