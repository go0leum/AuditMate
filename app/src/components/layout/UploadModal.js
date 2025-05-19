import React, { useState } from "react";
import styled from "styled-components";

import Button from "../common/Button";

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.3);
  display: flex;
  justify-content: center;
  align-items: center;
`;

const ModalContent = styled.div`
  background: white;
  width: 450px;
  height: 280px;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;

const Title = styled.h2`
  font-size: 18px;
  margin-bottom: 15px;
  text-align: center;
`;

const InputContainer = styled.div`
  margin-bottom: 10px;
`;

const Label = styled.label`
  font-size: 14px;
  font-weight: bold;
  display: block;
  margin-bottom: 5px;
`;

const FileInput = styled.input`
  width: 100%;
  padding: 5px;
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 10px;
`;

const UploadModal = ({ isOpen, onClose, onUpload }) => {
  const [excelFile, setExcelFile] = useState(null);
  const [attachmentFolder, setAttachmentFolder] = useState(null);

  const handleUpload = () => {
    if (excelFile && attachmentFolder) {
      onUpload({ excelFile, attachmentFolder });
      onClose();
    } else {
      alert("Excel 파일과 첨부파일 폴더를 선택하세요.");
    }
  };

  return (
    isOpen && (
      <ModalOverlay>
        <ModalContent>
          <Title>파일 업로드</Title>
          <InputContainer>
            <Label>검토 내역 excel 파일</Label>
            <FileInput
              type="file"
              accept=".xlsx"
              onChange={(e) => setExcelFile(e.target.files[0])}
            />
          </InputContainer>
          <InputContainer>
            <Label>검토 자료료 폴더</Label>
            <FileInput
              type="file"
              webkitdirectory="true"
              directory="true"
              onChange={(e) => setAttachmentFolder(e.target.files)}
            />
          </InputContainer>
          <ButtonGroup>
            <Button onClick={onClose}>Cancel</Button>
            <Button primary onClick={handleUpload}>Upload</Button>
          </ButtonGroup>
        </ModalContent>
      </ModalOverlay>
    )
  );
};

export default UploadModal;