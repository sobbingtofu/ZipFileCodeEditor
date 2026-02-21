import {RefObject, useCallback, useEffect, useState} from "react";

interface UseHandleTreeContainerWidthProps {
  bodyLayoutRef: RefObject<HTMLDivElement | null>;
}

function useHandleTreeContainerWidth({bodyLayoutRef}: UseHandleTreeContainerWidthProps) {
  const MIN_LEFT_PANEL_WIDTH = 240;
  const MAX_LEFT_PANEL_WIDTH = 600;

  const [leftPanelWidth, setLeftPanelWidth] = useState(280);
  const [isResizing, setIsResizing] = useState(false);

  const limitLeftPanelWidth = useCallback(
    (nextWidth: number) => Math.min(MAX_LEFT_PANEL_WIDTH, Math.max(MIN_LEFT_PANEL_WIDTH, nextWidth)),
    [MAX_LEFT_PANEL_WIDTH, MIN_LEFT_PANEL_WIDTH],
  );

  const handleResizeStart = useCallback(() => {
    setIsResizing(true);
  }, []);

  useEffect(() => {
    if (!isResizing) {
      return;
    }

    const handleMouseMove = (event: MouseEvent) => {
      // bodyLayout의 left를 기준으로 패널의 너비 계산
      const bodyLayoutRect = bodyLayoutRef?.current?.getBoundingClientRect();
      if (!bodyLayoutRect) {
        return;
      }

      // 왼쪽 패널의 너비는 마우스의 현재 위치에서 bodyLayout의 left 위치를 뺀 값으로 설정
      const nextWidth = event.clientX - bodyLayoutRect.left;
      setLeftPanelWidth(limitLeftPanelWidth(nextWidth));
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.body.style.cursor = "";
      document.body.style.userSelect = "";

      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [limitLeftPanelWidth, isResizing]);

  return {leftPanelWidth, handleResizeStart};
}

export {useHandleTreeContainerWidth};
