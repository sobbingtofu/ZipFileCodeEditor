import {RefObject, useCallback} from "react";

function useScrollTreeToTargetFile(treeScrollAreaRef: RefObject<HTMLDivElement | null>) {
  /**
   * 이름 변경 모드 진입 또는 삭제 시도 시, 해당 파일이 보이는 위치로 스크롤을 이동시키는 함수
   * - 트리 전체를 탐색하여 이름 변경 대상 파일의 DOM 요소를 찾은 뒤, 해당 요소가 트리 컨테이너 안에서 완전히 보이는지 검사
   * - 완전히 보이지 않는 경우, scrollIntoView 메서드를 사용하여 스크롤을 이동시킴
   */
  const scrollToTargetFile = useCallback(
    (targetPath: string) => {
      const container = treeScrollAreaRef.current;
      if (!container) {
        return;
      }

      const nodeElements = container.querySelectorAll<HTMLElement>("[data-file-path]");
      const targetElement = [...nodeElements].find((element) => element.getAttribute("data-file-path") === targetPath);
      if (!targetElement) {
        return;
      }

      const containerRect = container.getBoundingClientRect();
      const targetRect = targetElement.getBoundingClientRect();
      const isFullyVisible = targetRect.top >= containerRect.top && targetRect.bottom <= containerRect.bottom;
      if (isFullyVisible) {
        return;
      }

      targetElement.scrollIntoView({block: "nearest"});
    },
    [treeScrollAreaRef],
  );

  return {scrollToTargetFile};
}

export default useScrollTreeToTargetFile;
