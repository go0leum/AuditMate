import React, { useState, useRef, useEffect, useContext } from "react";
import styled from "styled-components";

import { DrawerContext } from "../../context/DrawerContext";
import { RuleContext } from "../../context/RuleContext";

import Table from "./Table";
import RowContainer from "./RowContainer";
import RowItem from "../common/RowItem";
import TagDropdown from "../common/TagDropdown";
import EditDocumentList from "./EditDocumentList";

// 스타일 컴포넌트
const Overlay = styled.div`
  display: ${({ open }) => (open ? 'block' : 'none')};
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.2);
`;

const Container = styled.div`
  background-color: #FFFFFF;
`;

const SidebarWrapper = styled.div`
  background-color: #FFFFFF;
  border-left: 1px solid #B5B7C0;
  position: fixed;
  top: 0;
  bottom: 0;
  right: 0;
  color: #202020;
  height: 100%;
  z-index: 99;
  width: ${({ width }) => width || 750}px;
  transform: ${({ $isOpen }) =>
    $isOpen ? 'translateX(0)' : 'translateX(100%)'};
  transition: transform 0.5s cubic-bezier(0.4,0,0.2,1);
  will-change: transform;
  overflow-y: scroll;
`;

const Content = styled.div`
  padding: 20px;
  position: relative;
  display: flex;
  width: 100%;
  flex-direction: column;
  gap: 20px;
  box-sizing: border-box;
`;

const Section = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  gap: 10px;
  height: auto;
`;

const Title = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  color: #0647A9;
  font-size: 16px;
  font-family: 'NanumGothic', sans-serif;
  font-weight: 600;
  word-wrap: break-word;
`;

const Wrapper = styled.div`
  align-self: stretch;
  display: inline-flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  gap: 15px;
`;

const RuleDrawer = ({open = false, width = 750, onClose, initialIndex = 0, sortedData}) => {
  const { sideRef } = useContext(DrawerContext);
  const { debounceSaveRules } = useContext(RuleContext);
  
  const RuleDrawerRef = useRef();

  const rule = sortedData[initialIndex];

  const [categoryRuleData, setCategoryRuleData] = useState(rule["categoryRule"] || {});
  const [documentRuleData, setDocumentRuleData] = useState(rule["documentRule"] || {});
  const [selectedCategory, setSelectedCategory] = useState('인건비'); // 예시: 세목명
  const [selectedProof, setSelectedProof] = useState('전자세금계산서'); // 예시: 증빙구분
  const [selectedDocName, setSelectedDocName] = useState(null);

  const columns = [
    { label: '증빙구분', width: 105 },
    { label: '세목명', width: 105 },
  ];

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(e) {
      if (RuleDrawerRef.current && !RuleDrawerRef.current.contains(e.target)) {
        onClose?.();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open, onClose]);

  console.log("RuleDrawer opened with rule:", rule);
  console.log("Category Rule Data:", categoryRuleData);
  console.log("Document Rule Data:", documentRuleData);

  // 세목별 서류
  const phaseDocs = documentRuleData["세목별서류"]?.[selectedCategory] || {};
  // 증빙구분별 서류
  const proofDocs = documentRuleData["증빙구분별서류"]?.[selectedProof] || {};

  // 선택된 서류의 기입항목
  const docFields = selectedDocName && documentRuleData["서류별기입항목"]
    ? { [selectedDocName]: documentRuleData["서류별기입항목"][selectedDocName] || [] }
    : {};

  // 값이 바뀔 때마다 호출
  debounceSaveRules(categoryRuleData, documentRuleData);

  return (
    <>
      <Overlay open={open} onClick={onClose} />
      <Container style={{ pointerEvents: open ? "auto" : "none" }}>
        <SidebarWrapper ref={sideRef} $isOpen={open} $width={width}>
          <Content>
            <Wrapper>
              <Title>증빙 구분 & 세목명 수정</Title>
              <Section>
                <EditDocumentList
                  ruleData={categoryRuleData}
                  onRuleChange={setCategoryRuleData}
                  disableSelect={true} // 클릭 불가
                />
              </Section>
            </Wrapper>
            <Wrapper>
              <Title>검토자료 규칙 수정</Title>
              <Table columns={columns} width="250px">
                <RowContainer $width="250px">
                  <RowItem $width={105}>
                    <TagDropdown
                      options={Object.keys(documentRuleData["증빙구분별서류"])}
                      value={selectedProof}
                      onSelect={setSelectedProof}
                    />
                  </RowItem>
                  <RowItem width={105}>
                    <TagDropdown
                      options={Object.keys(documentRuleData["세목별서류"])}
                      value={selectedCategory}
                      onSelect={setSelectedCategory}
                    />
                  </RowItem>
                </RowContainer>
              </Table>
              <Section>
                <EditDocumentList
                  title="세목별 서류"
                  ruleData={phaseDocs}
                  setSelectedDocName={setSelectedDocName}
                  selectedDocName={selectedDocName}
                  onRuleChange={newDocs => {
                    // 상위 documentRule의 세목별서류를 갱신
                    setDocumentRuleData(prev => ({
                      ...prev,
                      세목별서류: {
                        ...prev["세목별서류"],
                        [selectedCategory]: newDocs
                      }
                    }));
                  }}
                />
              </Section>
              <Section>
                <EditDocumentList
                  title="증빙구분별 서류"
                  ruleData={proofDocs}
                  setSelectedDocName={setSelectedDocName}
                  selectedDocName={selectedDocName}
                  onRuleChange={newDocs => {
                    setDocumentRuleData(prev => ({
                      ...prev,
                      증빙구분별서류: {
                        ...prev["증빙구분별서류"],
                        [selectedProof]: newDocs
                      }
                    }));
                  }}
                />
              </Section>
              <Section>
                <EditDocumentList
                  title={selectedDocName ? `"${selectedDocName}" 기입항목` : "서류별 기입항목"}
                  ruleData={docFields}
                  onRuleChange={newFields => {
                    setDocumentRuleData(prev => ({
                      ...prev,
                      서류별기입항목: {
                        ...prev["서류별기입항목"],
                        ...newFields
                      }
                    }));
                  }}
                />
              </Section>
            </Wrapper>
          </Content>
        </SidebarWrapper>
      </Container>
    </>
  );
};

export default RuleDrawer;