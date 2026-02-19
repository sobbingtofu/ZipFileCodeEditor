import {useFileStore} from "@/src/store/useFileStore";
import {createZipBlobFromTree} from "../logic/zipService";

function useHandleZipDownload({flushContentToStore}: {flushContentToStore: () => void}) {
  const handleDownloadZip = async () => {
    flushContentToStore();

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

export default useHandleZipDownload;
