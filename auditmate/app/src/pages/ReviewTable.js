import { useContext, useState } from 'react';
import styled from 'styled-components';

import { TableContext } from '../context/TableContext';

import TopBar from '../components/layout/TopBar';
import SideBar from '../components/layout/SideBar';
import BaseContainer from '../components/layout/BaseContainer';
import Table from '../components/layout/Table';
import TagDropdown from '../components/common/TagDropdown';
import TableDrawer from '../components/layout/TableDrawer';

import Button from '../components/common/Button';
import RowExpand from '../components/common/RowExpand';
import { RuleContext } from '../context/RuleContext';
import RowContainer from '../components/layout/RowContainer';
import RowItem from '../components/common/RowItem';

const Line = styled.div`
  width: ${({ $width }) => $width || 'calc(100% - 60px)'};
  height: 0px;
  outline: 1px solid #EEEEEE;
  outline-offset: -0.5px;
`;

const ReviewTable = () => {
  const { tableData, handleTagSelect, handleExport, fetchExcelData, selectedXlsxFile } = useContext(TableContext);
  const { selectedCategoryRule, selectedDocumentRule, ruleLoading } = useContext(RuleContext);

  const [searchTerm, setSearchTerm] = useState('');
  const [TableDrawerOpen, setTableDrawerOpen] = useState(false);
  const [sortValue, setSortValue] = useState('original');
  const [expandedRows, setExpandedRows] = useState({});
  const [drawerIndex, setDrawerIndex] = useState(0);

  const data = tableData.map((row, idx) => ({ ...row, _originalIndex: idx }));

  const openTableDrawer = (index) => {
    setDrawerIndex(index);
    setTableDrawerOpen(true);
  };

  const handleDrawerClose = () => {
    // TableDrawer 내부에서 먼저 저장됨
    setTableDrawerOpen(false);
    fetchExcelData(); // 서버에서 새로고침
  };

  const options = [
    { label: '기본 순서', value: 'original' },
    { label: '집행일자 오름차순', value: 'date-asc' },
    { label: '집행일자 내림차순', value: 'date-desc' },
    { label: '집행용도 오름차순', value: 'use-asc' },
    { label: '집행용도 내림차순', value: 'use-desc' },
    { label: '세목명 오름차순', value: 'category-asc' },
    { label: '세목명 내림차순', value: 'category-desc' },
    { label: '거래처명 오름차순', value: 'correspondant-asc' },
    { label: '거래처명 내림차순', value: 'correspondant-desc' },
    { label: '예금주명 오름차순', value: 'depositor-asc' },
    { label: '예금주명 내림차순', value: 'depositor-desc' },
  ];

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

  const getSortedData = (data, sortKey) => {
    const sorted = [...data];
    switch (sortKey) {
      case 'original':
        return sorted.sort((a, b) => a._originalIndex - b._originalIndex);
      case 'date-asc':
        return sorted.sort((a, b) => (a['집행실행일자'] || '').localeCompare(b['집행실행일자'] || ''));
      case 'date-dsc':
        return sorted.sort((a, b) => (b['집행실행일자'] || '').localeCompare(a['집행실행일자'] || ''));
      case 'use-asc':
        return sorted.sort((a, b) => (a['집행용도'] || '').localeCompare(b['집행용도'] || ''));
      case 'use-dsc':
        return sorted.sort((a, b) => (b['집행용도'] || '').localeCompare(a['집행용도'] || ''));
      case 'category-asc':
        return sorted.sort((a, b) => (a['세목명'] || '').localeCompare(b['세목명'] || ''));
      case 'category-dsc':
        return sorted.sort((a, b) => (b['세목명'] || '').localeCompare(a['세목명'] || ''));
      case 'correspondant-asc':
        return sorted.sort((a, b) => (a['거래처명'] || '').localeCompare(b['거래처명'] || ''));
      case 'correspondant-desc':
        return sorted.sort((a, b) => (b['거래처명'] || '').localeCompare(a['거래처명'] || ''));
      case 'depositor-asc':
        return sorted.sort((a, b) => (a['예금주명'] || '').localeCompare(b['예금주명'] || ''));
      case 'depositor-desc':
        return sorted.sort((a, b) => (b['예금주명'] || '').localeCompare(a['예금주명'] || ''));
      default:
        return sorted;
    }
  };

  const filteredData = searchTerm.trim()
    ? data
        .filter((row) =>
          Object.values(row).some(
            (value) =>
              typeof value === 'string' &&
              value.toLowerCase().includes(searchTerm.toLowerCase())
          )
        )
    : data;

  const sortedData = getSortedData(filteredData, sortValue);

  // --- 데이터 준비 전에는 안내문만 출력 ---
  if (
    ruleLoading ||
    !selectedXlsxFile ||
    !selectedCategoryRule ||
    !selectedDocumentRule
  ) {
    return (
      <BaseContainer direction="row">
        <SideBar />
        <BaseContainer direction="column">
          <TopBar Title="Review Table" options={options} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} sortValue={sortValue} onSortChange={setSortValue}/>
          <div style={{ width: 'calc(100% - 60px)', padding: '0 20px', gap: '20px', display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
            <Button onClick={() => handleExport} secondary>Export</Button>
          </div>
          <Table columns={columns} width="calc(100% - 60px)">
            <div style={{ padding: '20px', color: '#888' }}>로딩 중입니다...</div>
          </Table>
        </BaseContainer>
      </BaseContainer>
    );
  }
  // --- 데이터 준비 후 기존 테이블 렌더링 ---
  return (
    <BaseContainer direction="row">
      <SideBar />
      <BaseContainer direction="column">
        <TopBar Title="Review Table" options={options} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} sortValue={sortValue} onSortChange={setSortValue}/>
        <div style={{ width: 'calc(100% - 60px)', padding: '0 20px', gap: '20px', display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
          <Button onClick={() => handleExport} secondary>Export</Button>
        </div>
        {data.length === 0 ? (
          <Table columns={columns} width="calc(100% - 60px)">
            <div style={{ padding: '20px' }}>데이터가 없습니다.</div>
          </Table>
        ) : (
          <Table columns={columns} width="calc(100% - 60px)">
            {sortedData.length === 0 ? (
              <div style={{ padding: '20px' }}>데이터가 없습니다.</div>
            ) : !selectedCategoryRule ? (
              <div style={{ padding: '20px', color: '#d32f2f' }}>
                문서 규칙을 불러올 수 없습니다.
              </div>
            ) : (
              sortedData.map((row, index) => (
                <div key={index} style={{ width: '100%', alignItems: 'center', display: 'flex', flexDirection: 'column' }}>
                  <RowContainer onClick={() => openTableDrawer(index)} width="calc(100% - 60px)">
                    {columns.map((column, colIndex) => {
                      const value = row[column.label];

                      if (column.label === '집행금액' && typeof value === 'number') {
                        return (
                          <RowItem key={colIndex} width={column.width} >
                            {value.toLocaleString()}
                          </RowItem>
                        );
                      } else if (column.label === '증빙구분' || column.label === '세목명') {
                        return (
                          <RowItem key={colIndex} width={column.width}>
                            <div onMouseDown={(e) => e.stopPropagation()} onClick={e => e.stopPropagation()}>
                              <TagDropdown
                                options={selectedCategoryRule?.[column.label] || []}
                                value={value}
                                onSelect={(selected) => handleTagSelect(row._originalIndex, column.label, selected)}
                              />
                            </div>
                          </RowItem>
                        );
                      } else if (column.label === '검토내용') {
                        return (
                          <RowItem
                            key={colIndex}
                            width={column.width}
                            style={{ cursor: typeof value === 'object' && value !== null ? 'pointer' : 'default' }}
                            onClick={e => {
                              e.stopPropagation();
                              if (typeof value === 'object' && value !== null) {
                                setExpandedRows(prev => ({
                                  ...prev,
                                  [index]: !prev[index]
                                }));
                              }
                            }}
                          >
                            {typeof value === 'object' && value !== null
                              ? Object.keys(value).join(', ')
                              : value ?? '-'}
                            {expandedRows[index] && typeof value === 'object' && value !== null && (
                              <RowExpand value={value} />
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
              ))
            )}
          </Table>
        )}
        {sortedData.length > 0 && (
          <TableDrawer
            open={TableDrawerOpen}
            onClose={handleDrawerClose}
            width={750}
            indexes={sortedData.map((_, idx) => idx)} // [0, 1, 2, ...]
            initialIndex={drawerIndex}
            sortedData={sortedData}
          />
        )}
      </BaseContainer>
    </BaseContainer>
  );
};

export default ReviewTable;