import { useState, useContext } from "react";
import styled from "styled-components";

import { FileContext } from "../../context/FileContext";

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

const UploadModal = ({ isOpen, onClose }) => {
  const { setExcelFile, setAttachmentFolder, handleUpload } = useContext(FileContext);

  const handleUploadAndClose = () => {
    handleUpload();
    onClose(); // 업로드 후 모달 닫기
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
            <Label>검토 자료 폴더</Label>
            <FileInput
              type="file"
              $webkitdirectory
              $directory
              onChange={(e) => setAttachmentFolder(e.target.files)}
            />
          </InputContainer>
          <ButtonGroup>
            <Button onClick={onClose}>Cancel</Button>
            <Button $primary onClick={handleUploadAndClose}>Upload</Button>
          </ButtonGroup>
        </ModalContent>
      </ModalOverlay>
    )
  );
};

export default UploadModal;