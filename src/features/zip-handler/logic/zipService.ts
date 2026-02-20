import JSZip from "jszip";
import {FileNode} from "@/src/types/fileType";

const IMAGE_EXTENSION_SET = new Set([".jpg", ".jpeg", ".png"]);

const normalizePath = (rawPath: string): string => rawPath.replace(/\\/g, "/").replace(/\/+$/g, "");

/** 파일 경로가 이미지 확장자로 끝나는지 검사하여 바이너리 여부 판단 */
const isBinaryImageFile = (filePath: string): boolean => {
  const lowerCasePath = filePath.toLowerCase();
  return [...IMAGE_EXTENSION_SET].some((extension) => lowerCasePath.endsWith(extension));
};

const ZIP_MIME_TYPES = new Set(["application/zip", "application/x-zip-compressed", "multipart/x-zip"]);

/** - 파일이 Zip 파일인지 검사
 *  - 확장자 검사와 MIME 타입 검사를 모두 수행하여 신뢰성 향상
 */
export const isZipFile = (file: File): boolean => {
  const lowerCaseFileName = file.name.toLowerCase();
  return lowerCaseFileName.endsWith(".zip") || ZIP_MIME_TYPES.has(file.type);
};

/** 노드 ID 생성 */
const createNodeId = (nodePath: string): string => `node:${nodePath}`;

/*** 폴더 경로에 해당하는 폴더 노드가 존재하지 않으면 생성하여 반환, 이미 존재하면 기존 노드 반환
 ** 예시: "src/components/Button" 경로가 folderPath로 주어지면 "src", "src/components", "src/components/Button" 폴더 노드가 순차적으로 생성되고 최종적으로 "src/components/Button" 노드 반환
 * @param folderPath 생성 또는 반환할 폴더 노드의 경로
 * @param rootNodes 트리의 최상위 노드 배열, 새로운 폴더 노드는 이 배열 또는 그 하위 노드 배열에 추가됨
 * @param folderMap 이미 생성된 폴더 노드를 경로 별로 저장하는 맵 (중복 생성 방지 및 빠른 조회 용도)
 */
const ensureFolderNode = (folderPath: string, rootNodes: FileNode[], folderMap: Map<string, FileNode>): FileNode => {
  const normalizedFolderPath = normalizePath(folderPath);

  // 이미 폴더 노드가 존재하는 경우 해당 노드 반환
  if (folderMap.has(normalizedFolderPath)) {
    return folderMap.get(normalizedFolderPath)!;
  }

  // 폴더 경로를 "/" 기준으로 토큰화하여 트리를 순회하며 필요한 폴더 노드 생성
  const pathTokens = normalizedFolderPath.split("/").filter(Boolean);
  let currentPath = "";
  let currentChildren = rootNodes;
  let currentFolderNode: FileNode | null = null;

  for (const token of pathTokens) {
    currentPath = currentPath ? `${currentPath}/${token}` : token;

    // 현재 경로에 해당하는 폴더 노드가 존재하지 않으면 새로 생성하여 트리에 추가
    if (!folderMap.has(currentPath)) {
      const createdFolderNode: FileNode = {
        id: createNodeId(currentPath),
        name: token,
        type: "folder",
        path: currentPath,
        children: [],
        isBinary: false,
      };

      folderMap.set(currentPath, createdFolderNode);
      currentChildren.push(createdFolderNode);
    }

    currentFolderNode = folderMap.get(currentPath)!;
    currentChildren = currentFolderNode.children ?? [];
    currentFolderNode.children = currentChildren;
  }
  return currentFolderNode!;
};

/*** 파일 트리를 폴더 우선, 이름 오름차순으로 정렬하는 함수
 ** 재귀적으로 모든 하위 노드에도 동일한 정렬 적용
 */
const sortTreeRecursively = (nodes: FileNode[]): FileNode[] => {
  const sortedNodes = [...nodes].sort((leftNode, rightNode) => {
    // 폴더가 파일보다 먼저 오도록 정렬
    if (leftNode.type !== rightNode.type) {
      return leftNode.type === "folder" ? -1 : 1;
    }
    // 이름을 기준으로 오름차순 정렬
    return leftNode.name.localeCompare(rightNode.name);
  });

  const recursivelySortedNodes = sortedNodes.map((node) => {
    if (node.type === "folder" && node.children) {
      return {...node, children: sortTreeRecursively(node.children)};
    }

    return node;
  });
  return recursivelySortedNodes;
};

/** Zip 파일을 JSZip 활용해 파싱하여 파일 트리에 적합한 구조로 변환 */
export const parseZipFileToTree = async (zipFile: File): Promise<FileNode[]> => {
  const parsedZip = await JSZip.loadAsync(zipFile);

  const rootNodes: FileNode[] = [];
  const folderMap = new Map<string, FileNode>();

  for (const zipEntry of Object.values(parsedZip.files)) {
    const normalizedEntryPath = normalizePath(zipEntry.name);
    if (!normalizedEntryPath) {
      continue;
    }

    if (zipEntry.dir) {
      ensureFolderNode(normalizedEntryPath, rootNodes, folderMap);
      continue;
    }

    const lastSlashIndex = normalizedEntryPath.lastIndexOf("/");
    const parentFolderPath = lastSlashIndex >= 0 ? normalizedEntryPath.slice(0, lastSlashIndex) : "";
    const fileName = lastSlashIndex >= 0 ? normalizedEntryPath.slice(lastSlashIndex + 1) : normalizedEntryPath;
    const isBinary = isBinaryImageFile(normalizedEntryPath);

    let fileContent = "";
    if (isBinary) {
      const base64Content = await zipEntry.async("base64");
      const mimeType = normalizedEntryPath.toLowerCase().endsWith(".png") ? "image/png" : "image/jpeg";
      fileContent = `data:${mimeType};base64,${base64Content}`;
    } else {
      fileContent = await zipEntry.async("string");
    }

    const fileNode: FileNode = {
      id: createNodeId(normalizedEntryPath),
      name: fileName,
      type: "file",
      path: normalizedEntryPath,
      content: fileContent,
      isBinary,
    };

    if (!parentFolderPath) {
      rootNodes.push(fileNode);
      continue;
    }

    const parentFolderNode = ensureFolderNode(parentFolderPath, rootNodes, folderMap);
    parentFolderNode.children = [...(parentFolderNode.children ?? []), fileNode];
  }

  return sortTreeRecursively(rootNodes);
};

/** 데이터 URL에서 Base64 부분을 추출하는 함수 */
const extractBase64FromDataUrl = (dataUrl: string): string => {
  const commaIndex = dataUrl.indexOf(",");
  const base64Part = commaIndex >= 0 ? dataUrl.slice(commaIndex + 1) : dataUrl;
  return base64Part;
};

/*** 파일 트리를 순회하며 각 노드를 Zip 인스턴스에 추가하는 재귀 함수
 ** 폴더 노드는 폴더로 추가, 파일 노드는 일반 텍스트 또는 Base64 바이너리로 추가
 */
const appendNodesToZip = (zipInstance: JSZip, nodes: FileNode[]) => {
  for (const node of nodes) {
    if (node.type === "folder") {
      zipInstance.folder(node.path);
      if (node.children && node.children.length > 0) {
        appendNodesToZip(zipInstance, node.children);
      }
      continue;
    }

    if (node.isBinary) {
      const base64Content = extractBase64FromDataUrl(node.content ?? "");
      zipInstance.file(node.path, base64Content, {base64: true});
      continue;
    }

    zipInstance.file(node.path, node.content ?? "");
  }
};

/** 파일 트리를 Zip 파일로 변환하여 Blob 형태로 반환 >> 다운로드 링크 생성에 활용 */
export const createZipBlobFromTree = async (nodes: FileNode[]): Promise<Blob> => {
  const zipInstance = new JSZip();
  appendNodesToZip(zipInstance, nodes);
  return zipInstance.generateAsync({type: "blob"});
};
