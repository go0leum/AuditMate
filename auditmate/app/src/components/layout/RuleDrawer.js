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
  z-index: 200;
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
  z-index: 200;
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
  font-family: 'Inter', sans-serif;
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

  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedProof, setSelectedProof] = useState("");
  const [selectedDocName, setSelectedDocName] = useState(null);

  // Drawer가 닫힐 때 선택값 초기화
  useEffect(() => {
    if (!open) {
      setSelectedCategory("");
      setSelectedProof("");
      setSelectedDocName(null);
    }
  }, [open]);

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
                    setEditRule(prev => {
                      let newDocumentRule = { ...prev.documentRule };

                      // 세목명 동기화
                      if (newCategoryRule["세목명"]) {
                        const oldKeys = prev.categoryRule["세목명"] || [];
                        const newKeys = newCategoryRule["세목명"];
                        const added = newKeys.filter(k => !oldKeys.includes(k));
                        const removed = oldKeys.filter(k => !newKeys.includes(k));
                        // 추가
                        added.forEach(k => {
                          if (!(k in newDocumentRule["세목별서류"])) {
                            newDocumentRule["세목별서류"] = {
                              ...newDocumentRule["세목별서류"],
                              [k]: { 사전승인: [], 수행과정: [], 수행확인: [] }
                            };
                          }
                        });
                        // 삭제
                        removed.forEach(k => {
                          if (newDocumentRule["세목별서류"]) {
                            const { [k]: _, ...rest } = newDocumentRule["세목별서류"];
                            newDocumentRule["세목별서류"] = rest;
                          }
                        });
                      }

                      // 증빙구분 동기화
                      if (newCategoryRule["증빙구분"]) {
                        const oldKeys = prev.categoryRule["증빙구분"] || [];
                        const newKeys = newCategoryRule["증빙구분"];
                        const added = newKeys.filter(k => !oldKeys.includes(k));
                        const removed = oldKeys.filter(k => !newKeys.includes(k));
                        // 추가
                        added.forEach(k => {
                          if (!(k in newDocumentRule["증빙구분별서류"])) {
                            newDocumentRule["증빙구분별서류"] = {
                              ...newDocumentRule["증빙구분별서류"],
                              [k]: { 판매사실입증: [], 실지급입증: [], 보완보조서류: [] }
                            };
                          }
                        });
                        // 삭제
                        removed.forEach(k => {
                          if (newDocumentRule["증빙구분별서류"]) {
                            const { [k]: _, ...rest } = newDocumentRule["증빙구분별서류"];
                            newDocumentRule["증빙구분별서류"] = rest;
                          }
                        });
                      }

                      return {
                        ...prev,
                        categoryRule: {
                          ...prev.categoryRule,
                          ...newCategoryRule
                        },
                        documentRule: newDocumentRule
                      };
                    });
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
                      options={categoryRule["증빙구분"] || []}
                      value={selectedProof}
                      onSelect={setSelectedProof}
                    />
                  </RowItem>
                  <RowItem width={105}>
                    <TagDropdown
                      options={categoryRule["세목명"] || []}
                      value={selectedCategory}
                      onSelect={setSelectedCategory}
                    />
                  </RowItem>
                </RowContainer>
              </Table>
              <Section>
                <EditDocumentList
                  title="증빙구분별 서류"
                  ruleData={proofDocs}
                  setSelectedDocName={setSelectedDocName}
                  selectedDocName={selectedDocName}
                  onRuleChange={(newProofObj) => {
                    setEditRule(prev => {
                      let newDocumentRule = { ...prev.documentRule };
                      const prevDocs = prev.documentRule["증빙구분별서류"]?.[selectedProof] || {};
                      const newDocs = newProofObj || {};

                      // 문서 종류(판매사실입증, 실지급입증, 보완보조서류)
                      ["판매사실입증", "실지급입증", "보완보조서류"].forEach(category => {
                        const prevArr = prevDocs[category] || [];
                        const newArr = newDocs[category] || [];

                        // 삭제된 문서명
                        const removedDocs = prevArr.filter(doc => !newArr.includes(doc));
                        removedDocs.forEach(docName => {
                          if (newDocumentRule["서류별기입항목"]) {
                            const { [docName]: _, ...rest } = newDocumentRule["서류별기입항목"];
                            newDocumentRule["서류별기입항목"] = rest;
                          }
                        });

                        // 추가된 문서명
                        const addedDocs = newArr.filter(doc => !prevArr.includes(doc));
                        addedDocs.forEach(docName => {
                          if (newDocumentRule["서류별기입항목"] && !(docName in newDocumentRule["서류별기입항목"])) {
                            newDocumentRule["서류별기입항목"] = {
                              ...newDocumentRule["서류별기입항목"],
                              [docName]: [] // 기본값(필요시 원하는 구조로)
                            };
                          }
                        });
                      });

                      // 증빙구분별서류 갱신
                      newDocumentRule["증빙구분별서류"] = {
                        ...newDocumentRule["증빙구분별서류"],
                        [selectedProof]: newProofObj
                      };

                      return {
                        ...prev,
                        documentRule: newDocumentRule
                      };
                    });
                  }}
                />
              </Section>
              <Section>
                <EditDocumentList
                  title="세목별 서류"
                  ruleData={phaseDocs}
                  setSelectedDocName={setSelectedDocName}
                  selectedDocName={selectedDocName}
                  onRuleChange={(newObj, phase) => {
                    setEditRule(prev => {
                      let newDocumentRule = { ...prev.documentRule };
                      const prevDocs = prev.documentRule["세목별서류"]?.[selectedCategory] || {};
                      const newDocs = newObj || {};

                      // 문서 종류(사전승인, 수행과정, 수행확인)
                      ["사전승인", "수행과정", "수행확인"].forEach(category => {
                        const prevArr = prevDocs[category] || [];
                        const newArr = newDocs[category] || [];

                        // 삭제된 문서명
                        const removedDocs = prevArr.filter(doc => !newArr.includes(doc));
                        removedDocs.forEach(docName => {
                          if (newDocumentRule["서류별기입항목"]) {
                            const { [docName]: _, ...rest } = newDocumentRule["서류별기입항목"];
                            newDocumentRule["서류별기입항목"] = rest;
                          }
                        });

                        // 추가된 문서명
                        const addedDocs = newArr.filter(doc => !prevArr.includes(doc));
                        addedDocs.forEach(docName => {
                          if (newDocumentRule["서류별기입항목"] && !(docName in newDocumentRule["서류별기입항목"])) {
                            newDocumentRule["서류별기입항목"] = {
                              ...newDocumentRule["서류별기입항목"],
                              [docName]: [] // 기본값(필요시 원하는 구조로)
                            };
                          }
                        });
                      });

                      // 세목별서류 갱신
                      newDocumentRule["세목별서류"] = {
                        ...prev.documentRule["세목별서류"],
                        [selectedCategory]: newObj
                      };

                      return {
                        ...prev,
                        documentRule: newDocumentRule
                      };
                    });
                  }}
                />
              </Section>
              <Section>
                <EditDocumentList
                  title={selectedDocName ? `"${selectedDocName}" 기입항목` : "서류별 기입항목"}
                  ruleData={docFields}
                  onRuleChange={(newArr, docName) => {
                    // docFields는 {문서명: [항목, ...]} 형태
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