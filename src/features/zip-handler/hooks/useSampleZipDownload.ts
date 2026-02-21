function useSampleZipDownload() {
  const handleDownloadSampleZip = () => {
    const anchorElement = document.createElement("a");
    anchorElement.href = "/sample-zipfile.zip";
    anchorElement.download = "sample-zipfile.zip";
    anchorElement.click();
  };

  return handleDownloadSampleZip;
}

export {useSampleZipDownload};
