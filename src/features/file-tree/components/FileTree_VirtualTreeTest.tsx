"use client";

import {DragEvent, KeyboardEvent, MouseEvent, useEffect, useMemo, useRef, useState} from "react";

import * as S from "@/src/features/file-tree/components/FileTree.styles";

import {useFileStore} from "@/src/store/useFileStore";
import {useEditorStore} from "@/src/store/useEditorStore";
import {CustomModal} from "@/src/features/custom-modal";
import {useHandleZipUpload} from "@/src/features/zip-handler";
import {AddFileIcon, AddFolderIcon, CollapseIcon, DeleteIcon, RenameIcon, UploadIcon} from "@/src/common/icon";
import {HiddenFileInput} from "@/app/page.styles";
import {useThemeStore} from "@/src/store/useThemeStore";
import {useRenameFile} from "../hooks/useRenameFile";
import {useAddFileFolder} from "../hooks/useAddFileFolder";
import {useDeleteFileFolder} from "../hooks/useDeleteFileFolder";
import {FileNode} from "@/src/types/fileType";

const TREE_ROW_HEIGHT = 36;
const TREE_OVERSCAN_COUNT = 8;

type TreeVirtualRow =
  | {kind: "node"; key: string; node: FileNode; depth: number}
  | {kind: "pending-root-file"; key: string}
  | {kind: "pending-root-folder"; key: string}
  | {kind: "pending-folder-file"; key: string; depth: number; parentPath: string}
  | {kind: "pending-folder-folder"; key: string; depth: number; parentPath: string};

const collectFolderPaths = (nodes: FileNode[]): string[] => {
  const folderPaths: string[] = [];

  for (const node of nodes) {
    if (node.type !== "folder") {
      continue;
    }

    folderPaths.push(node.path);

    if (node.children && node.children.length > 0) {
      folderPaths.push(...collectFolderPaths(node.children));
    }
  }

  return folderPaths;
};

const getAncestorFolderPaths = (targetPath: string): string[] => {
  const pathParts = targetPath.split("/").filter(Boolean);
  if (pathParts.length <= 1) {
    return [];
  }

  const ancestors: string[] = [];
  for (let index = 0; index < pathParts.length - 1; index += 1) {
    ancestors.push(pathParts.slice(0, index + 1).join("/"));
  }

  return ancestors;
};

function FileTree() {
  const fileTree = useFileStore((state) => state.fileTree);
  const revealTargetPath = useFileStore((state) => state.showInTreeTargetPath);
  const revealSignal = useFileStore((state) => state.showSignal);
  const selectedFileFolderPath = useEditorStore((state) => state.selectedFileFolderPath);
  const setActiveFilePath = useEditorStore((state) => state.setActiveFilePath);
  const openFileTab = useEditorStore((state) => state.openFileTab);
  const hasNodes = useMemo(() => fileTree.length > 0, [fileTree]);
  const theme = useThemeStore((state) => state.theme);
  const treeScrollAreaRef = useRef<HTMLDivElement | null>(null);
  const pendingRootAddInputRef = useRef<HTMLInputElement | null>(null);
  const pendingRootAddFolderInputRef = useRef<HTMLInputElement | null>(null);

  const [isHovering, setIsHovering] = useState(false);
  const [isTreeAlertOpen, setIsTreeAlertOpen] = useState(false);
  const [treeErrMsg, setTreeErrMsg] = useState("");

  const [collapsedFolderPathSet, setCollapsedFolderPathSet] = useState<Set<string>>(new Set());
  const [scrollTop, setScrollTop] = useState(0);
  const [viewportHeight, setViewportHeight] = useState(0);

  const {handleZipFileDrop, handleZipFileInputChange} = useHandleZipUpload();

  // 파일/폴더 커스텀 훅 설정
  const {
    pendingAddTargetFolderPath,
    pendingAddInputValue,
    setPendingAddInputValue,
    handleAddFileSubmit,
    handleAddFileCancel,
    handleAddFileBtnClick,
    pendingAddFolderTargetFolderPath,
    pendingAddFolderInputValue,
    setPendingAddFolderInputValue,
    handleAddFolderSubmit,
    handleAddFolderCancel,
    handleAddFolderBtnClick,
  } = useAddFileFolder({
    fileTree,
    selectedFileFolderPath,
    onInvalidAddFileName: () => {
      setTreeErrMsg("파일 이름에는 특수문자 /와 \\를 사용할 수 없습니다.");
      setIsTreeAlertOpen(true);
    },
    onOverlapFileName: () => {
      setTreeErrMsg("같은 이름의 파일이 이미 존재합니다.");
      setIsTreeAlertOpen(true);
    },
    onInvalidAddFolderName: () => {
      setTreeErrMsg("폴더 이름에는 특수문자 /와 \\를 사용할 수 없습니다.");
      setIsTreeAlertOpen(true);
    },
    onOverlapFolderName: () => {
      setTreeErrMsg("같은 이름의 폴더가 이미 존재합니다.");
      setIsTreeAlertOpen(true);
    },
  });

  // 파일/폴더 이름 변경 커스텀 훅 설정
  const {
    renamingTargetPath,
    renameInputValue,
    setRenameInputValue,
    handleRenameSubmit,
    handleRenameCancel,
    handleRenameBtnClick,
  } = useRenameFile({
    treeScrollAreaRef,
    fileTree,
    selectedFileFolderPath,
    onInvalidRenameName: () => {
      setTreeErrMsg("파일 이름에는 특수문자 /와 \\를 사용할 수 없습니다.");
      setIsTreeAlertOpen(true);
      handleRenameCancel();
    },
  });

  // 파일/폴더 삭제 커스텀 훅 설정
  const {isDeleteConfirmOpen, deleteConfirmMessage, handleDeleteBtnClick, handleDeleteConfirm, handleDeleteCancel} =
    useDeleteFileFolder({
      fileTree,
      selectedFileFolderPath,
      treeScrollAreaRef,
    });

  // 트리에 ZIP 파일 드래그&드롭 추가 관련
  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "copy";
  };
  const handleDragLeave = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };
  const executeDropAndProcessResult = async (event: DragEvent<HTMLDivElement>) => {
    const result = await handleZipFileDrop(event);
    if (result && !result.success) {
      setTreeErrMsg(result.error || "알 수 없는 오류가 발생했습니다.");
      setIsTreeAlertOpen(true);
    }
  };

  const handleCloseTreeAlert = () => {
    setIsTreeAlertOpen(false);
    setTreeErrMsg("");
  };

  const handleCollapseAllFolders = () => {
    setCollapsedFolderPathSet(new Set(collectFolderPaths(fileTree)));
  };

  const handleTreeScrollAreaClick = (event: MouseEvent<HTMLDivElement>) => {
    const eventTarget = event.target as HTMLElement;
    if (eventTarget.closest("[data-file-path]")) {
      return;
    }

    setActiveFilePath(null);
  };

  // pendingAddTargetFolderPath가 null (root 위치에 파일/폴더추가하는 경우)
  useEffect(() => {
    if (pendingAddTargetFolderPath !== null || !pendingRootAddInputRef.current) {
      return;
    }

    pendingRootAddInputRef.current.focus();
  }, [pendingAddTargetFolderPath]);

  useEffect(() => {
    if (pendingAddFolderTargetFolderPath !== null || !pendingRootAddFolderInputRef.current) {
      return;
    }

    pendingRootAddFolderInputRef.current.focus();
  }, [pendingAddFolderTargetFolderPath]);

  const handlePendingAddInputKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handleAddFileSubmit();
      return;
    }

    if (event.key === "Escape") {
      event.preventDefault();
      handleAddFileCancel();
    }
  };

  const handlePendingAddFolderInputKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handleAddFolderSubmit();
      return;
    }

    if (event.key === "Escape") {
      event.preventDefault();
      handleAddFolderCancel();
    }
  };

  useEffect(() => {
    if (!hasNodes) {
      setCollapsedFolderPathSet(new Set());
    }
  }, [hasNodes]);

  useEffect(() => {
    if (!revealTargetPath || revealSignal === 0) {
      return;
    }

    const ancestors = getAncestorFolderPaths(revealTargetPath);
    if (ancestors.length === 0) {
      return;
    }

    setCollapsedFolderPathSet((previousSet) => {
      if (previousSet.size === 0) {
        return previousSet;
      }

      let hasChanged = false;
      const nextSet = new Set(previousSet);
      for (const ancestorPath of ancestors) {
        if (nextSet.delete(ancestorPath)) {
          hasChanged = true;
        }
      }

      return hasChanged ? nextSet : previousSet;
    });
  }, [revealSignal, revealTargetPath]);

  const virtualRows = useMemo<TreeVirtualRow[]>(() => {
    const rows: TreeVirtualRow[] = [];

    const traverseTreeNodes = (nodes: FileNode[], depth: number) => {
      for (const node of nodes) {
        rows.push({kind: "node", key: node.id, node, depth});

        if (node.type !== "folder") {
          continue;
        }

        const isCollapsed = collapsedFolderPathSet.has(node.path);
        if (isCollapsed) {
          continue;
        }

        if (node.children && node.children.length > 0) {
          traverseTreeNodes(node.children, depth + 1);
        }

        if (pendingAddTargetFolderPath === node.path) {
          rows.push({
            kind: "pending-folder-file",
            key: `pending-folder-file:${node.path}`,
            depth: depth + 1,
            parentPath: node.path,
          });
        }

        if (pendingAddFolderTargetFolderPath === node.path) {
          rows.push({
            kind: "pending-folder-folder",
            key: `pending-folder-folder:${node.path}`,
            depth: depth + 1,
            parentPath: node.path,
          });
        }
      }
    };

    traverseTreeNodes(fileTree, 0);

    if (pendingAddTargetFolderPath === null) {
      rows.push({kind: "pending-root-file", key: "pending-root-file"});
    }

    if (pendingAddFolderTargetFolderPath === null) {
      rows.push({kind: "pending-root-folder", key: "pending-root-folder"});
    }

    return rows;
  }, [collapsedFolderPathSet, fileTree, pendingAddFolderTargetFolderPath, pendingAddTargetFolderPath]);

  const visibleRowIndexByPath = useMemo(() => {
    const indexByPath = new Map<string, number>();

    virtualRows.forEach((row, index) => {
      if (row.kind === "node") {
        indexByPath.set(row.node.path, index);
      }
    });

    return indexByPath;
  }, [virtualRows]);

  useEffect(() => {
    if (!revealTargetPath || revealSignal === 0) {
      return;
    }

    const targetIndex = visibleRowIndexByPath.get(revealTargetPath);
    const container = treeScrollAreaRef.current;
    if (targetIndex === undefined || !container) {
      return;
    }

    const rowTop = targetIndex * TREE_ROW_HEIGHT;
    const rowBottom = rowTop + TREE_ROW_HEIGHT;
    const viewportTop = container.scrollTop;
    const viewportBottom = viewportTop + container.clientHeight;

    if (rowTop < viewportTop) {
      container.scrollTop = rowTop;
      return;
    }

    if (rowBottom > viewportBottom) {
      container.scrollTop = rowBottom - container.clientHeight;
    }
  }, [revealSignal, revealTargetPath, visibleRowIndexByPath]);

  useEffect(() => {
    const container = treeScrollAreaRef.current;
    if (!container) {
      return;
    }

    const updateViewportHeight = () => {
      setViewportHeight(container.clientHeight);
    };

    updateViewportHeight();

    const resizeObserver = new ResizeObserver(updateViewportHeight);
    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
    };
  }, [hasNodes]);

  const totalRows = virtualRows.length;
  const rawStartIndex = Math.floor(scrollTop / TREE_ROW_HEIGHT) - TREE_OVERSCAN_COUNT;
  const startIndex = Math.max(0, rawStartIndex);
  const endIndex = Math.min(
    totalRows - 1,
    Math.ceil((scrollTop + viewportHeight) / TREE_ROW_HEIGHT) + TREE_OVERSCAN_COUNT,
  );
  const visibleRows = totalRows === 0 ? [] : virtualRows.slice(startIndex, endIndex + 1);

  const topSpacerHeight = startIndex * TREE_ROW_HEIGHT;
  const bottomSpacerHeight = Math.max(0, (totalRows - endIndex - 1) * TREE_ROW_HEIGHT);

  const toggleFolderExpanded = (folderPath: string) => {
    setCollapsedFolderPathSet((previousSet) => {
      const nextSet = new Set(previousSet);
      if (nextSet.has(folderPath)) {
        nextSet.delete(folderPath);
      } else {
        nextSet.add(folderPath);
      }

      return nextSet;
    });
  };

  const handleClickTreeNode = (node: FileNode) => {
    if (node.type === "folder") {
      toggleFolderExpanded(node.path);
      setActiveFilePath(node.path);
      return;
    }

    openFileTab(node.path);
  };

  return (
    <S.TreeContainer $themeMode={theme}>
      <S.TreeHeader $themeMode={theme}>
        <h3>파일 탐색기</h3>
        {hasNodes && (
          <S.TreeHeaderButtonWrapper>
            {/* 이름 변경 모드 토글 */}
            <S.TreeHeaderButton
              $themeMode={theme}
              aria-label="Rename"
              title="Rename / F2"
              onMouseDown={(event) => {
                event.preventDefault();
              }}
              onClick={handleRenameBtnClick}
            >
              <RenameIcon />
            </S.TreeHeaderButton>

            {/* 삭제 */}
            <S.TreeHeaderButton
              $themeMode={theme}
              aria-label="Delete"
              title="Delete / Del"
              onClick={handleDeleteBtnClick}
            >
              <DeleteIcon />
            </S.TreeHeaderButton>

            {/* 파일 추가 */}
            <S.TreeHeaderButton
              $themeMode={theme}
              aria-label="Add File"
              title="Add File"
              onClick={handleAddFileBtnClick}
            >
              <AddFileIcon />
            </S.TreeHeaderButton>

            {/* 폴더 추가 */}
            <S.TreeHeaderButton
              $themeMode={theme}
              aria-label="Add Folder"
              title="Add Folder"
              onClick={handleAddFolderBtnClick}
            >
              <AddFolderIcon />
            </S.TreeHeaderButton>

            {/* 모든 폴더 접기 */}
            <S.TreeHeaderButton
              $themeMode={theme}
              aria-label="Collapse All"
              title="Collapse All Folders"
              onClick={handleCollapseAllFolders}
            >
              <CollapseIcon />
            </S.TreeHeaderButton>
          </S.TreeHeaderButtonWrapper>
        )}
      </S.TreeHeader>
      {!hasNodes && (
        <>
          <HiddenFileInput id="zip-upload-input" type="file" accept=".zip" onChange={handleZipFileInputChange} />
          <label htmlFor="zip-upload-input" style={{height: "100%", display: "flex", flexDirection: "column"}}>
            <S.EmptyTreeContainer
              $themeMode={theme}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={executeDropAndProcessResult}
              $isHovering={isHovering}
              onMouseOver={() => {
                if (!hasNodes) {
                  setIsHovering(true);
                }
              }}
              onMouseOut={() => {
                if (!hasNodes) {
                  setIsHovering(false);
                }
              }}
            >
              <S.EmptyMessageContainer $themeMode={theme}>
                <S.UploadGuide $themeMode={theme}>
                  <UploadIcon />
                  <p>여기를 클릭하거나 드래그&드롭을 통해</p>
                  <p>Zip 파일을 업로드하면</p>
                  <p>트리가 표시됩니다.</p>
                </S.UploadGuide>
              </S.EmptyMessageContainer>
            </S.EmptyTreeContainer>
          </label>
        </>
      )}
      {hasNodes && (
        <S.TreeScrollArea
          ref={treeScrollAreaRef}
          $themeMode={theme}
          $isHovering={isHovering}
          onClick={handleTreeScrollAreaClick}
          onScroll={(event) => {
            setScrollTop(event.currentTarget.scrollTop);
          }}
          onMouseOver={() => {
            if (hasNodes) {
              setIsHovering(true);
            }
          }}
          onMouseOut={() => {
            if (hasNodes) {
              setIsHovering(false);
            }
          }}
        >
          <div style={{height: `${topSpacerHeight}px`}} />

          {visibleRows.map((row) => {
            if (row.kind === "node") {
              const {node, depth} = row;
              const isFolder = node.type === "folder";
              const isActive = node.path === selectedFileFolderPath;
              const isRenaming = node.path === renamingTargetPath;
              const isExpanded = isFolder && !collapsedFolderPathSet.has(node.path);

              return (
                <S.TreeNodeDiv
                  key={row.key}
                  $depth={depth}
                  $isActive={isActive}
                  $themeMode={theme}
                  onClick={() => {
                    if (isRenaming) {
                      return;
                    }
                    handleClickTreeNode(node);
                  }}
                  data-file-path={node.path}
                  style={{height: `${TREE_ROW_HEIGHT}px`, boxSizing: "border-box"}}
                >
                  {isFolder ? (
                    <S.FolderPrefix>{isExpanded ? "📂" : "📁"}</S.FolderPrefix>
                  ) : (
                    <S.FolderPrefix>📄</S.FolderPrefix>
                  )}

                  {isRenaming ? (
                    <S.RenameInputWrapper onClick={(event) => event.stopPropagation()}>
                      <S.RenameInput
                        $themeMode={theme}
                        value={renameInputValue}
                        autoFocus
                        onChange={(event) => setRenameInputValue(event.target.value)}
                        onBlur={handleRenameSubmit}
                        onKeyDown={(event) => {
                          if (event.key === "Enter") {
                            event.preventDefault();
                            handleRenameSubmit();
                            return;
                          }

                          if (event.key === "Escape") {
                            event.preventDefault();
                            handleRenameCancel();
                          }
                        }}
                      />
                      <S.RenameCancelButton
                        type="button"
                        $themeMode={theme}
                        aria-label="Cancel rename"
                        title="Cancel rename"
                        onMouseDown={(event) => {
                          event.preventDefault();
                        }}
                        onClick={(event) => {
                          event.stopPropagation();
                          handleRenameCancel();
                        }}
                      >
                        ×
                      </S.RenameCancelButton>
                    </S.RenameInputWrapper>
                  ) : (
                    <p>{node.name}</p>
                  )}
                </S.TreeNodeDiv>
              );
            }

            if (row.kind === "pending-root-file" || row.kind === "pending-folder-file") {
              const rowDepth = row.kind === "pending-root-file" ? 0 : row.depth;

              return (
                <S.TreeNodeDiv
                  key={row.key}
                  $depth={rowDepth}
                  $isActive={false}
                  $themeMode={theme}
                  style={{height: `${TREE_ROW_HEIGHT}px`, boxSizing: "border-box"}}
                >
                  <S.FolderPrefix>📄</S.FolderPrefix>
                  <S.RenameInputWrapper onClick={(event) => event.stopPropagation()}>
                    <S.RenameInput
                      ref={row.kind === "pending-root-file" ? pendingRootAddInputRef : undefined}
                      $themeMode={theme}
                      value={pendingAddInputValue}
                      onChange={(event) => setPendingAddInputValue(event.target.value)}
                      onBlur={handleAddFileSubmit}
                      onKeyDown={handlePendingAddInputKeyDown}
                    />
                  </S.RenameInputWrapper>
                </S.TreeNodeDiv>
              );
            }

            const rowDepth = row.kind === "pending-root-folder" ? 0 : row.depth;

            return (
              <S.TreeNodeDiv
                key={row.key}
                $depth={rowDepth}
                $isActive={false}
                $themeMode={theme}
                style={{height: `${TREE_ROW_HEIGHT}px`, boxSizing: "border-box"}}
              >
                <S.FolderPrefix>📁</S.FolderPrefix>
                <S.RenameInputWrapper onClick={(event) => event.stopPropagation()}>
                  <S.RenameInput
                    ref={row.kind === "pending-root-folder" ? pendingRootAddFolderInputRef : undefined}
                    $themeMode={theme}
                    value={pendingAddFolderInputValue}
                    onChange={(event) => setPendingAddFolderInputValue(event.target.value)}
                    onBlur={handleAddFolderSubmit}
                    onKeyDown={handlePendingAddFolderInputKeyDown}
                  />
                </S.RenameInputWrapper>
              </S.TreeNodeDiv>
            );
          })}

          <div style={{height: `${bottomSpacerHeight}px`}} />
        </S.TreeScrollArea>
      )}
      <CustomModal isOpen={isTreeAlertOpen} onClose={handleCloseTreeAlert} message={treeErrMsg} />
      <CustomModal
        modalType="confirm"
        isOpen={isDeleteConfirmOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        message={deleteConfirmMessage}
      />
    </S.TreeContainer>
  );
}

export {FileTree};
