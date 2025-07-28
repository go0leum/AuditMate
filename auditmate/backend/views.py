import os
import json
import datetime
import zipfile
import pandas as pd
import numpy as np
from django.http import JsonResponse, FileResponse, Http404
from django.conf import settings
from django.views.decorators.csrf import csrf_exempt
from django.core.files.storage import FileSystemStorage
from django.views.decorators.http import require_http_methods
import io

UPLOAD_DIR = os.path.join(settings.BASE_DIR, "Upload_file")
RULE_DIR = os.path.join(settings.BASE_DIR, "Rule_file")
CONTACT_DIR = os.path.join(settings.BASE_DIR, "Contact_file")

def calculate_progress(df):
    """
    '검토사항' 열을 기준으로 진행도를 계산합니다.
    진행도 = 마지막으로 채워진 행의 인덱스 / 전체 행 수 * 100
    """
    if "검토사항" in df.columns:
        total_rows = len(df)
        if total_rows == 0:
            return 0
        filled_rows = df[df["검토사항"].notna()].index.max() + 1 if not df[df["검토사항"].notna()].empty else 0
        return round(filled_rows * 100 / total_rows, 2)
    return 0


def list_files(request):
    if not os.path.exists(UPLOAD_DIR):
        return JsonResponse({"error": "Upload_file 폴더가 존재하지 않습니다."}, status=404)

    result = []
    for folder_name in os.listdir(UPLOAD_DIR):
        folder_path = os.path.join(UPLOAD_DIR, folder_name)
        if os.path.isdir(folder_path):  
            xlsx_files = [f for f in os.listdir(folder_path) if f.endswith(".xlsx")]
            xlsx_file = xlsx_files[0] if xlsx_files else None

            metadata_path = os.path.join(folder_path, "metadata.json")
            metadata_info = {}

            # metadata.json 읽기
            if os.path.exists(metadata_path):
                try:
                    with open(metadata_path, "r", encoding="utf-8") as f:
                        metadata_info = json.loads(f.read())  
                except Exception as e:
                    print(f"Metadata 파일 읽기 오류: {e}")

            # 진행도 계산 
            progress = 0
            if xlsx_file:
                try:
                    df = pd.read_excel(os.path.join(folder_path, xlsx_file))
                    progress = calculate_progress(df)

                    # metadata.json 업데이트
                    metadata_info["progress"] = progress
                    with open(metadata_path, "w", encoding="utf-8") as f:
                        json.dump(metadata_info, f, ensure_ascii=False, indent=4)

                except Exception as e:
                    print(f"Excel 진행도 계산 오류: {e}")

            result.append({
                "folderName": folder_name,
                "xlsxFile": xlsx_file,
                "lastModified": metadata_info.get("lastModified", ""),
                "progress": progress,  # 계산된 진행도 반영
                "ruleName": metadata_info.get("ruleName", ""),
            })

    return JsonResponse(result, safe=False)

def list_rules(request):
    if not os.path.exists(RULE_DIR):
        return JsonResponse({"error": "Rule_file 폴더가 존재하지 않습니다."}, status=404)

    result = []
    for folder_name in os.listdir(RULE_DIR):
        folder_path = os.path.join(RULE_DIR, folder_name)
        if os.path.isdir(folder_path):  
            document_rule_path = os.path.join(folder_path, "document_rule.json")
            category_rule_path = os.path.join(folder_path, "category_rule.json")

            if os.path.exists(document_rule_path):
                try:
                    with open(document_rule_path, "r", encoding="utf-8") as f:
                        document_rule = json.load(f)
                except Exception as e:
                    print(f"Rule 파일 읽기 오류: {e}")
                    document_rule = {}
            
            if os.path.exists(category_rule_path):
                try:
                    with open(category_rule_path, "r", encoding="utf-8") as f:
                        category_rule = json.load(f)
                except Exception as e:
                    print(f"Rule 파일 읽기 오류: {e}")
                    category_rule = {}
            
            # uploadTime을 "%Y-%m-%d %H:%M:%S" 형식으로
            upload_time = None
            metadata_path = os.path.join(folder_path, "metadata.json")
            if os.path.exists(metadata_path):
                try:
                    with open(metadata_path, "r", encoding="utf-8") as f:
                        metadata = json.load(f)
                    upload_time = metadata.get("uploadTime")
                except Exception as e:
                    print(f"metadata.json 읽기 오류: {e}")
            if not upload_time:
                upload_time = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")

            result.append({
                "folderName": folder_name,
                "documentRule": document_rule,
                "categoryRule": category_rule,
                "uploadTime": upload_time,
            })

    return JsonResponse(result, safe=False)

def download_file(request, folder_name, file_name):
    file_path = os.path.join(UPLOAD_DIR, folder_name, file_name)

    if not os.path.exists(file_path):
        raise Http404("File not found")

    # type 파라미터 확인
    download_type = request.GET.get('type', 'full')

    # xlsx 파일이면 type에 따라 열 제거
    if file_name.lower().endswith('.xlsx'):
        try:
            import tempfile
            df = pd.read_excel(file_path)
            if download_type == 'no_review':
                # '검토사항', '보완사항', '메모' 열 제외
                cols_to_exclude = ['검토사항', '메모']
                cols_to_keep = [col for col in df.columns if col not in cols_to_exclude]
                df_export = df[cols_to_keep]
            else:
                df_export = df

            # 임시 파일로 저장
            with tempfile.NamedTemporaryFile(suffix='.xlsx', delete=False) as tmp:
                df_export.to_excel(tmp.name, index=False)
                tmp.seek(0)
                response = FileResponse(open(tmp.name, "rb"), as_attachment=True, filename=file_name)
            return response
        except Exception as e:
            return JsonResponse({"error": f"엑셀 내보내기 오류: {str(e)}"}, status=500)

    if os.path.isdir(file_path):
        # 디렉토리라면 zip으로 압축해서 반환
        zip_buffer = io.BytesIO()
        with zipfile.ZipFile(zip_buffer, "w", zipfile.ZIP_DEFLATED) as zip_file:
            for root, _, files in os.walk(file_path):
                for f in files:
                    abs_path = os.path.join(root, f)
                    rel_path = os.path.relpath(abs_path, file_path)
                    zip_file.write(abs_path, arcname=rel_path)
        zip_buffer.seek(0)
        zip_filename = f"{file_name}.zip"
        return FileResponse(zip_buffer, as_attachment=True, filename=zip_filename)
    else:
        return FileResponse(open(file_path, "rb"), as_attachment=True, filename=file_name)

@csrf_exempt
def upload_files(request):
    if request.method == "POST":
        upload_time = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
        upload_dir = os.path.join(UPLOAD_DIR, upload_time)
        os.makedirs(upload_dir, exist_ok=True)

        metadata = {
            "folderName": upload_time,
            "xlsxFile": None,
            "lastModified": upload_time,
            "progress": 0,
            "ruleName": None,
        }

        fs = FileSystemStorage(location=upload_dir)

        # Excel 파일 저장
        if "excel_file" in request.FILES:
            excel_file = request.FILES["excel_file"]
            saved_excel_path = fs.save(excel_file.name, excel_file)
            metadata["xlsxFile"] = saved_excel_path

        # 진행도 계산 (Excel 파일에서 "검토사항" 열 기준)
        if metadata["xlsxFile"]:
            try:
                df = pd.read_excel(os.path.join(upload_dir, metadata["xlsxFile"]))
                metadata["progress"] = calculate_progress(df)
                metadata["lastModified"] = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            except Exception as e:
                # 정렬/필터 등으로 읽기 실패 시 에러 메시지 반환
                return JsonResponse({
                    "status": "error",
                    "message": '업로드에 실패했습니다. xlsx file에 "정렬 및 필터"를 제거해 주시고 "단일 시트"로 변경해주세요.',
                    "error_detail": str(e)
                }, status=400)

        # Rule_file에서 첫번째 폴더 이름 가져오기
        rule_name = None
        if os.path.exists(RULE_DIR):
            rule_folders = [f for f in os.listdir(RULE_DIR) if os.path.isdir(os.path.join(RULE_DIR, f))]
            if rule_folders:
                rule_name = rule_folders[0]
            else:
                rule_name = None  # 폴더가 없으면 None
        else:
            rule_name = None  # Rule_file 폴더가 없으면 None
        
        metadata["ruleName"] = rule_name

        # metadata.json 생성
        with open(os.path.join(upload_dir, "metadata.json"), "w", encoding="utf-8") as f:
            json.dump(metadata, f, ensure_ascii=False, indent=4)

        return JsonResponse({"message": "파일 업로드 성공", "metadata": metadata})

    return JsonResponse({"error": "잘못된 요청"}, status=400)


@csrf_exempt
def read_xlsx(request):
    expected_columns = [
        'N', '항목명', '세부항목명', '교부액', '실집행액', '최종교부액', '초과집행액', '증빙번호', '비고',
        '준수 여부', '단가 (이내)', '기준', '집행실행일자', '증빙구분', '집행용도', '비목명', '세목명',
        '거래처명', '예금주명', '공급가액(A)', '부가세(B)', '집행취소(C)', '집행금액(A+B)-C',
        '취소사유', '검토사항', '메모', '보완사항', '답변', '회계연도', '사업명', '과제명', '예산코드',
        '예산잔액', '세금계산서 발행 여부', '지출 승인자', '지급수단', '증빙파일 존재 여부', '증빙유형 상세',
        '법인카드 번호', '계좌번호', '내부규정 부합 여부', '중복 집행 여부', '거래처 등록 여부',
        '입찰/계약서 존재 여부', '감사 메모', '감사 소견', '지출 사유 요약', '첨부파일명', '업로드 일시',
        '담당자', '반려 사유', '단가', '공급가액', '부가세', '집행취소', '집행금액',
    ]

    if request.method == 'POST':
        try:
            body = json.loads(request.body)
            folderName = body.get('folderName')
            xlsxFile = body.get('xlsxFile')

            if not folderName:
                return JsonResponse({'status': 'error', 'message': 'No filename provided'}, status=400)

            file_path = os.path.join(UPLOAD_DIR, folderName, xlsxFile)

            if not os.path.exists(file_path):
                return JsonResponse({'status': 'error', 'message': 'File not found'}, status=404)

            try:
                df = pd.read_excel(file_path)
            except Exception as e:
                return JsonResponse({
                    'status': 'error',
                    'data': None,
                    'message': '엑셀 파일에 정렬(필터) 조건이 포함되어 있으면 읽을 수 없습니다. 엑셀에서 모든 정렬/필터를 해제하고 다시 업로드 해주세요.',
                    'error_detail': str(e),
                    'expected_columns': expected_columns,
                    'actual_columns': [],
                }, status=500, safe=False, json_dumps_params={'ensure_ascii': False})

            df.columns = df.columns.str.strip()
            df = df.replace({np.nan: None})

            progress = calculate_progress(df)

            metadata_path = os.path.join(UPLOAD_DIR, folderName, "metadata.json")
            if os.path.exists(metadata_path):
                try:
                    with open(metadata_path, "r", encoding="utf-8") as f:
                        metadata = json.load(f)
                    metadata["progress"] = progress
                    metadata["lastModified"] = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                    with open(metadata_path, "w", encoding="utf-8") as f:
                        json.dump(metadata, f, ensure_ascii=False, indent=4)
                except Exception as e:
                    print(f"Metadata 업데이트 오류: {e}")

            actual_columns = list(df.columns)
            extra_columns = [col for col in actual_columns if col not in expected_columns]
            if extra_columns:
                return JsonResponse({
                    'status': 'warning',
                    'message': '엑셀 파일에 예상치 못한 컬럼이 있습니다. 컬럼명을 수정해 주세요.',
                    'data': None,
                    'expected_columns': expected_columns,
                    'actual_columns': actual_columns,
                    'extra_columns': extra_columns
                }, status=200, safe=False, json_dumps_params={'ensure_ascii': False})

            data = df.to_dict(orient='records')
            return JsonResponse({
                'status': 'success',
                'data': data,
                'message': '엑셀 파일을 성공적으로 읽었습니다.',
                'expected_columns': expected_columns,
                'actual_columns': actual_columns
            }, status=200, safe=False, json_dumps_params={'ensure_ascii': False})

        except Exception as e:
            return JsonResponse({
                'status': 'error',
                'data': None,
                'message': str(e),
                'expected_columns': expected_columns,
                'actual_columns': [],
            }, status=500, safe=False, json_dumps_params={'ensure_ascii': False})

    return JsonResponse({
        'status': 'error',
        'message': 'Invalid request method',
        'data': None,
        'expected_columns': expected_columns,
        'actual_columns': [],
    }, status=405, safe=False, json_dumps_params={'ensure_ascii': False})

@csrf_exempt
def save_xlsx(request):
    if request.method == "POST":
        try:
            body = json.loads(request.body)
            folder_name = body.get("folderName")
            xlsx_file = body.get("xlsxFile")
            last_modified = body.get("lastModified")
            data = body.get("data")

            if not folder_name or not xlsx_file or not data:
                return JsonResponse({"status": "error", "message": "필수 정보가 누락되었습니다."}, status=400)

            # 검토사항이 빈값이면 항상 빈 문자열로 저장
            for row in data:
                review = row.get("검토사항")
                if not review or (isinstance(review, list) and len(review) == 0):
                    row["검토사항"] = ""
                elif isinstance(review, list):
                    row["검토사항"] = ", ".join(str(x) for x in review)
                else:
                    row["검토사항"] = str(review)

            file_path = os.path.join(UPLOAD_DIR, folder_name, xlsx_file)

            # DataFrame으로 변환 후 저장
            df = pd.DataFrame(data)
            df.to_excel(file_path, index=False)

            # metadata.json 업데이트
            metadata_path = os.path.join(UPLOAD_DIR, folder_name, "metadata.json")
            if os.path.exists(metadata_path):
                with open(metadata_path, "r", encoding="utf-8") as f:
                    metadata = json.load(f)
            else:
                metadata = {}

            metadata["lastModified"] = last_modified or datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            metadata["progress"] = calculate_progress(df)

            with open(metadata_path, "w", encoding="utf-8") as f:
                json.dump(metadata, f, ensure_ascii=False, indent=4)

            return JsonResponse({"status": "success", "message": "저장 완료"})
        except Exception as e:
            return JsonResponse({"status": "error", "message": str(e)}, status=500)
    return JsonResponse({"status": "error", "message": "Invalid request method"}, status=405)

@csrf_exempt
def upload_rules(request):
    if request.method == "POST":
        upload_time = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        rule_name = request.POST.get("rule_name")
        rule_dir = os.path.join(RULE_DIR, rule_name)
        os.makedirs(rule_dir, exist_ok=True)

        metadata = {
            "folderName": rule_name,
            "ruleName": rule_name,
            "newformat": None,
            "uploadTime": upload_time,
        }

        fs = FileSystemStorage(location=rule_dir)

        # newformat.json 저장
        if "document_rule" in request.FILES:
            newformat_file = request.FILES["document_rule"]
            newformat_path = fs.save("newformat.json", newformat_file)
            metadata["newformat"] = newformat_path

        # metadata.json 저장
        with open(os.path.join(rule_dir, "metadata.json"), "w", encoding="utf-8") as f:
            json.dump(metadata, f, ensure_ascii=False, indent=4)

        return JsonResponse({"message": "규칙 업로드 성공", "metadata": metadata})

    return JsonResponse({"error": "잘못된 요청"}, status=400)

def download_rule_zip(request, folder_name):
    folder_path = os.path.join(RULE_DIR, folder_name)
    if not os.path.isdir(folder_path):
        raise Http404("Rule folder not found")
    zip_buffer = io.BytesIO()
    with zipfile.ZipFile(zip_buffer, "w", zipfile.ZIP_DEFLATED) as zip_file:
        for root, _, files in os.walk(folder_path):
            for f in files:
                abs_path = os.path.join(root, f)
                rel_path = os.path.relpath(abs_path, folder_path)
                zip_file.write(abs_path, arcname=rel_path)
    zip_buffer.seek(0)
    zip_filename = f"{folder_name}.zip"
    return FileResponse(zip_buffer, as_attachment=True, filename=zip_filename)

def category_rule(request):
    # Rule_file 폴더에서 첫 번째 폴더의 category_rule.json을 반환
    import os, json
    RULE_DIR = os.path.join(settings.BASE_DIR, "Rule_file")
    for folder_name in os.listdir(RULE_DIR):
        folder_path = os.path.join(RULE_DIR, folder_name)
        if os.path.isdir(folder_path):
            category_rule_path = os.path.join(folder_path, "category_rule.json")
            if os.path.exists(category_rule_path):
                with open(category_rule_path, "r", encoding="utf-8") as f:
                    data = json.load(f)
                return JsonResponse(data, safe=False)
    return JsonResponse({}, safe=False)

def document_rule(request):
    # Rule_file 폴더에서 첫 번째 폴더의 document_rule.json을 반환
    import os, json
    RULE_DIR = os.path.join(settings.BASE_DIR, "Rule_file")
    for folder_name in os.listdir(RULE_DIR):
        folder_path = os.path.join(RULE_DIR, folder_name)
        if os.path.isdir(folder_path):
            document_rule_path = os.path.join(folder_path, "document_rule.json")
            if os.path.exists(document_rule_path):
                with open(document_rule_path, "r", encoding="utf-8") as f:
                    data = json.load(f)
                return JsonResponse(data, safe=False)
    return JsonResponse({}, safe=False)

@csrf_exempt
def save_rule(request):
    if request.method == "POST":
        try:
            body = json.loads(request.body)
            folder_name = body.get("folderName")
            document_rule = body.get("documentRule")
            category_rule = body.get("categoryRule")

            if not folder_name:
                return JsonResponse({"status": "error", "message": "folderName이 필요합니다."}, status=400)

            rule_folder = os.path.join(RULE_DIR, folder_name)
            os.makedirs(rule_folder, exist_ok=True)

            # document_rule.json 저장
            if document_rule is not None:
                with open(os.path.join(rule_folder, "document_rule.json"), "w", encoding="utf-8") as f:
                    json.dump(document_rule, f, ensure_ascii=False, indent=4)

            # category_rule.json 저장
            if category_rule is not None:
                with open(os.path.join(rule_folder, "category_rule.json"), "w", encoding="utf-8") as f:
                    json.dump(category_rule, f, ensure_ascii=False, indent=4)

            # metadata.json의 lastModified만 업데이트
            metadata_path = os.path.join(rule_folder, "metadata.json")
            if os.path.exists(metadata_path):
                with open(metadata_path, "r", encoding="utf-8") as f:
                    metadata = json.load(f)
            else:
                metadata = {}
            metadata["lastModified"] = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            with open(metadata_path, "w", encoding="utf-8") as f:
                json.dump(metadata, f, ensure_ascii=False, indent=4)

            return JsonResponse({"status": "success", "message": "규칙이 저장되었습니다."})
        except Exception as e:
            return JsonResponse({"status": "error", "message": str(e)}, status=500)
    return JsonResponse({"status": "error", "message": "Invalid request method"}, status=405)

@csrf_exempt
def update_rule_name(request):
    """
    파일의 metadata.json에서 ruleName만 변경하는 함수
    """
    if request.method == "POST":
        try:
            body = json.loads(request.body)
            folder_name = body.get("folderName")
            rule_name = body.get("ruleName")

            if not folder_name or rule_name is None:
                return JsonResponse({"status": "error", "message": "folderName과 ruleName이 필요합니다."}, status=400)

            metadata_path = os.path.join(UPLOAD_DIR, folder_name, "metadata.json")
            if not os.path.exists(metadata_path):
                return JsonResponse({"status": "error", "message": "metadata.json이 존재하지 않습니다."}, status=404)

            with open(metadata_path, "r", encoding="utf-8") as f:
                metadata = json.load(f)

            metadata["ruleName"] = rule_name

            with open(metadata_path, "w", encoding="utf-8") as f:
                json.dump(metadata, f, ensure_ascii=False, indent=4)

            return JsonResponse({"status": "success", "message": "ruleName이 성공적으로 변경되었습니다."})
        except Exception as e:
            return JsonResponse({"status": "error", "message": str(e)}, status=500)
    return JsonResponse({"status": "error", "message": "Invalid request method"}, status=405)

from django.views.decorators.http import require_http_methods

@csrf_exempt
@require_http_methods(["DELETE"])
def delete_file(request, folder_name):
    """
    업로드된 파일 폴더(및 내부 파일 전체) 삭제
    """
    folder_path = os.path.join(UPLOAD_DIR, folder_name)
    if not os.path.exists(folder_path):
        return JsonResponse({"error": "폴더가 존재하지 않습니다."}, status=404)
    try:
        import shutil
        shutil.rmtree(folder_path)
        return JsonResponse({"status": "success", "message": f"{folder_name} 삭제 완료"})
    except Exception as e:
        return JsonResponse({"status": "error", "message": str(e)}, status=500)

@csrf_exempt
@require_http_methods(["DELETE"])
def delete_rule(request, folder_name):
    """
    업로드된 규칙 폴더(및 내부 파일 전체) 삭제
    """
    rule_folder_path = os.path.join(RULE_DIR, folder_name)
    if not os.path.exists(rule_folder_path):
        return JsonResponse({"error": "규칙 폴더가 존재하지 않습니다."}, status=404)
    try:
        import shutil
        shutil.rmtree(rule_folder_path)
        return JsonResponse({"status": "success", "message": f"{folder_name} 규칙 삭제 완료"})
    except Exception as e:
        return JsonResponse({"status": "error", "message": str(e)}, status=500)

@csrf_exempt
def read_contact_info(request):
    """
    Contact_file 폴더의 Contact_info.xlsx 파일을 읽어서 데이터를 반환합니다.
    파일이 없으면 지정된 헤더로 빈 파일을 생성합니다.
    """
    contact_file_path = os.path.join(CONTACT_DIR, "Contact_Info.xlsx")
    required_columns = [
        "상위기관", "사업명", "보조사업자명", "보조사업명", "담당자",
        "전화번호", "이메일", "상태", "마감일", "메모"
    ]

    # Contact_file 폴더가 없으면 생성
    os.makedirs(CONTACT_DIR, exist_ok=True)

    # 파일이 없으면 헤더만 있는 빈 파일 생성
    if not os.path.exists(contact_file_path):
        df = pd.DataFrame(columns=required_columns)
        df.to_excel(contact_file_path, index=False)

    try:
        df = pd.read_excel(contact_file_path)
        # 헤더가 다르면 파일을 덮어씀
        if list(df.columns) != required_columns:
            df = pd.DataFrame(columns=required_columns)
            df.to_excel(contact_file_path, index=False)
        df = df.replace({np.nan: None})
        data = df.to_dict(orient='records')
        return JsonResponse({
            "status": "success",
            "data": data,
            "columns": required_columns,
            "message": "Contact_info.xlsx 파일을 성공적으로 읽었습니다."
        }, status=200, safe=False, json_dumps_params={'ensure_ascii': False})
    except Exception as e:
        print("Contact_info.xlsx 읽기 오류:", str(e))  # <-- 추가
        return JsonResponse({
            "status": "error",
            "message": f"Contact_info.xlsx 읽기 오류: {str(e)}",
            "data": None
        }, status=500)