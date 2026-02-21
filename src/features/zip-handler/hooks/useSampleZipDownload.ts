function useSampleZipDownload() {
  const handleDownloadSampleZip = () => {
    const anchorElement = document.createElement("a");
    anchorElement.href = "/sample-codebase-zipfile.zip";
    anchorElement.download = "sample-codebase-zipfile.zip";
    anchorElement.click();
  };

  return handleDownloadSampleZip;
}

export {useSampleZipDownload};
