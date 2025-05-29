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
  padding: 20px 20px;
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
  /* 슬라이드 애니메이션: 오른쪽에서 왼쪽으로 */
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

  height: 100%;
  overflow-y: auto;
  box-sizing: border-box; // ★ 추가
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

const Drawer = ({ open = false, width = 750, data, initialIndex, onClose }) => {
  const { sideRef, memo, setMemo, note, setNote } = useContext(DrawerContext);
  const { selectedXlsxFile } = useContext(TableContext);
  const { handleTagSelect } = useContext(TableContext);

  const [selectedIndex, setSelectedIndex] = useState(initialIndex);
  const currentRow = data[selectedIndex];

  useEffect(() => {
    if (open) setSelectedIndex(initialIndex);
    // open이 true가 될 때만 초기화
    // 또는 open && selectedIndex !== initialIndex 체크도 가능
  }, [open, initialIndex]);

  const handlePrev = () => setSelectedIndex(prev => (prev > 0 ? prev - 1 : prev));
  const handleNext = () => setSelectedIndex(prev => (prev < data.length - 1 ? prev + 1 : prev));

  const drawerRef = useRef();

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
      if (drawerRef.current && !drawerRef.current.contains(e.target)) {
        onClose?.();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open, onClose]);

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
                {currentRow && columns.map((column, index) => {
                  const value = currentRow[column.label];
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
                          label={column.label}
                          value={value}
                          onSelect={(selected) =>
                            handleTagSelect?.(currentRow._originalIndex, column.label, selected)
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
            {currentRow && (
              <>
                <DocumentList category={currentRow['세목명']} proof={currentRow['증빙구분']} />
                <ReviewContent />
                <Section>
                  <MemoInput
                    label="메모"
                    placeholder="메모를 입력해주세요"
                    value={memo}
                    onChange={e => setMemo(e.target.value)}
                  />
                  <MemoInput
                    label="보완사항"
                    placeholder="보완사항을 입력해주세요"
                    value={note}
                    onChange={e => setNote(e.target.value)}
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

export default Drawer;