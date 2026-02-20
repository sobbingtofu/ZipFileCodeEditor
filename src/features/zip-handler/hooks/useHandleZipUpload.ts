import {useFileStore} from "@/src/store/useFileStore";
import {isZipFile, parseZipFileToTree} from "../logic/zipService";
import {useEditorStore} from "@/src/store/useEditorStore";
import {findFirstFileNode} from "../../file-tree";

function useHandleZipUpload() {
  const setFileTree = useFileStore((state) => state.setFileTree);
  const setIsLoading = useFileStore((state) => state.setIsLoading);
  const openFileTab = useEditorStore((state) => state.openFileTab);
  const resetEditorState = useEditorStore((state) => state.resetEditorState);

  /** Zip 업로드 후 트리 초기화 & 첫 파일 자동 오픈 */
  const handleZipFileUpload = async (uploadedFile: File): Promise<{success: boolean; error: string | null}> => {
    try {
      if (!isZipFile(uploadedFile)) {
        const errorMsg = "업로드된 파일이 Zip 형식이 아닙니다.";
        console.error(errorMsg);
        return {success: false, error: errorMsg};
      }

      setIsLoading(true);

      const parsedTree = await parseZipFileToTree(uploadedFile);
      setFileTree(parsedTree);
      resetEditorState();

      const firstFileNode = findFirstFileNode(parsedTree);
      if (firstFileNode) {
        openFileTab(firstFileNode.path);
      }
      return {success: true, error: null};
    } finally {
      setIsLoading(false);
    }
  };

  return {
    handleZipFileUpload,
  };
}

export {useHandleZipUpload};
