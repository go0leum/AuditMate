# AuditMate 소프트웨어 전체 시퀀스 다이어그램

## 1. 애플리케이션 시작 및 초기화

```mermaid
sequenceDiagram
    participant User as 사용자
    participant Browser as 브라우저
    participant App as React App
    participant FileContext as FileContext
    participant TableContext as TableContext
    participant RuleContext as RuleContext
    participant Backend as Django Backend
    participant FileSystem as 파일 시스템

    User->>Browser: 애플리케이션 접속
    Browser->>App: React 앱 로드
    App->>FileContext: FileProvider 초기화
    App->>TableContext: TableProvider 초기화
    App->>RuleContext: RuleProvider 초기화
    
    FileContext->>Backend: GET /api/list-files/
    Backend->>FileSystem: Upload_file 폴더 스캔
    FileSystem-->>Backend: 폴더 목록 반환
    Backend->>FileSystem: 각 폴더의 metadata.json 읽기
    FileSystem-->>Backend: 메타데이터 반환
    Backend->>FileSystem: Excel 파일 진행도 계산
    FileSystem-->>Backend: 진행도 정보 반환
    Backend-->>FileContext: 파일 목록 및 메타데이터
    
    RuleContext->>Backend: GET /api/list-rules/
    Backend->>FileSystem: Rule_file 폴더 스캔
    FileSystem-->>Backend: 규칙 폴더 목록 반환
    Backend->>FileSystem: document_rule.json, category_rule.json 읽기
    FileSystem-->>Backend: 규칙 데이터 반환
    Backend-->>RuleContext: 규칙 목록
    
    App->>Browser: RecentFile 페이지 렌더링
    Browser-->>User: 메인 화면 표시
```

## 2. 파일 업로드 프로세스

```mermaid
sequenceDiagram
    participant User as 사용자
    participant RecentFile as RecentFile 페이지
    participant UploadModal as UploadFileModal
    participant FileContext as FileContext
    participant Backend as Django Backend
    participant FileSystem as 파일 시스템

    User->>RecentFile: "파일 업로드" 버튼 클릭
    RecentFile->>UploadModal: 모달 열기
    UploadModal-->>User: 파일 선택 다이얼로그 표시
    
    User->>UploadModal: Excel 파일 선택
    UploadModal->>FileContext: handleUpload("file") 호출
    FileContext->>Backend: POST /api/upload-files/
    Note over FileContext,Backend: multipart/form-data로 파일 전송
    
    Backend->>FileSystem: 파일 저장
    FileSystem-->>Backend: 저장 완료
    Backend->>FileSystem: metadata.json 생성
    FileSystem-->>Backend: 메타데이터 생성 완료
    Backend-->>FileContext: 업로드 성공 응답
    
    FileContext->>FileContext: fileData 상태 업데이트
    FileContext-->>RecentFile: 파일 목록 새로고침
    RecentFile-->>User: 업로드된 파일 표시
```

## 3. 규칙 업로드 프로세스

```mermaid
sequenceDiagram
    participant User as 사용자
    participant RuleList as RuleList 페이지
    participant UploadRuleModal as UploadRuleModal
    participant RuleContext as RuleContext
    participant Backend as Django Backend
    participant FileSystem as 파일 시스템

    User->>RuleList: "규칙 업로드" 버튼 클릭
    RuleList->>UploadRuleModal: 모달 열기
    UploadRuleModal-->>User: 파일 선택 다이얼로그 표시
    
    User->>UploadRuleModal: 규칙 파일들 선택
    UploadRuleModal->>RuleContext: handleUpload("rule") 호출
    RuleContext->>Backend: POST /api/upload-rules/
    Note over RuleContext,Backend: multipart/form-data로 파일 전송
    
    Backend->>FileSystem: 규칙 파일들 저장
    FileSystem-->>Backend: 저장 완료
    Backend->>FileSystem: document_rule.json, category_rule.json 생성
    FileSystem-->>Backend: 규칙 파일 생성 완료
    Backend-->>RuleContext: 업로드 성공 응답
    
    RuleContext->>RuleContext: ruleData 상태 업데이트
    RuleContext-->>RuleList: 규칙 목록 새로고침
    RuleList-->>User: 업로드된 규칙 표시
```

## 4. 파일 검토 프로세스

```mermaid
sequenceDiagram
    participant User as 사용자
    participant RecentFile as RecentFile 페이지
    participant ReviewTable as ReviewTable 페이지
    participant TableContext as TableContext
    participant RuleContext as RuleContext
    participant Backend as Django Backend
    participant FileSystem as 파일 시스템

    User->>RecentFile: 파일 행 클릭
    RecentFile->>ReviewTable: /reviewTable/:file_name로 네비게이션
    ReviewTable->>TableContext: selectedXlsxFile 설정
    TableContext->>Backend: POST /api/read-xlsx/
    Note over TableContext,Backend: folderName, xlsxFile 전송
    
    Backend->>FileSystem: Excel 파일 읽기
    FileSystem-->>Backend: Excel 데이터 반환
    Backend->>Backend: 데이터 정규화 (검토사항 배열 변환)
    Backend-->>TableContext: 정규화된 데이터 반환
    
    ReviewTable->>RuleContext: 규칙 데이터 요청
    RuleContext->>Backend: GET /api/category-rule/, /api/document-rule/
    Backend->>FileSystem: 규칙 파일들 읽기
    FileSystem-->>Backend: 규칙 데이터 반환
    Backend-->>RuleContext: 규칙 데이터 반환
    
    TableContext->>ReviewTable: tableData 상태 업데이트
    RuleContext->>ReviewTable: 규칙 데이터 상태 업데이트
    ReviewTable-->>User: 검토 테이블 표시
```

## 5. 데이터 편집 및 저장 프로세스

```mermaid
sequenceDiagram
    participant User as 사용자
    participant ReviewTable as ReviewTable 페이지
    participant TableDrawer as TableDrawer
    participant TableContext as TableContext
    participant Backend as Django Backend
    participant FileSystem as 파일 시스템

    User->>ReviewTable: 행 더블클릭
    ReviewTable->>TableDrawer: 드로어 열기
    TableDrawer-->>User: 편집 폼 표시
    
    User->>TableDrawer: 데이터 편집
    TableDrawer->>TableContext: debouncedSave 호출
    Note over TableDrawer,TableContext: 0.1초 디바운스
    
    TableContext->>Backend: POST /api/save-xlsx/
    Note over TableContext,Backend: folderName, xlsxFile, data 전송
    
    Backend->>FileSystem: Excel 파일 업데이트
    FileSystem-->>Backend: 저장 완료
    Backend->>FileSystem: metadata.json의 lastModified 업데이트
    FileSystem-->>Backend: 메타데이터 업데이트 완료
    Backend-->>TableContext: 저장 성공 응답
    
    User->>TableDrawer: "저장" 버튼 클릭
    TableDrawer->>TableContext: fetchExcelData 호출
    TableContext->>Backend: POST /api/read-xlsx/
    Backend->>FileSystem: 최신 데이터 읽기
    FileSystem-->>Backend: 업데이트된 데이터 반환
    Backend-->>TableContext: 최신 데이터 반환
    TableContext->>ReviewTable: tableData 상태 업데이트
    ReviewTable-->>User: 업데이트된 테이블 표시
```

## 6. 파일 다운로드 프로세스

```mermaid
sequenceDiagram
    participant User as 사용자
    participant RecentFile as RecentFile 페이지
    participant FileContext as FileContext
    participant Backend as Django Backend
    participant FileSystem as 파일 시스템
    participant Browser as 브라우저

    User->>RecentFile: 파일 선택 (체크박스)
    RecentFile->>FileContext: selectedFiles 상태 업데이트
    
    User->>RecentFile: "다운로드" 버튼 클릭
    RecentFile->>FileContext: handleCheckExport("file") 호출
    FileContext-->>User: 검토사항/메모 포함 여부 확인
    
    User->>FileContext: 포함 여부 선택
    FileContext->>Backend: GET /api/download/:folderName/:fileName/
    Note over FileContext,Backend: type 파라미터 전송 (full/no_review)
    
    Backend->>FileSystem: Excel 파일 읽기
    FileSystem-->>Backend: 원본 데이터 반환
    Backend->>Backend: 데이터 처리 (검토사항/메모 포함/제외)
    Backend->>Backend: 새로운 Excel 파일 생성
    Backend-->>FileContext: 파일 스트림 반환
    
    FileContext->>Browser: 파일 다운로드 트리거
    Browser-->>User: 파일 다운로드 완료
```

## 7. 규칙 다운로드 프로세스

```mermaid
sequenceDiagram
    participant User as 사용자
    participant RuleList as RuleList 페이지
    participant RuleContext as RuleContext
    participant Backend as Django Backend
    participant FileSystem as 파일 시스템
    participant Browser as 브라우저

    User->>RuleList: 규칙 선택 (체크박스)
    RuleList->>RuleContext: selectedRules 상태 업데이트
    
    User->>RuleList: "다운로드" 버튼 클릭
    RuleList->>RuleContext: handleCheckExport("rule") 호출
    RuleContext->>Backend: GET /api/download-rule/:folderName/
    
    Backend->>FileSystem: 규칙 폴더 읽기
    FileSystem-->>Backend: 규칙 파일들 반환
    Backend->>Backend: ZIP 파일 생성
    Backend-->>RuleContext: ZIP 파일 스트림 반환
    
    RuleContext->>Browser: 파일 다운로드 트리거
    Browser-->>User: ZIP 파일 다운로드 완료
```

## 8. 파일 삭제 프로세스

```mermaid
sequenceDiagram
    participant User as 사용자
    participant RecentFile as RecentFile 페이지
    participant FileContext as FileContext
    participant Backend as Django Backend
    participant FileSystem as 파일 시스템

    User->>RecentFile: 파일 선택 (체크박스)
    RecentFile->>FileContext: selectedFiles 상태 업데이트
    
    User->>RecentFile: "삭제" 버튼 클릭
    RecentFile-->>User: 삭제 확인 다이얼로그 표시
    
    User->>RecentFile: 삭제 확인
    RecentFile->>FileContext: handleCheckDelete("file") 호출
    FileContext->>Backend: DELETE /api/delete-file/:folderName/
    
    Backend->>FileSystem: 폴더 및 파일 삭제
    FileSystem-->>Backend: 삭제 완료
    Backend-->>FileContext: 삭제 성공 응답
    
    FileContext->>FileContext: fileData 상태 업데이트
    FileContext-->>RecentFile: 파일 목록 새로고침
    RecentFile-->>User: 삭제된 파일 제거된 목록 표시
```

## 9. 규칙 삭제 프로세스

```mermaid
sequenceDiagram
    participant User as 사용자
    participant RuleList as RuleList 페이지
    participant RuleContext as RuleContext
    participant Backend as Django Backend
    participant FileSystem as 파일 시스템

    User->>RuleList: 규칙 선택 (체크박스)
    RuleList->>RuleContext: selectedRules 상태 업데이트
    
    User->>RuleList: "삭제" 버튼 클릭
    RuleList-->>User: 삭제 확인 다이얼로그 표시
    
    User->>RuleList: 삭제 확인
    RuleList->>RuleContext: handleCheckDelete("rule") 호출
    RuleContext->>Backend: DELETE /api/delete-rule/:folderName/
    
    Backend->>FileSystem: 규칙 폴더 삭제
    FileSystem-->>Backend: 삭제 완료
    Backend-->>RuleContext: 삭제 성공 응답
    
    RuleContext->>RuleContext: ruleData 상태 업데이트
    RuleContext-->>RuleList: 규칙 목록 새로고침
    RuleList-->>User: 삭제된 규칙 제거된 목록 표시
```

## 10. 검색 및 필터링 프로세스

```mermaid
sequenceDiagram
    participant User as 사용자
    participant ReviewTable as ReviewTable 페이지
    participant TableContext as TableContext

    User->>ReviewTable: 검색어 입력
    ReviewTable->>ReviewTable: searchTerm 상태 업데이트
    ReviewTable->>ReviewTable: 필터링된 데이터 계산
    ReviewTable-->>User: 필터링된 결과 표시
    
    User->>ReviewTable: 필터 드롭다운 선택
    ReviewTable->>ReviewTable: filterValue 상태 업데이트
    ReviewTable->>ReviewTable: 필터링된 데이터 계산
    ReviewTable-->>User: 필터링된 결과 표시
    
    User->>ReviewTable: 컬럼 헤더 클릭 (정렬)
    ReviewTable->>ReviewTable: sortValue 상태 업데이트
    ReviewTable->>ReviewTable: 정렬된 데이터 계산
    ReviewTable-->>User: 정렬된 결과 표시
```

## 주요 컴포넌트 설명

### Frontend (React)
- **App.js**: 메인 라우팅 및 Context Provider 설정
- **RecentFile.js**: 파일 목록 관리 페이지
- **ReviewTable.js**: Excel 데이터 검토 페이지
- **RuleList.js**: 규칙 관리 페이지
- **TableDrawer.js**: 데이터 편집 드로어

### Context (상태 관리)
- **FileContext**: 파일 업로드, 다운로드, 삭제 관리
- **TableContext**: Excel 데이터 로드, 저장, 편집 관리
- **RuleContext**: 규칙 데이터 관리
- **DrawerContext**: 드로어 상태 관리

### Backend (Django)
- **views.py**: API 엔드포인트 처리
- **settings.py**: Django 설정
- **urls.py**: URL 라우팅

### 주요 API 엔드포인트
- `GET /api/list-files/`: 파일 목록 조회
- `GET /api/list-rules/`: 규칙 목록 조회
- `POST /api/upload-files/`: 파일 업로드
- `POST /api/upload-rules/`: 규칙 업로드
- `POST /api/read-xlsx/`: Excel 파일 읽기
- `POST /api/save-xlsx/`: Excel 파일 저장
- `GET /api/download/:folderName/:fileName/`: 파일 다운로드
- `DELETE /api/delete-file/:folderName/`: 파일 삭제
- `DELETE /api/delete-rule/:folderName/`: 규칙 삭제 