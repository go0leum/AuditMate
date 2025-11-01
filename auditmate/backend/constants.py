"""
AuditMate Backend 상수 정의
"""

# 파일 및 폴더 관련 상수
WORKSHEET_NAME = "집행내역"
ALLOWED_EXTENSIONS = [".xlsx", ".xls"]
METADATA_FILENAME = "metadata.json"

# 컬럼명 상수
REVIEW_COLUMNS = ["검토사항", "메모"]
CORE_COLUMNS = ["검토사항", "메모", "보완사항"]
PROGRESS_COLUMN = "검토사항"

# 헤더 탐지용 공통 컬럼들
COMMON_HEADER_COLUMNS = [
    '번호', '사용일자', '집행실행일자', '항목', '내역', '금액', '집행금액', 
    '적요', '증빙구분', '집행용도', '비목명', '세목명', '거래처명', '예금주명',
    '취소사유', '답변', '회계연도', 'N', '사업집행일자', '집행내역', 
    '집행구분', '세부', '예산', '거래처명', '예금주명', '인출액(B)', 
    '입금액(C)', '집행금액(A+B)-C', '보완사항', '검토사항', '메모'
]

# HTTP 응답 메시지 상수
class Messages:
    # 성공 메시지
    UPLOAD_SUCCESS = "파일이 성공적으로 업로드되었습니다"
    DELETE_SUCCESS = "{}이(가) 성공적으로 삭제되었습니다"
    SAVE_SUCCESS = "변경사항이 성공적으로 저장되었습니다"
    RULE_UPLOAD_SUCCESS = "검토 규칙이 성공적으로 업로드되었습니다"
    RULE_SAVE_SUCCESS = "검토 규칙이 성공적으로 저장되었습니다"
    RULE_NAME_UPDATE_SUCCESS = "규칙명이 성공적으로 변경되었습니다"
    RULE_DELETE_SUCCESS = "{} 검토 규칙이 성공적으로 삭제되었습니다"
    EXCEL_READ_SUCCESS = "엑셀 파일을 성공적으로 불러왔습니다"
    
    # 에러 메시지
    UPLOAD_DIR_NOT_EXISTS = "업로드 폴더를 찾을 수 없습니다. 시스템 관리자에게 문의하세요"
    RULE_DIR_NOT_EXISTS = "검토 규칙 폴더를 찾을 수 없습니다. 시스템 관리자에게 문의하세요"
    WORKSHEET_NOT_FOUND = 'Excel 파일에 "{}" 시트를 찾을 수 없습니다. 시트명을 확인해주세요'
    FILE_NOT_FOUND = "요청한 파일을 찾을 수 없습니다"
    FOLDER_NOT_EXISTS = "지정된 폴더가 존재하지 않습니다"
    RULE_FOLDER_NOT_EXISTS = "검토 규칙 폴더가 존재하지 않습니다"
    METADATA_NOT_EXISTS = "파일 정보(metadata.json)가 존재하지 않습니다"
    
    UPLOAD_FAILED = '파일 업로드에 실패했습니다. Excel 파일의 "정렬 및 필터" 기능을 모두 해제하고 "단일 시트"로 저장한 후 다시 시도해주세요'
    EXCEL_FILTER_ERROR = 'Excel 파일에 정렬 또는 필터 조건이 적용되어 있어 읽을 수 없습니다. Excel에서 모든 정렬/필터를 해제하고 다시 업로드해주세요'
    EXCEL_EXPORT_ERROR = "Excel 파일 내보내기 중 오류가 발생했습니다: {}"
    
    INVALID_REQUEST_METHOD = "지원하지 않는 요청 방식입니다"
    MISSING_REQUIRED_INFO = "필수 입력 정보가 누락되었습니다"
    MISSING_FILENAME = "파일명이 제공되지 않았습니다"
    MISSING_FOLDER_RULE_NAME = "폴더명과 규칙명을 모두 입력해주세요"
    MISSING_FOLDER_NAME = "폴더명을 입력해주세요"
    
    CORE_COLUMNS_MISSING = "필수 컬럼이 누락되었습니다: {}. 자동으로 생성합니다"

# 기본값 상수
DEFAULT_METADATA_STRUCTURE = {
    "folderName": None,
    "xlsxFile": None,
    "lastModified": None,
    "progress": 0,
    "ruleName": None,
    "columnLine": 0,
}