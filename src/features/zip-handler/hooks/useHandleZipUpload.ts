import {useFileStore} from "@/src/store/useFileStore";
import {ChangeEvent} from "react";
import {parseZipFileToTree} from "../logic/zipService";
import {useEditorStore} from "@/src/store/useEditorStore";
import {findFirstFileNode} from "../../file-tree";

function useHandleZipUpload() {
  const setFileTree = useFileStore((state) => state.setFileTree);
  const setIsLoading = useFileStore((state) => state.setIsLoading);
  const openFileTab = useEditorStore((state) => state.openFileTab);
  const resetEditorState = useEditorStore((state) => state.resetEditorState);

  /** Zip 업로드 후 트리 초기화 & 첫 파일 자동 오픈 */
  const handleZipUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    console.log("Zip upload initiated. Selected file:", event.target.value);

    const uploadedFile = event.target.files?.[0];
    if (!uploadedFile) {
      return;
    }

    setIsLoading(true);
    try {
      const parsedTree = await parseZipFileToTree(uploadedFile);
      setFileTree(parsedTree);
      resetEditorState();

      const firstFileNode = findFirstFileNode(parsedTree);
      if (firstFileNode) {
        openFileTab(firstFileNode.path);
      }
    } finally {
      setIsLoading(false);
      // 재업로드 안정성 보장
      event.target.value = "";
    }
  };
  return handleZipUpload;
}

export default useHandleZipUpload;
