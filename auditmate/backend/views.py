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

UPLOAD_DIR = os.path.join(settings.BASE_DIR, "Upload_file")

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
            metadata_info = {"lastModified": "알 수 없음", "progress": 0}

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
                "lastModified": metadata_info.get("lastModified", "알 수 없음"),
                "progress": progress,  # 계산된 진행도 반영
            })

    return JsonResponse(result, safe=False)

def download_file(request, folder_name, file_name):
    file_path = os.path.join(UPLOAD_DIR, folder_name, file_name)

    if not os.path.exists(file_path):
        raise Http404("File not found")

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
