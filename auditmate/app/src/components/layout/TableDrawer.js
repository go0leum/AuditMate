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

const Overlay = styled.div`
  display: ${({ open }) => (open ? 'block' : 'none')};
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.2);
`;

const RowContainer = styled.div`
  width: ${({ $width }) => $width || 'calc(100% - 60px)'};
  align-items: stretch;
  padding: 20px;
  display: flex;
  justify-content: space-between;
`;

const RowItem = styled.div`
  width: ${({ width }) => width}px;
  text-align: center;
  justify-content: center;
  display: flex;
  flex-direction: column;
  color: #292D32;
  font-size: 12px;
  font-family: 'NanumGothic', sans-serif;
  font-weight: 600;
  word-wrap: break-word;
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
  height: 91px;
`;

const HeaderSection = styled.div`
  display: flex;
  justify-content: flex-end;
  flex-direction: row;
  align-items: center;
  gap: 20px;
`;

const TableDrawer = ({ open = false, width = 750, indexes, initialIndex, onClose, sortedData }) => {
  const { sideRef, setMemo, setNote } = useContext(DrawerContext);
  const { selectedXlsxFile, handleTagSelect, tableData, setTableData } = useContext(TableContext);
  const { selectedCategoryRule } = useContext(RuleContext);

  const [selectedIndex, setSelectedIndex] = useState(initialIndex);
  const [reviewContent, setReviewContent] = useState(tableData[initialIndex]?.['검토내용'] || {});
  const [selectedDocument, setSelectedDocument] = useState(
    tableData[initialIndex]?.['검토내용'] ? Object.keys(tableData[initialIndex]['검토내용'])[0] : ''
  );

  // currentRow를 사용하지 않고 tableData[selectedIndex]로 직접 접근
  const getRow = () => tableData[selectedIndex];

  useEffect(() => {
    if (open) setSelectedIndex(initialIndex);
  }, [open, initialIndex]);

  useEffect(() => {
    const row = getRow();
    setReviewContent(row?.['검토내용'] || {});
    setSelectedDocument(row?.['검토내용'] ? Object.keys(row['검토내용'])[0] : '');
  }, [tableData, selectedIndex]);

  const handlePrev = () => {
    const currentPos = indexes.indexOf(selectedIndex);
    if (currentPos > 0) {
      setSelectedIndex(indexes[currentPos - 1]);
    }
  };

  const handleNext = () => {
    const currentPos = indexes.indexOf(selectedIndex);
    if (currentPos < indexes.length - 1) {
      setSelectedIndex(indexes[currentPos + 1]);
    }
  };

  const handleReviewContentSave = (newContent) => {
    setReviewContent(newContent);
    setTableData(prev =>
      prev.map((r, idx) =>
        idx === selectedIndex
          ? { ...r, 검토내용: newContent }
          : r
      )
    );
  };

  const handleMemoChange = (e) => {
    setMemo(e.target.value);
    setTableData(prev =>
      prev.map((r, idx) =>
        idx === selectedIndex
          ? { ...r, 메모: e.target.value }
          : r
      )
    );
  };

  const handleNoteChange = (e) => {
    setNote(e.target.value);
    setTableData(prev =>
      prev.map((r, idx) =>
        idx === selectedIndex
          ? { ...r, 보완사항: e.target.value }
          : r
      )
    );
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

  console.log("TableDrawer row:", row);

  return (
    <>
      <Overlay open={open} onClick={onClose} />
      <Container style={{ pointerEvents: open ? "auto" : "none" }}>
        <SidebarWrapper ref={sideRef} $isOpen={open} $width={width}>
          <Content>
            <HeaderSection>
              <div style={{ width: '500px', padding: '0 20px' }}>
                <UsageBar progress={selectedXlsxFile?.progress} width={500}/>
              </div>
              <Button onClick={handlePrev}>Before</Button>
              <Button onClick={handleNext} secondary>Next</Button>
            </HeaderSection>
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
                  onChange={handleReviewContentSave}
                  selectedDocument={selectedDocument}
                />
                <Section>
                  <MemoInput
                    label="메모"
                    placeholder="메모를 입력해주세요"
                    value={row['메모'] ?? ''}
                    onChange={handleMemoChange}
                  />
                  <MemoInput
                    label="보완사항"
                    placeholder="보완사항을 입력해주세요"
                    value={row['보완사항'] ?? ''}
                    onChange={handleNoteChange}
                  />
                </Section>
              </>
            )}
          </Content>
        </SidebarWrapper>
      </Container>
    </>
  );
};

export default TableDrawer;