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
import io

UPLOAD_DIR = os.path.join(settings.BASE_DIR, "Upload_file")
RULE_DIR = os.path.join(settings.BASE_DIR, "Rule_file")

def calculate_progress(df):
    """
    '검토내용' 열을 기준으로 진행도를 계산합니다.
    진행도 = 마지막으로 채워진 행의 인덱스 / 전체 행 수 * 100
    """
    if "검토내용" in df.columns:
        total_rows = len(df)
        if total_rows == 0:
            return 0
        filled_rows = df[df["검토내용"].notna()].index.max() + 1 if not df[df["검토내용"].notna()].empty else 0
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
            sub_folders = [f for f in os.listdir(folder_path) if os.path.isdir(os.path.join(folder_path, f))]

            xlsx_file = xlsx_files[0] if xlsx_files else None
            sub_folder = sub_folders[0] if sub_folders else "없음"

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
                "documentDir": sub_folder,
                "lastModified": metadata_info["lastModified"],
                "progress": progress,  # 계산된 진행도 반영
                "ruleName": metadata_info["ruleName"],
            })

    return JsonResponse(result, safe=False)

def list_rules(request):
    if not os.path.exists(RULE_DIR):
        return JsonResponse({"error": "Rule_file 폴더가 존재하지 않습니다."}, status=404)

    result = []
    upload_time = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
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

        os.makedirs(upload_dir, exist_ok=True)  # 업로드 폴더 생성

        metadata = {
            "folderName": upload_time,
            "xlsxFile": None,
            "documentDir": [],
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

        # ZIP 파일 처리
        if "attachment_folder" in request.FILES:
            zip_file = request.FILES["attachment_folder"]
            zip_path = os.path.join(upload_dir, zip_file.name)

            try:
                # ZIP 파일 저장
                fs.save(zip_file.name, zip_file)

                # ZIP 압축 해제
                with zipfile.ZipFile(zip_path, "r") as zip_ref:
                    zip_ref.extractall(upload_dir)

                # 폴더 내부 파일 저장
                extracted_files = []
                for root, _, files in os.walk(upload_dir):
                    for file in files:
                        extracted_files.append(os.path.join(root, file))

                metadata["documentDir"] = extracted_files

                # ZIP 파일 삭제 (선택 사항)
                os.remove(zip_path)

            except Exception as e:
                print(f"ZIP 파일 처리 오류: {e}")
                return JsonResponse({"error": "ZIP 파일 처리 실패"}, status=500)
        
        # 진행도 계산 (Excel 파일에서 "검토내용" 열 기준)
        if metadata["xlsxFile"]:
            try:
                df = pd.read_excel(os.path.join(upload_dir, metadata["xlsxFile"]))
                metadata["progress"] = calculate_progress(df)
                metadata["lastModified"] = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            except Exception as e:
                print(f"Excel 진행도 계산 오류: {e}")
        
        # Rule_file에서 첫번째 폴더 이름 가져오기
        rule_name = None
        if os.path.exists(RULE_DIR):
            rule_folders = [f for f in os.listdir(RULE_DIR) if os.path.isdir(os.path.join(RULE_DIR, f))]
            if rule_folders:
                rule_name = rule_folders[0]
        
        metadata["ruleName"] = rule_name

        # metadata.json 생성
        with open(os.path.join(upload_dir, "metadata.json"), "w", encoding="utf-8") as f:
            json.dump(metadata, f, ensure_ascii=False, indent=4)

        return JsonResponse({"message": "파일 업로드 성공", "metadata": metadata})

    return JsonResponse({"error": "잘못된 요청"}, status=400)


@csrf_exempt
def read_xlsx(request):
    expected_columns = [
        '집행실행일자', '증빙구분', '집행용도', '비목명', '세목명',
        '거래처명', '예금주명', '집행금액', '검토내용', '메모', '보완사항'
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

            df = pd.read_excel(file_path)
            df.columns = df.columns.str.strip()
            df = df.replace({np.nan: None})

            # '검토내용' 컬럼이 문자열이면 dict로 변환
            if "검토내용" in df.columns:
                def parse_review(val):
                    if isinstance(val, str):
                        try:
                            return json.loads(val)
                        except Exception:
                            return val
                    return val
                df["검토내용"] = df["검토내용"].apply(parse_review)

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

            if list(df.columns) != expected_columns:
                return JsonResponse({
                    'status': 'warning',
                    'message': '엑셀 파일의 컬럼명이 예상과 다릅니다. 컬럼명을 다음과 같이 수정해 주세요.',
                    'data': None,
                    'expected_columns': expected_columns,
                    'actual_columns': list(df.columns)
                }, status=200, safe=False, json_dumps_params={'ensure_ascii': False})

            data = df.to_dict(orient='records')
            return JsonResponse({
                'status': 'success',
                'data': data,
                'message': '엑셀 파일을 성공적으로 읽었습니다.',
                'expected_columns': expected_columns,
                'actual_columns': list(df.columns)
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
        upload_time = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
        rule_name = request.POST.get("rule_name")
        rule_dir = os.path.join(RULE_DIR, rule_name)
        os.makedirs(rule_dir, exist_ok=True)

        metadata = {
            "folderName": upload_time,
            "ruleName": None,
            "documentRule": None,
            "categoryRule": None,
            "uploadTime": upload_time,
        }

        fs = FileSystemStorage(location=rule_dir)

        # 규칙 이름
        if rule_name:
            metadata["ruleName"] = rule_name
            metadata["folderName"] = rule_name

        # document_rule.json 저장
        if "document_rule" in request.FILES:
            document_rule_file = request.FILES["document_rule"]
            doc_rule_path = fs.save("document_rule.json", document_rule_file)
            metadata["documentRule"] = doc_rule_path

        # category_rule.json 저장
        if "category_rule" in request.FILES:
            category_rule_file = request.FILES["category_rule"]
            cat_rule_path = fs.save("category_rule.json", category_rule_file)
            metadata["categoryRule"] = cat_rule_path

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