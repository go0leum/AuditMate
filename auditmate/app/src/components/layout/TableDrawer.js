import React, { useContext, useState, useRef, useEffect } from "react";
import styled from 'styled-components';

import DocumentList from "./DocumentList";
import TagDropdown from "../common/TagDropdown";
import ReviewContent from "./ReviewContent";
import MemoInput from "../common/MemoInput";
import Button from "../common/Button";
import Table from "./Table";

import { DrawerContext } from "../../context/DrawerContext";
import { TableContext } from "../../context/TableContext";
import { RuleContext } from "../../context/RuleContext";

import UsageBar from "../common/UsageBar";
import RowContainer from "./RowContainer";
import RowItem from "../common/RowItem";

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
  width: ${({ width }) => width}px;
  transform: ${({ $isOpen }) =>
    $isOpen ? 'translateX(0)' : 'translateX(100%)'};
  transition: transform 0.5s cubic-bezier(0.4,0,0.2,1);
  will-change: transform;
  overflow-y: scroll; // ← 추가: 항상 스크롤 표시
`;

const Content = styled.div`
  padding: 20px 20px 20px 20px;
  position: relative;
  display: flex;
  width: 100%;
  flex-direction: column;
  gap: 20px;
  height: 100%;
  box-sizing: border-box;
`;

const Section = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: flex-start;
  gap: 50px;
  align-self: stretch;
  height: auto;     // 추가: 내부 컴포넌트 높이에 맞게 자동 조절
`;

const BottonSection = styled.div`
  display: flex;
  justify-content: flex-end;
  flex-direction: row;
  align-items: center;
  gap: 20px;
`;

const TableDrawer = ({ open = false, width = 750, indexes, initialIndex, onClose, sortedData }) => {
  const { sideRef } = useContext(DrawerContext);
  const { selectedXlsxFile, handleTagSelect, tableData, handleReviewContentSave, handleMemoChange, handleNoteChange } = useContext(TableContext);
  const { selectedCategoryRule } = useContext(RuleContext);

  const [selectedIndex, setSelectedIndex] = useState(initialIndex);
  const [reviewContent, setReviewContent] = useState(tableData[initialIndex]?.['검토내용'] || {});
  const [selectedDocument, setSelectedDocument] = useState(
    tableData[initialIndex]?.['검토내용'] ? Object.keys(tableData[initialIndex]['검토내용'])[0] : ''
  );

  useEffect(() => {
    if (open) setSelectedIndex(initialIndex);
  }, [open, initialIndex]);

  // 검토내용만 바뀔 때는 selectedDocument를 바꾸지 않음
  useEffect(() => {
    const row = tableData[selectedIndex];
    setReviewContent(row?.['검토내용'] || {});
  }, [tableData, selectedIndex]);

  // selectedIndex(행 이동)될 때만 selectedDocument를 첫 번째로 초기화
  useEffect(() => {
    const row = tableData[selectedIndex];
    setSelectedDocument(row?.['검토내용'] ? Object.keys(row['검토내용'])[0] : '');
  }, [selectedIndex, tableData]);

  // Drawer 닫힐 때 reviewContent 저장
  const prevOpen = useRef(open);
  useEffect(() => {
    if (prevOpen.current && !open) {
      handleReviewContentSave(selectedIndex, reviewContent);
    }
    prevOpen.current = open;
    // eslint-disable-next-line
  }, [open]);

  // Before/Next 이동 시 reviewContent 저장 후 인덱스 변경
  const handlePrev = () => {
    const currentPos = indexes.indexOf(selectedIndex);
    if (currentPos > 0) {
      handleReviewContentSave(selectedIndex, reviewContent); // 이동 전 저장
      setSelectedIndex(indexes[currentPos - 1]);
    }
  };

  const handleNext = () => {
    const currentPos = indexes.indexOf(selectedIndex);
    if (currentPos < indexes.length - 1) {
      handleReviewContentSave(selectedIndex, reviewContent); // 이동 전 저장
      setSelectedIndex(indexes[currentPos + 1]);
    }
  };

  const TableDrawerRef = useRef();

  const columns = [
    { label: '집행실행일자', width: 90 },
    { label: '증빙구분', width: 105 },
    { label: '집행용도', width: 80 },
    { label: '비목명', width: 80 },
    { label: '세목명', width: 105 },
    { label: '거래처명', width: 80 },
    { label: '예금주명', width: 80 },
    { label: '집행금액', width: 80 },
  ];

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(e) {
      if (TableDrawerRef.current && !TableDrawerRef.current.contains(e.target)) {
        onClose?.();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open, onClose]);

  const row = sortedData[selectedIndex];

  return (
    <>
      <Overlay open={open} onClick={onClose} />
      <Container style={{ pointerEvents: open ? "auto" : "none" }}>
        <SidebarWrapper ref={sideRef} $isOpen={open} $width={width}>
          <Content>
            <Table columns={columns} width="100%">
              <RowContainer $width="100%">
                {row && columns.map((column, index) => {
                  const value = row[column.label];
                  if (column.label === '집행금액' && typeof value === 'number') {
                    return (
                      <RowItem key={index} width={column.width}>
                        {value.toLocaleString()}
                      </RowItem>
                    );
                  } else if (column.label === '증빙구분' || column.label === '세목명') {
                    return (
                      <RowItem key={index} width={column.width}>
                        <TagDropdown
                          options={selectedCategoryRule?.[column.label] || []}
                          value={row[column.label]}
                          onSelect={selected =>
                            handleTagSelect(selectedIndex, column.label, selected)
                          }
                        />
                      </RowItem>
                    );
                  } else {
                    return (
                      <RowItem key={index} width={column.width}>
                        {value ?? '-'}
                      </RowItem>
                    );
                  }
                })}
              </RowContainer>
            </Table>
            {row && (
              <>
                <DocumentList
                  category={row['세목명']}
                  proof={row['증빙구분']}
                  selectedDocument={selectedDocument}
                  setSelectedDocument={setSelectedDocument}
                />
                <ReviewContent
                  value={reviewContent}
                  onChange={setReviewContent}
                  onBlur={updated => handleReviewContentSave(selectedIndex, updated)}
                  selectedDocument={selectedDocument}
                />
                <Section>
                  <MemoInput
                    label="메모"
                    placeholder="메모를 입력해주세요"
                    value={row['메모'] ?? ''}
                    onChange={e => handleMemoChange(selectedIndex, e.target.value)}
                  />
                  <MemoInput
                    label="보완사항"
                    placeholder="보완사항을 입력해주세요"
                    value={row['보완사항'] ?? ''}
                    onChange={e => handleNoteChange(selectedIndex, e.target.value)}
                  />
                </Section>
              </>
            )}
            <BottonSection>
              <div style={{ width: '500px', padding: '0 20px' }}>
                <UsageBar progress={selectedXlsxFile?.progress} width={500}/>
              </div>
              <Button onClick={handlePrev}>Before</Button>
              <Button onClick={handleNext} secondary>Next</Button>
            </BottonSection>
          </Content>
        </SidebarWrapper>
      </Container>
    </>
  );
};

export default TableDrawer;