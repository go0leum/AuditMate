import { useContext, useState } from 'react';
import styled from 'styled-components';

import { TableContext } from '../context/TableContext';
import TopBar from '../components/layout/TopBar';
import SideBar from '../components/layout/SideBar';
import BaseContainer from '../components/layout/BaseContainer';
import Table from '../components/layout/Table';
import UploadModal from '../components/layout/UploadModal';
import TagDropdown from '../components/common/TagDropdown';

import Button from '../components/common/Button';
import Tag from '../components/common/Tag';

const RowContainer = styled.div`
  width: calc(100% - 60px);
  align-items: center;
  padding: 20px 20px;
  display: inline-flex;
  justify-content: space-between;
  align-items: center;
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
  const [activeDropdownIndex, setActiveDropdownIndex] = useState(null);

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
          (value) => typeof value === 'string' && value.includes(searchTerm)
        )
      )
    : reviewTableData;

  const handleTagSelect = (index, label, selected) => {
    setReviewTableData(prevData => {
      const updated = [...prevData];
      updated[index] = { ...updated[index], [label]: selected };
      return updated;
    });

    setActiveDropdownIndex(null); // 드롭다운 닫기
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
                <RowContainer>
                  {columns.map((column, colIndex) => {
                    const value = row[column.label];
                    const dropdownKey = `${index}-${column.label}`;

                    if (column.label === '집행금액' && typeof value === 'number') {
                      return (
                        <RowItem key={colIndex} width={column.width}>
                          {value.toLocaleString()}
                        </RowItem>
                      );
                    } else if (column.label === '증빙구분' || column.label === '세목명') {
                      return (
                        <RowItem key={colIndex} width={column.width}>
                          <Tag
                            label={column.label}
                            value={value}
                            onClick={() => {
                              setActiveDropdownIndex(dropdownKey);
                            }}
                          >
                            {value ?? '-'}
                          </Tag>
                          {activeDropdownIndex === dropdownKey && (
                            <div style={{ position: 'absolute', zIndex: 10 }}>
                              <TagDropdown
                                label={column.label}
                                onSelect={(selected) => handleTagSelect(index, column.label, selected)}
                                defaultValue={reviewTableData[index][column.label]} // 최신 상태 반영
                              />
                            </div>
                          )}
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
      </BaseContainer>
    </BaseContainer>
  );
};

export default ReviewTable;
