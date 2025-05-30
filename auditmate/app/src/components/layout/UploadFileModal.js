import { useContext, useRef } from "react";
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
  width: 340px;
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

const ButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 10px;
`;

const UploadFileModal = ({ isOpen, onClose }) => {
  const { excelFile, attachmentFolder, setExcelFile, setAttachmentFolder, handleUpload } = useContext(FileContext);

  const excelInputRef = useRef();
  const folderInputRef = useRef();

  const handleUploadAndClose = () => {
    handleUpload("file");
    onClose(); // 업로드 후 모달 닫기
  };

  return (
    isOpen && (
      <ModalOverlay>
        <ModalContent>
          <Title>파일 업로드</Title>
          <InputContainer>
            <Label>excel 파일</Label>
            <div style={{ flexDirection: "row", display: "flex", alignItems: "center", gap: "10px" }}>
              <input
                type="file"
                accept=".xlsx"
                ref={excelInputRef}
                style={{ display: "none" }}
                onChange={(e) => setExcelFile(e.target.files[0])}
              />
              <Button onClick={() => excelInputRef.current.click()}>
                Upload
              </Button>
              <DisplayBox className={excelFile ? "" : "placeholder"}>
                {excelFile ? excelFile.name : "파일을 선택하세요" }
              </DisplayBox>
            </div>
          </InputContainer>
          <InputContainer>
            <Label>검토 자료 폴더</Label>
            <div style={{ flexDirection: "row", display: "flex", alignItems: "center", gap: "10px" }}>
              <input
                type="file"
                accept=".zip"
                ref={folderInputRef}
                style={{ display: "none" }}
                onChange={(e) => setAttachmentFolder(e.target.files)}
              />
              <Button onClick={() => folderInputRef.current.click()}>
                Upload
              </Button>
              <DisplayBox className={attachmentFolder ? "" : "placeholder"}>
                {attachmentFolder? attachmentFolder.name : "파일을 선택하세요"}
              </DisplayBox>
            </div>
          </InputContainer>
          <ButtonGroup>
            <Button onClick={onClose}>Cancel</Button>
            <Button onClick={handleUploadAndClose} secondary>
              Upload
            </Button>
          </ButtonGroup>
        </ModalContent>
      </ModalOverlay>
    )
  );
};

export default UploadFileModal;