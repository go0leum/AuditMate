import React, { useContext, useState, useRef, useEffect, useCallback } from "react";
import styled from 'styled-components';

import DocumentList from "./DocumentList";
import MemoInput from "../common/MemoInput";
import Button from "../common/Button";
import Table from "./Table";
import Tag from "../common/Tag"; 

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
  width: 750px;
  background-color: #FFFFFF;
  overflow-y: auto;
  height: 100%;
  min-height: 100vh;
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
  height: auto; 
  max-height: 100vh; 
  overflow-y: auto; 
  transform: ${({ $isOpen }) =>
    $isOpen ? 'translateX(0)' : 'translateX(100%)'};
  transition: transform 0.5s cubic-bezier(0.4,0,0.2,1);
  will-change: transform;
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
  height: auto;     
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
  const { selectedXlsxFile, tableData, handleMemoChange, handleNoteChange, setIsEditing } = useContext(TableContext);
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

  const [checkedDocuments, setCheckedDocuments] = useState([]);

  useEffect(() => {
    if (open) setSelectedIndex(initialIndex);
  }, [open, initialIndex]);

  // selectedIndex(행 이동)될 때만 checkedDocuments를 첫 번째로 초기화
  useEffect(() => {
    const row = sortedData[selectedIndex];
    setCheckedDocuments(toDocArray(row?.['검토사항']));
  }, [selectedIndex, sortedData]); 

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

  const columns = tableData.length > 0
    ? Object.keys(tableData[0])
        .filter(label => label !== '_originalIndex') // 인덱스 제외
        .filter(label => !['검토사항', '취소사유', '답변', '메모', '보완사항'].includes(label)) // 특정 컬럼 제외
        .map(label => ({
          label,
          width: label === 'N' ? 50 : 110 // 기본값
        }))
    : [];

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
      if (e.key === 'ArrowLeft') {
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

  // row에서 selectedCategoryRule의 key값만 추출해서 dictionary로 반환하는 함수
  const getCategoryDataFromRow = (row, selectedCategoryRule) => {
    if (!row || !selectedCategoryRule) return {};
    const keys = Object.keys(selectedCategoryRule);
    const result = {};
    keys.forEach(key => {
      result[key] = row[key];
    });
    return result;
  };

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
                  // selectedCategoryRule의 key 중 하나일 때 Tag로 표시
                  if (selectedCategoryRule && Object.keys(selectedCategoryRule).includes(column.label)) {
                    return (
                      <RowItem key={index} width={column.width}>
                        <Tag
                          options={selectedCategoryRule[column.label] || []}
                          value={value}
                        >
                          {value}
                        </Tag>
                      </RowItem>
                    );
                  } else if (typeof value === 'number') {
                    return (
                      <RowItem key={index} width={column.width}>
                        {value.toLocaleString()}
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
                  data={getCategoryDataFromRow(row, selectedCategoryRule)}
                  selectedIndex={row._originalIndex}
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
                    onChange={e => handleMemoChange(row._originalIndex, e.target.value)}
                    ref={memoInputRef}
                    onFocus={() => setIsEditing(true)}
                    onBlur={() => setIsEditing(false)}
                  />
                  <MemoInput
                    label="보완사항"
                    placeholder="보완사항을 입력해주세요"
                    value={row['보완사항'] ?? ''}
                    onChange={e => handleNoteChange(row._originalIndex, e.target.value)}
                    ref={noteInputRef}
                    onFocus={() => setIsEditing(true)}
                    onBlur={() => setIsEditing(false)}
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