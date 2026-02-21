# 📦 Zip Code Editor - Feature Based 아키텍처 기반 코드베이스 편집기

**Zip 형태의 코드베이스를 업로드하면 트리 UI로 탐색하고, Monaco Editor로 파일을 편집한 뒤 다시 Zip으로 다운로드할 수 있는 웹 에디터입니다.**

이 프로젝트는 **Next.js 16 + React 19 + Zustand + Monaco Editor + JSZip** 조합으로 구현되었고,
기능 단위로 코드를 분리하는 **Feature Based 아키텍처**를 중심으로 유연하게 설계되었습니다.

---

## 핵심 사용자 흐름과 구현 기능

아래 내용은 단순 기능 나열이 아니라, 실제 사용자 액션 순서대로 어떤 로직이 동작하는지 기준으로 정리했습니다.

### 1. Zip 업로드: 코드베이스 로드 시작

- **User Flow**
  - 사용자가 상단 업로드 버튼 또는 트리 영역 클릭 or Drag&Drop으로 `.zip` 파일 업로드
  - 파일 유효성 검사 후 파싱 시작
  - 트리 렌더링 + 첫 파일 자동 탭 오픈

- **Implementation**
  - `src/features/zip-handler/hooks/useHandleZipUpload.ts`
    - `isZipFile`로 확장자 + MIME 타입 이중 검사
    - `parseZipFileToTree` 결과를 `useFileStore.setFileTree`로 반영
    - 기존 탭 상태 초기화를 위해 `useEditorStore.resetEditorState` 호출
    - 업로드 직후 첫 번째 파일 노드를 찾아 `openFileTab`으로 즉시 편집 흐름 진입
  - 업로드 중 상태는 `useFileStore`의 `isLoading`, `loadingType: "upload"`로 제어

### 2. Zip 파싱 후 트리 구조 생성 로직

- **User Flow**
  - Zip 내부 엔트리를 읽어 폴더/파일 구조를 트리로 변환
  - 폴더 우선, 이름 오름차순 정렬로 일관된 탐색 경험 제공

- **Implementation (핵심 알고리즘)**
  - `src/features/zip-handler/logic/zipService.ts`
    - `JSZip.loadAsync(zipFile)`로 엔트리 파싱
    - `normalizePath`로 경로 표준화(`\\` → `/`, 후행 `/` 제거)
    - `ensureFolderNode`로 누락된 중간 폴더까지 안전하게 생성
    - 파일 엔트리 처리 시:
      - 텍스트 중심 파일: 문자열로 로딩
      - 바이너리 이미지: base64 Data URL(`data:image/...;base64,`)로 로딩
    - 최종적으로 `sortTreeRecursively`를 통해 전체 트리를 재귀 정렬
  - 각 노드는 `FileNode` 타입(`id`, `path`, `type`, `children`, `content`, `isEditableText`, `isBinary`, `haveUnsavedChange`)으로 통일

### 3. 트리 인덱스 기반 탐색 최적화 (재귀 탐색 부담 완화)

- **문제 배경**
  - 트리에서 선택/이름변경/삭제/탭 동기화가 빈번하게 발생하면 매번 재귀 탐색 비용이 누적됨

- **Implementation**
  - `src/features/file-tree/logic/treeHandlingLogic.ts`
    - `buildFileTreeIndex`로 1회 순회 인덱스 생성
      - `nodeByPath`: path → 노드
      - `parentPathByPath`: path → 부모 path
      - `childPathsByPath`: 폴더 path → 직접 자식 path[]
    - `getNodeByPathFromIndex`, `getFileNodeByPathFromIndex`로 O(1) 조회
  - `src/store/useFileStore.ts`
    - `setFileTree` 시 인덱스도 함께 재생성

### 4. 트리에서 선택한 파일이 탭에 나타나고 Monaco에 열리는 과정

- **User Flow**
  - 트리 파일 클릭 → 탭 열림(중복 방지) + 활성 탭 전환 → 에디터 표시

- **Implementation**
  - `src/features/file-tree/components/FileTreeNode.tsx`
    - 파일 클릭 시 `useEditorStore.openFileTab(node.path)` 호출
  - `src/store/useEditorStore.ts`
    - `openFileTab`: 이미 열린 탭이면 재사용, 아니면 배열에 추가
    - 동시에 `selectedFileFolderPath`를 갱신해 활성 경로 동기화
  - `src/features/monaco-editor/components/MonacoEditorContainer.tsx`
    - `selectedFileFolderPath`가 파일이면 `editorActiveFilePath`로 확정
    - 탭 UI 렌더링 + 경로 인디케이터(`a/b/c` → `a > b > c`)

### 5. Monaco Editor 단일 인스턴스 유지 + 모델만 교체하는 방식

- **Implementation**
  - `src/features/monaco-editor/hooks/useMonacoEditorSync.ts`
    - Monaco Editor는 `editorRef`로 **한 번만 생성**
    - 파일별 텍스트 모델은 `modelCacheRef<Map<path, ITextModel>>`에 캐시
    - 탭/선택 변경 시 `editor.setModel(targetModel)`로 모델만 교체

- **이 방식의 이점**
  - 초기화/레이아웃 재계산 최소화로 에디터 재마운트 비용 감소
  - 파일별 undo/redo 히스토리를 모델 단위로 자연스럽게 분리 보존
  - 대규모 파일 전환 시 체감 성능과 반응성이 안정적(현재 단계에서는 안정적일 것으로 강하게 예상..!)
  - 단일 이벤트 파이프라인(`onDidChangeModelContent`) 유지로 상태 동기화 명료화

### 6. 바이너리 vs Editable 구분과 에디터 영역 UI 처리

- **파일 분류 로직**
  - `zipService.ts`
    - `getIsEditableTextFile`: 텍스트 확장자/파일명 세트 기반 편집 가능 판정
    - 이미지 확장자는 `isBinaryImageFile`로 바이너리 판정

- **UI 처리 방식** (`MonacoEditorContainer.tsx`)
  - `activeFile.isBinary === true`: Monaco 대신 이미지 뷰어(`next/image`) 표시
  - `isEditableText === true`: Monaco Host 표시
  - 둘 다 아닌 형식: “이 파일은 열 수 없는 형식입니다.” fallback 표시

### 7. Monaco Undo/Redo와 단축키 바인딩

- **Undo/Redo 동작**
  - 상단 버튼(Undo/Redo)이 `useMonacoEditorSync`에서 전달된 함수 호출
  - 내부적으로 `editor.trigger("top-bar", "undo"/"redo", null)` 실행
  - Monaco 기본 키맵(예: `Ctrl+Z`, `Ctrl+Y`)과 동일한 커맨드 경로를 사용

- **추가 단축키 바인딩**
  - `Ctrl/Cmd + S`: 브라우저 기본 저장 방지 후 현재 모델 내용 flush
  - `Alt/Cmd + W`: 브라우저 탭 닫기 방지 후 현재 파일 탭 닫기
  - 위 로직은 `useMonacoEditorSync.ts`의 `window.keydown` 핸들러로 관리

### 8. 편집/Undo/Redo 시 탭 점 아이콘으로 변경내역 표시(dirty indicator)

- **핵심 원리**
  - Monaco 모델의 `alternativeVersionId`를 저장 시점 baseline으로 보관
  - 현재 모델 버전과 baseline이 다르면 `haveUnsavedChange = true`
  - 같아지면(`undo`로 원복 포함) `haveUnsavedChange = false`

- **Implementation**
  - `useMonacoEditorSync.ts`
    - `savedAlternativeVersionIdByPathRef`에 파일별 저장 baseline 기록
    - `onDidChangeModelContent`에서 dirty 여부 계산 후
      `useFileStore.setHaveUnsavedChangeByPath` 호출
  - `MonacoEditorContainer.tsx`
    - 열린 탭별 `haveUnsavedChange`를 `unsavedByPath`로 매핑
    - `UnsavedDot` 컴포넌트 가시성으로 점 아이콘 표시/숨김

### 9. 파일/폴더 추가 · 삭제 · 이름 변경 구현

- **추가(Add)**
  - `src/features/file-tree/hooks/useAddFileFolder.ts`
    - 현재 선택 경로를 기준으로 대상 폴더 계산(파일이면 부모 폴더)
    - 이름 검증: 빈값/중복/`/` `\\` 금지
    - `appendFileNodeToTargetFolder`, `appendFolderNodeToTargetFolder`로 트리 갱신
    - 파일 추가 시 탭 자동 오픈, 폴더 추가 시 해당 폴더 활성화

- **삭제(Delete)**
  - `src/features/file-tree/hooks/useDeleteFileFolder.ts`
    - `Delete` 키와 버튼 모두 지원
    - 폴더 삭제 시 하위 전체 삭제 확인 모달 표시
    - `removeNodeByPath`로 트리에서 제거 후
      `removeOpenedFileFolderPathsByPrefix`로 관련 탭 일괄 정리

- **이름 변경(Rename)**
  - `src/features/file-tree/hooks/useRenameFile.ts`
    - `F2`로 진입/제출 지원
    - `updateTargetFileNodeInTree`로 대상 + 하위 경로 일괄 재매핑
    - `replaceOpenedFilePath`로 열린 탭 경로와 활성 경로 동기화
    - 변경 후 트리 자동 reveal 처리로 사용자 위치 유지

---

## Zip 다운로드 구현 형태

- `src/features/zip-handler/hooks/useHandleZipDownload.ts`
  - 최신 트리를 `useFileStore.getState()`로 비구독 조회
  - `createZipBlobFromTree`로 Blob 생성
  - `URL.createObjectURL` + 임시 `<a>` 클릭으로 다운로드 트리거
  - 다운로드 파일명: `edited-project.zip`

- `src/features/zip-handler/logic/zipService.ts`
  - 트리 재귀 순회(`appendNodesToZip`)
  - 폴더는 `zip.folder(path)`
  - 텍스트 파일은 문자열로 저장
  - 바이너리 파일은 Data URL에서 base64만 추출해 `{ base64: true }`로 저장

---

## 아키텍처: 유연한 Feature Based 구조

이 프로젝트는 엄격한 FSD 템플릿을 그대로 복제하기보다,
**기능 단위 응집도**를 높이고 **교차 관심사(store, common UI)**를 별도 레이어로 분리해,
유연성과 실용성을 함께 챙길 수 있도록 Feature Based 구조를 채택했습니다.

### 구조 원칙

- `src/features/*`: 사용자 유즈케이스 단위 모듈 (zip-handler, file-tree, monaco-editor, theme, custom-modal)
- 각 feature 내부를 `components / hooks / logic`으로 재분리
  - `components`: UI 렌더링
  - `hooks`: 상태 orchestration, 이벤트 처리
  - `logic`: 순수 함수/트리 변환/경로 연산 등
- `src/store/*`: 전역 상태를 도메인별로 분리 (파일, 에디터, 테마)
- `src/common/*`: 공통 컴포넌트/아이콘

### 이 구조를 통해 얻은 효과

- 기능 추가 시 변경 범위를 해당 feature 내부로 제한하기 쉬움
- 트리 조작, Zip 처리, Monaco 동기화 같은 복잡 로직을 독립적으로 테스트/리팩터링 가능
- 전역 상태와 UI 관심사를 분리해 재사용성과 유지보수성 향상

---

## 상태 관리 설계 (Zustand)

### `useFileStore`

- `fileTree`, `fileTreeIndex`, 트리에 대한 업로드/다운로드 로딩 상태 등 관리
- 파일에 대한 변경 내용 저장(`updateFileContentByPath`), dirty flag 변경(`setHaveUnsavedChangeByPath`)
- 전체 파일들에 대한 저장되지 않은 변경 존재 여부 계산(`hasUnsavedChanges`)

### `useEditorStore`

- 현재 선택 경로, 열린 탭 목록 관리
- 탭 오픈/닫기/경로 치환/삭제 prefix 일괄정리 제공

### `useThemeStore`

- light/dark 토글 상태 단순 관리

---

## 기술 스택 (Tech Stack)

| Category         | Technology                |
| ---------------- | ------------------------- |
| Framework        | Next.js 16.1 (App Router) |
| Language         | TypeScript 5              |
| UI Styling       | styled-components 6       |
| Editor           | Monaco Editor 0.55        |
| Zip Handling     | JSZip 3.10                |
| State Management | Zustand 5                 |
| Runtime          | React 19                  |
| Linting          | ESLint 9                  |

---

## 폴더 구조

```bash
app/
	layout.tsx
	page.tsx

src/
	common/
		components/
		icon/

	features/
		file-tree/
			components/
			hooks/
			logic/
		monaco-editor/
			components/
			hooks/
			logic/
		zip-handler/
			hooks/
			logic/
		theme/
		custom-modal/

	store/
		useFileStore.ts
		useEditorStore.ts
		useThemeStore.ts

	types/
		fileType.ts
```

---

## 보완/확장 아이디어

- 텍스트 파일 인코딩 감지(UTF-8 외) 및 변환 처리
- 편집 불가 바이너리 타입(예: PDF) 전용 미리보기 확장
- 대형 코드베이스 대응용 가상화 트리(`FileTree_VirtualTreeTest.tsx`) 본 적용
- 검색/필터 기반 파일 빠른 이동(Command Palette 스타일)
