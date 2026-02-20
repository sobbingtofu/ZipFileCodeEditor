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
