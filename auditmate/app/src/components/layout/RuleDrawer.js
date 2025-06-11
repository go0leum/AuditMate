import React, { useState, useEffect, useContext, useMemo } from "react";
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

const RuleDrawer = ({open = false, width = 750, onClose}) => {
  const { sideRef } = useContext(DrawerContext);
  const { editRule, setEditRule } = useContext(RuleContext);

  const categoryRule = useMemo(() => editRule?.categoryRule || {}, [editRule]);
  const documentRule = useMemo(() => editRule?.documentRule || {}, [editRule]);

  const [selectedCategory, setSelectedCategory] = useState(
    Object.keys(categoryRule["세목별서류"] || {})[0] || ""
  );
  const [selectedProof, setSelectedProof] = useState(
    Object.keys(documentRule["증빙구분별서류"] || {})[0] || ""
  );
  const [selectedDocName, setSelectedDocName] = useState(null);

  const columns = [
    { label: '증빙구분', width: 105 },
    { label: '세목명', width: 105 },
  ];

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(e) {
      if (sideRef.current && !sideRef.current.contains(e.target)) {
        onClose?.();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open, onClose, sideRef]);

  // 증빙구분/세목이 바뀌면 드롭다운 값도 동기화
  useEffect(() => {
    const firstCategory = Object.keys(categoryRule["세목별서류"] || {})[0] || "";
    if (selectedCategory !== firstCategory) {
      setSelectedCategory(firstCategory);
    }
    // eslint-disable-next-line
  }, [categoryRule]);

  useEffect(() => {
    const firstProof = Object.keys(documentRule["증빙구분별서류"] || {})[0] || "";
    if (selectedProof !== firstProof) {
      setSelectedProof(firstProof);
    }
    // eslint-disable-next-line
  }, [documentRule]);

  // 세목별 서류
  const phaseDocs = documentRule["세목별서류"]?.[selectedCategory] || [];
  // 증빙구분별 서류
  const proofDocs = documentRule["증빙구분별서류"]?.[selectedProof] || [];

  // 선택된 서류의 기입항목
  const docFields = selectedDocName && documentRule["서류별기입항목"]
    ? { [selectedDocName]: documentRule["서류별기입항목"][selectedDocName] || [] }
    : {};

  return (
    <>
      <Overlay open={open} onClick={onClose} />
      <Container style={{ pointerEvents: open ? "auto" : "none" }}>
        <SidebarWrapper ref={sideRef} $isOpen={open} $width={width}>
          <Content>
            <Wrapper $gap="0 0px">
              <Title>증빙 구분 & 세목명 수정</Title>
              <Section>
                <EditDocumentList
                  ruleData={categoryRule}
                  onRuleChange={(newCategoryRule) => {
                    setEditRule(prev => ({
                      ...prev,
                      categoryRule: {
                        ...prev.categoryRule,
                        ...newCategoryRule
                      }
                    }));
                  }}
                  disableSelect={true}
                />
              </Section>
            </Wrapper>
            <Wrapper>
              <Title>검토자료 규칙 수정</Title>
              <Table columns={columns} width="250px">
                <RowContainer $width="250px">
                  <RowItem $width={105}>
                    <TagDropdown
                      options={Object.keys(documentRule["증빙구분별서류"] || {})}
                      value={selectedProof}
                      onSelect={setSelectedProof}
                    />
                  </RowItem>
                  <RowItem width={105}>
                    <TagDropdown
                      options={Object.keys(documentRule["세목별서류"] || {})}
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
                  onRuleChange={(newArr, phase) => {
                    setEditRule(prev => ({
                      ...prev,
                      documentRule: {
                        ...prev.documentRule,
                        세목별서류: {
                          ...prev.documentRule.세목별서류,
                          [phase]: newArr,
                        }
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
                  onRuleChange={(newArr, proof) => {
                    setEditRule(prev => ({
                      ...prev,
                      documentRule: {
                        ...prev.documentRule,
                        증빙구분별서류: {
                          ...prev.documentRule.증빙구분별서류,
                          [proof]: newArr,
                        }
                      }
                    }));
                  }}
                />
              </Section>
              <Section>
                <EditDocumentList
                  title={selectedDocName ? `"${selectedDocName}" 기입항목` : "서류별 기입항목"}
                  ruleData={docFields}
                  onRuleChange={(newArr, docName) => {
                    setEditRule(prev => ({
                      ...prev,
                      documentRule: {
                        ...prev.documentRule,
                        서류별기입항목: {
                          ...prev.documentRule.서류별기입항목,
                          [docName]: newArr,
                        }
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