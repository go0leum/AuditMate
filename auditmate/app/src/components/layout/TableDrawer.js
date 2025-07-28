import React, { useContext, useState, useRef, useEffect, useCallback } from "react";
import styled from 'styled-components';

import DocumentList from "./DocumentList";
import MemoInput from "../common/MemoInput";
import Button from "../common/Button";
import Table from "./Table";
import Tag from "../common/Tag"; // 상단 import 추가

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
  z-index: 200;
  width: ${({ width }) => width}px;
  transform: ${({ $isOpen }) =>
    $isOpen ? 'translateX(0)' : 'translateX(100%)'};
  transition: transform 0.5s cubic-bezier(0.4,0,0.2,1);
  will-change: transform;
  overflow-y: auto; // 스크롤은 유지
  height: auto;     // ← 변경
  min-height: 100vh; // ← 추가
`;

const Content = styled.div`
  padding: 20px 20px 20px 20px;
  position: relative;
  display: flex;
  width: 100%;
  flex-direction: column;
  gap: 20px;
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

const Title = styled.div`
  width: 100px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  color: #0647A9;
  font-size: 16px;
  font-family: 'Inter', sans-serif;
  font-weight: 600;
  word-wrap: break-word;
`;

const Label = styled.div`
  width: 600px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  color: black;
  font-size: 14px;
  font-family: 'Inter', sans-serif;
  font-weight: 400;
  word-wrap: break-word;
`;

const TableDrawer = ({ open = false, width = 750, indexes, initialIndex, onClose, sortedData }) => {
  const { sideRef } = useContext(DrawerContext);
  const { selectedXlsxFile, tableData, handleMemoChange, handleNoteChange } = useContext(TableContext);
  const { selectedCategoryRule } = useContext(RuleContext);

  const [selectedIndex, setSelectedIndex] = useState(initialIndex);
  // 배열 또는 쉼표로 구분된 문자열 모두 배열로 변환
  const toDocArray = (docs) => {
    if (Array.isArray(docs)) return docs;
    if (typeof docs === 'string' && docs.trim() !== '') {
      return docs.split(',').map(s => s.trim());
    }
    return [];
  };

  const [checkedDocuments, setCheckedDocuments] = useState(
    toDocArray(tableData[initialIndex]?.['검토사항'])
  );

  useEffect(() => {
    if (open) setSelectedIndex(initialIndex);
  }, [open, initialIndex]);

  // selectedIndex(행 이동)될 때만 checkedDocuments를 첫 번째로 초기화
  useEffect(() => {
    const row = tableData[selectedIndex];
    setCheckedDocuments(toDocArray(row?.['검토사항']));
  }, [selectedIndex, tableData]); // tableData 추가

  // useCallback으로 감싸기
  const handlePrev = useCallback(() => {
    const currentPos = indexes.indexOf(selectedIndex);
    if (currentPos > 0) {
      setSelectedIndex(indexes[currentPos - 1]);
    }
  }, [indexes, selectedIndex]);

  const handleNext = useCallback(() => {
    const currentPos = indexes.indexOf(selectedIndex);
    if (currentPos < indexes.length - 1) {
      setSelectedIndex(indexes[currentPos + 1]);
    }
  }, [indexes, selectedIndex]);

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

  // d/e/f 키 핸들링
  const memoInputRef = useRef(null);
  const noteInputRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (
        document.activeElement.tagName === 'INPUT' ||
        document.activeElement.tagName === 'TEXTAREA'
      ) {
        return;
      }
      if (e.key === 'ArrowLeft' || e.key === '.') {
        handlePrev();
      }
      if (e.key === 'ArrowRight' || e.key === 'Enter') {
        handleNext();
      }
      if (
        e.key.length === 1 &&
        !e.ctrlKey && !e.altKey && !e.metaKey &&
        // 불필요한 \ 제거
        !/[0-9`~!@#$%^&*()_\-+={}[\]|\\:;"'<>,.?/]/.test(e.key)
      ) {
        e.preventDefault();
        memoInputRef.current?.focus();
      }
      if (e.key === '*') {
        e.preventDefault();
        noteInputRef.current?.focus();
      }
    };

    if (open) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, onClose, handlePrev, handleNext]);

  const row = sortedData[selectedIndex];
  const minWidth = columns.reduce((sum, col) => sum + (col.width || 110), 0) + 'px';

  return (
    <>
      <Overlay open={open} onClick={onClose} />
      <Container style={{ pointerEvents: open ? "auto" : "none" }}>
        <SidebarWrapper ref={sideRef} $isOpen={open} $width={width}>
          <Content>
            <BottonSection>
              <div style={{ width: '500px', padding: '0 20px' }}>
                <UsageBar progress={selectedXlsxFile?.progress} width={500}/>
              </div>
              <Button onClick={handlePrev}>Before</Button>
              <Button onClick={handleNext} secondary>Next</Button>
            </BottonSection>
            <Table minWidth={minWidth} columns={columns}>
              <RowContainer minWidth={minWidth}>
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
                        <Tag
                          options={selectedCategoryRule?.[column.label] || []}
                          value={row[column.label]}
                        >
                          {row[column.label]}
                        </Tag>
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
                  selectedIndex={selectedIndex}
                  checkedDocuments={checkedDocuments}
                />
                <Section>
                  <Title>취소사유</Title>
                  <Label> 
                    {row['취소사유'] ?? '-'}
                  </Label>
                </Section>
                <Section>
                  <Title>답변</Title>
                  <Label>
                    {row['답변'] ?? '-'}
                  </Label>
                </Section>
                <Section>
                  <MemoInput
                    label="메모"
                    placeholder="메모를 입력해주세요"
                    value={row['메모'] ?? ''}
                    onChange={e => handleMemoChange(selectedIndex, e.target.value)}
                    ref={memoInputRef}
                  />
                  <MemoInput
                    label="보완사항"
                    placeholder="보완사항을 입력해주세요"
                    value={row['보완사항'] ?? ''}
                    onChange={e => handleNoteChange(selectedIndex, e.target.value)}
                    ref={noteInputRef}
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