import { useContext, useState } from 'react';
import styled from 'styled-components';

import { TableContext } from '../context/TableContext';
import TopBar from '../components/layout/TopBar';
import SideBar from '../components/layout/SideBar';
import BaseContainer from '../components/layout/BaseContainer';
import Table from '../components/layout/Table';
import UploadModal from '../components/layout/UploadModal';
import TagDropdown from '../components/common/TagDropdown';
import Drawer from '../components/layout/Drawer';

import Button from '../components/common/Button';

const RowContainer = styled.div`
  width: calc(100% - 60px);
  align-items: center;
  padding: 20px 20px;
  display: inline-flex;
  justify-content: space-between;
`;

const RowItem = styled.div`
  position: relative;
  width: ${({ width }) => width}px;
  text-align: center;
  display: flex;
  flex-direction: column;
  color: #292D32;
  font-size: 12px;
  font-family: 'NanumGothic', sans-serif;
  font-weight: 600;
  word-wrap: break-word;
`;

const Line = styled.div`
  width: 100%;
  height: 0px;
  outline: 1px solid #EEEEEE;
  outline-offset: -0.5px;
`;

const ReviewTable = () => {
  const { reviewTableData, setReviewTableData } = useContext(TableContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedRowIndex, setSelectedRowIndex] = useState(null);

  const openDrawer = (index) => {
    setSelectedRowIndex(index);
    setDrawerOpen(true);
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
    { label: '검토내용', width: 150 },
    { label: '메모', width: 150 },
    { label: '보완사항', width: 150 },
  ];

  const filteredData = searchTerm.trim()
    ? reviewTableData.filter((row) =>
        Object.values(row).some(
          (value) =>
            typeof value === 'string' &&
            value.toLowerCase().includes(searchTerm.toLowerCase())
        )
      )
    : reviewTableData;

  const handleTagSelect = (index, label, selected) => {
    setReviewTableData(prevData =>
      prevData.map((row, rowIndex) =>
        rowIndex === index ? { ...row, [label]: selected } : row
      )
    );
  };

  return (
    <BaseContainer direction="row">
      <SideBar />
      <BaseContainer direction="column">
        <TopBar Title="Review Table" onChange={(e) => setSearchTerm(e.target.value)} />
        <div style={{ width: 'calc(100% - 60px)', padding: '0 20px', gap: '20px', display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
          <Button onClick={() => setIsModalOpen(true)}>Import</Button>
          <UploadModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onUpload={(data) => console.log(data)} />
          <Button onClick={() => console.log('Export')} secondary>Export</Button>
        </div>
        {reviewTableData.length === 0 ? (
          <Table columns={columns}>
            <div style={{ padding: '20px' }}>데이터가 없습니다.</div>
          </Table>
        ) : (
          <Table columns={columns}>
            {filteredData.map((row, index) => (
              <div key={index} style={{ width: '100%', alignItems: 'center', display: 'flex', flexDirection: 'column' }}>
                <RowContainer onClick={() => openDrawer(index)}>
                  {columns.map((column, colIndex) => {
                    const value = row[column.label];

                    if (column.label === '집행금액' && typeof value === 'number') {
                      return (
                        <RowItem key={colIndex} width={column.width}>
                          {value.toLocaleString()}
                        </RowItem>
                      );
                    } else if (column.label === '증빙구분' || column.label === '세목명') {
                      return (
                        <RowItem key={colIndex} width={column.width}>
                          <div onMouseDown={(e) => e.stopPropagation()}>
                          <TagDropdown
                            label={column.label}
                            value={value}
                            onSelect={(selected) => handleTagSelect(index, column.label, selected)}
                          />
                          </div>
                        </RowItem>
                      );
                    } else {
                      return (
                        <RowItem key={colIndex} width={column.width}>
                          {value ?? '-'}
                        </RowItem>
                      );
                    }
                  })}
                </RowContainer>
                <Line />
              </div>
            ))}
          </Table>
        )}
        {drawerOpen && selectedRowIndex !== null && (
          <Drawer
            open={drawerOpen}
            width={750}
            row={filteredData[selectedRowIndex]}
            initialIndex={selectedRowIndex}
            closeDrawer={() => setDrawerOpen(false)}
          />
        )}
      </BaseContainer>
    </BaseContainer>
  );
};

export default ReviewTable;