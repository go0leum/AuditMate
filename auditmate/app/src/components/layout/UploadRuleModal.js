import { useRef, useContext } from "react";
import styled from "styled-components";

import { FileContext } from "../../context/FileContext";
import Button from "../common/Button";
import InputField from "../common/InputField";

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  z-index: 200;
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
  height: 400px;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
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

const Title = styled.h2`
  font-size: 20px;
  margin-bottom: 20px;
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

const ButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 10px;
`;

const UploadRuleModal = ({ isOpen, onClose }) => {
  const {
    documentRule,
    categoryRule,
    setDocumentRule,
    setCategoryRule,
    handleUpload,
    ruleName,
    setRuleName
  } = useContext(FileContext);

  // ref 생성
  const documentRuleInputRef = useRef();
  const categoryRuleInputRef = useRef();

  const handleUploadAndClose = () => {
    handleUpload("rule");
    onClose();
  };

  return (
    isOpen && (
      <ModalOverlay>
        <ModalContent>
          <Title>파일 업로드</Title>
          <InputContainer>
            <Label>규칙 이름</Label>
            <div style={{ flexDirection: "row", display: "flex", alignItems: "center", gap: "10px" }}>
              <InputField
                key="ruleName"
                value={ruleName || ""}
                onChange={e => setRuleName(e.target.value)}
                width="430px" height="25px"
              />
            </div>
          </InputContainer>
          <InputContainer>
            <Label>검토 자료 규칙</Label>
            <div style={{ flexDirection: "row", display: "flex", alignItems: "center", gap: "10px" }}>
              <input
                type="file"
                accept=".json"
                ref={documentRuleInputRef}
                style={{ display: "none" }}
                onChange={e => setDocumentRule(e.target.files[0])}
              />
              <Button onClick={() => documentRuleInputRef.current.click()}>
                Upload
              </Button>
              <DisplayBox className={documentRule ? "" : "placeholder"}>
                {documentRule ? documentRule.name : "파일을 선택하세요"}
              </DisplayBox>
            </div>
          </InputContainer>
          <InputContainer>
            <Label>증빙 구분 & 세목명 규칙</Label>
            <div style={{ flexDirection: "row", display: "flex", alignItems: "center", gap: "10px" }}>
              <input
                type="file"
                accept=".json"
                ref={categoryRuleInputRef}
                style={{ display: "none" }}
                onChange={e => setCategoryRule(e.target.files[0])}
              />
              <Button onClick={() => categoryRuleInputRef.current.click()}>
                Upload
              </Button>
              <DisplayBox className={categoryRule ? "" : "placeholder"}>
                {categoryRule ? categoryRule.name : "파일을 선택하세요"}
              </DisplayBox>
            </div>
          </InputContainer>
          <ButtonGroup>
            <Button onClick={onClose}>Cancel</Button>
            <Button onClick={handleUploadAndClose} secondary>Upload</Button>
          </ButtonGroup>
        </ModalContent>
      </ModalOverlay>
    )
  );
};

export default UploadRuleModal;