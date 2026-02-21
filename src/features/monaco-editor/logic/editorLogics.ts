export const getLanguageByFilePath = (filePath: string): string => {
  const extension = filePath.split(".").pop()?.toLowerCase();

  const languageMap: Record<string, string> = {
    ts: "typescript",
    tsx: "typescript",
    js: "javascript",
    jsx: "javascript",
    json: "json",
    html: "html",
    css: "css",
    scss: "scss",
    md: "markdown",
    yml: "yaml",
    yaml: "yaml",
    xml: "xml",
  };

  return extension ? (languageMap[extension] ?? "plaintext") : "plaintext";
};

export const getTabName = (filePath: string): string => {
  const parts = filePath.split("/");
  return parts[parts.length - 1] ?? filePath;
};

/**
 * 열린 파일 경로 목록과 닫으려는 파일 경로를 받아서, 닫은 후의 오픈된 파일 목록과 선택되어있을 다음 파일 경로를 반환하는 함수
 */
export const getNextActivePathAfterClose = (
  openedFilePaths: string[],
  closingPath: string,
): {nextOpenedFilePaths: string[]; nextActivePath: string | null} => {
  const nextOpenedFilePaths = openedFilePaths.filter((openedPath) => openedPath !== closingPath);
  return {
    nextOpenedFilePaths,
    nextActivePath: nextOpenedFilePaths.length > 0 ? nextOpenedFilePaths[nextOpenedFilePaths.length - 1] : null,
  };
};
