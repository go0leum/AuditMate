import React, { useContext, useState } from "react";
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

const RowContainer = styled.div`
  width: 100%;
  align-items: center;
  padding: 20px 20px;
  display: inline-flex;
  justify-content: space-between;
`;

const RowItem = styled.div`
  position: relative;
  width: ${({ $width }) => $width}px;
  text-align: center;
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
  transform: ${({ $isOpen, $width }) => ($isOpen ? 'translateX(0)' : `translateX(${$width}px)`)};
  transition: transform 0.3s ease-in-out;
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

const FooterSection = styled(Section)`
  justify-content: flex-end;
  gap: 20px;
`;

const Drawer = ({ open = false, width = 750, row }) => {
  const { sideRef, memo, setMemo, note, setNote } = useContext(DrawerContext);
  const {selectedXlsxFile} = useContext(TableContext);
  const { reviewTableData, handleTagSelect } = useContext(TableContext);

  const [selectedIndex, setSelectedIndex] = useState(
    () => reviewTableData.findIndex((r) => r === row)
  );

  const currentRow = reviewTableData[selectedIndex];

  const handlePrev = () => {
    setSelectedIndex(prev => (prev > 0 ? prev - 1 : prev));
  };

  const handleNext = () => {
    setSelectedIndex(prev => (prev < reviewTableData.length - 1 ? prev + 1 : prev));
  };

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

  return (
    <Container style={{ pointerEvents: open ? "auto" : "none" }}>
      <SidebarWrapper ref={sideRef} $isOpen={open} $width={width}>
        <Content>
          <Table columns={columns} $width="100%">
            <RowContainer $width="100%">
              {currentRow && columns.map((column, index) => {
                const value = currentRow[column.label];

                if (column.label === '집행금액' && typeof value === 'number') {
                  return (
                    <RowItem key={index} $width={column.width}>
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
                          handleTagSelect?.(selectedIndex, column.label, selected)
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
          <DocumentList category={row['세목명']} proof={row['증빙구분']} />
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
          <FooterSection>
            <div style={{ width: '500px', padding: '0 20px' }}>
              <UsageBar progress={selectedXlsxFile?.progress} width={500}/>
            </div>
            <Button onClick={handlePrev}>Before</Button>
            <Button onClick={handleNext} secondary>Next</Button>
          </FooterSection>
        </Content>
      </SidebarWrapper>
    </Container>
  );
};

export default Drawer;