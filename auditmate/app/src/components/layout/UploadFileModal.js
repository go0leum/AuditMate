import { useContext, useRef, useState } from "react";
import styled from "styled-components";

import { FileContext } from "../../context/FileContext";

import Button from "../common/Button";

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 200;
  background: rgba(0, 0, 0, 0.3);
  display: flex;
  justify-content: center;
  align-items: center;
`;

const ModalContent = styled.div`
  background: white;
  width: 450px;
  height: 300px;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;

const Title = styled.h2`
  font-size: 20px;
  margin-bottom: 15px;
  text-align: left;
`;

const InputContainer = styled.div`
  margin-bottom: 10px;
`;

const Label = styled.label`
  font-size: 16px;
  display: block;
  margin-bottom: 5px;
`;

const DisplayBox = styled.div`
  width: 100%;
  height: 25px;
  padding: 5px 10px;
  background: white;
  border-radius: 4px;
  border: 1px solid #e0e0e0;
  font-size: 14px;
  font-family: "Inter";
  font-weight: 400;
  color: #333;
  display: flex;
  align-items: center;

  &.placeholder {
    color: #b1b1b1;
  }
`;

const DropZone = styled.div`
  width: 100%;
  height: 120px;
  border: 2px dashed ${({ $isDragActive }) => $isDragActive ? '#0647A9' : '#e0e0e0'};
  border-radius: 8px;
  background: ${({ $isDragActive }) => $isDragActive ? '#f0f6ff' : '#fafafa'};
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: #0647A9;
    background: #f0f6ff;
  }
`;

const DropText = styled.div`
  font-size: 14px;
  color: ${({ $isDragActive }) => $isDragActive ? '#0647A9' : '#666'};
  text-align: center;
  font-weight: ${({ $isDragActive }) => $isDragActive ? '600' : '400'};
`;

const FileInfoContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 10px;
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 10px;
`;

const UploadFileModal = ({ isOpen, onClose }) => {
  const { excelFile, setExcelFile, handleUpload, fetchFileData } = useContext(FileContext);
  const [isDragActive, setIsDragActive] = useState(false);

  const excelInputRef = useRef();

  // 파일 유효성 검사
  const validateFile = (file) => {
    if (!file) return false;
    
    // 확장자 검사
    const validExtensions = ['.xlsx', '.xls'];
    const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
    
    if (!validExtensions.includes(fileExtension)) {
      alert('Excel 파일(.xlsx, .xls)만 업로드 가능합니다.');
      return false;
    }
    
    // 파일 크기 검사 (예: 50MB 제한)
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      alert('파일 크기는 50MB 이하만 허용됩니다.');
      return false;
    }
    
    return true;
  };

  // 드래그 이벤트 핸들러
  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      const file = files[0]; // 첫 번째 파일만 사용
      if (validateFile(file)) {
        setExcelFile(file);
      }
    }
  };

  // 파일 선택 핸들러 (기존 방식 + 유효성 검사)
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (validateFile(file)) {
      setExcelFile(file);
    }
  };

  // 드롭존 클릭 핸들러
  const handleDropZoneClick = () => {
    excelInputRef.current?.click();
  };

  // 모달 닫기 + 파일 리셋
  const handleClose = () => {
    setExcelFile(null);
    setIsDragActive(false);
    if (onClose) onClose();
  };

  const handleUploadAndClose = async () => {
    await handleUpload("file");
    await fetchFileData(); // 업로드 후 파일 목록 새로고침
    handleClose(); // 업로드 후 모달 닫기
  };

  return (
    isOpen && (
      <ModalOverlay>
        <ModalContent>
          <Title>파일 업로드</Title>
          <InputContainer>
            <Label>excel 파일</Label>
            
            {/* 드래그 앤 드롭 영역 */}
            <DropZone
              $isDragActive={isDragActive}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={handleDropZoneClick}
            >
              <input
                type="file"
                accept=".xlsx,.xls"
                ref={excelInputRef}
                style={{ display: "none" }}
                onChange={handleFileSelect}
              />
              
              {isDragActive ? (
                <DropText $isDragActive={true}>
                  📁 파일을 여기에 놓으세요
                </DropText>
              ) : (
                <>
                  <DropText>
                    📄 Excel 파일을 드래그하여 놓거나 클릭하세요
                  </DropText>
                  <DropText style={{ fontSize: '12px', color: '#999' }}>
                    .xlsx, .xls 파일만 지원 (최대 50MB)
                  </DropText>
                </>
              )}
            </DropZone>

            {/* 선택된 파일 정보 또는 기존 버튼 방식 */}
            {excelFile ? (
              <FileInfoContainer>
                <DisplayBox>
                  {excelFile.name}
                </DisplayBox>
              </FileInfoContainer>
            ) : (
              <FileInfoContainer>
                <DisplayBox className="placeholder">
                  파일을 선택하세요
                </DisplayBox>
              </FileInfoContainer>
            )}
          </InputContainer>
          <ButtonGroup>
            <Button onClick={handleClose}>Cancel</Button>
            <Button 
              onClick={handleUploadAndClose} 
              secondary
              disabled={!excelFile}
              style={{
                opacity: !excelFile ? 0.5 : 1,
                cursor: !excelFile ? 'not-allowed' : 'pointer'
              }}
            >
              Upload
            </Button>
          </ButtonGroup>
        </ModalContent>
      </ModalOverlay>
    )
  );
};

export default UploadFileModal;