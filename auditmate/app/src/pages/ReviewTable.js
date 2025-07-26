import { useEffect, useContext, useState } from 'react';
import styled from 'styled-components';

import { TableContext } from '../context/TableContext';

import TopBar from '../components/layout/TopBar';
import SideBar from '../components/layout/SideBar';
import BaseContainer from '../components/layout/BaseContainer';
import Table from '../components/layout/Table';
import TableDrawer from '../components/layout/TableDrawer';
import Tag from '../components/common/Tag'; // 상단 import 추가

import Button from '../components/common/Button';
import { RuleContext } from '../context/RuleContext';
import RowContainer from '../components/layout/RowContainer';
import RowItem from '../components/common/RowItem';

const Line = styled.div`
  width: ${({ $width }) => $width || 'calc(100% - 60px)'};
  height: 0px;
  outline: 1px solid #EEEEEE;
  outline-offset: -0.5px;
`;

const TEXT_COLUMNS = [
  '비고', '집행용도', '취소사유', '검토사항', '메모', '보완사항', '답변',
  '세금계산서 발행 여부', '내부규정 부합 여부', '중복 집행 여부', '감사 메모', '감사 소견', '지출 사유 요약', '반려 사유'
];
const NUMBER_COLUMNS = [
  '교부액', '실집행액', '최종교부액', '초과집행액', '공급가액(A)', '부가세(B)', '집행취소(C)', '집행금액(A+B)-C',
  '예산잔액', '단가 (이내)', '법인카드 번호', '계좌번호'
];
const DATE_COLUMNS = ['집행실행일자', '회계연도', '업로드 일시'];
const CODE_COLUMNS = [
  '항목명', '세부항목명', '증빙번호', '준수 여부', '기준', '증빙'
];

const ReviewTable = () => {
  const { tableData, handleExport, fetchExcelData, selectedXlsxFile, tableLoading } = useContext(TableContext);
  const { selectedCategoryRule, selectedDocumentRule, ruleLoading } = useContext(RuleContext);

  const [searchTerm, setSearchTerm] = useState('');
  const [TableDrawerOpen, setTableDrawerOpen] = useState(false);
  const [sortValue, setSortValue] = useState('N-asc');
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

  // drawer가 열릴 때 body 스크롤 막기
  useEffect(() => {
    if (TableDrawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [TableDrawerOpen]);

  // 필터 옵션 정의
  const filterOptions = [
    { label: '전체', value: 'all' },
    { label: '답변 값 있음', value: 'answer' },
    { label: '보완사항 값 있음', value: 'note' },
    { label: '취소사유 값 있음', value: 'cancel' },
    { label: '메모 값 있음', value: 'memo' },
  ];

  const [filterValue, setFilterValue] = useState('all');

  const columns = tableData.length > 0
    ? Object.keys(tableData[0])
        .filter(label => label !== '_originalIndex') // 인덱스 제외
        .map(label => ({
          label,
          width:
            label === 'N'
              ? 50
              : TEXT_COLUMNS.includes(label)
                ? 200
                : 110 // 기본값(숫자, 날짜, 코드 등)
        }))
    : [];

  // 컬럼 클릭 시 정렬 상태 토글
  const handleColumnClick = (label) => {
    if (sortValue === `${label}-asc`) {
      setSortValue(`${label}-desc`);
    } else {
      setSortValue(`${label}-asc`);
    }
  };

  // getSortedData에서 sortValue를 컬럼명-asc/desc로 처리
  const getSortedData = (data, sortKey) => {
    const sorted = [...data];
    if (sortKey === 'original') {
      return sorted.sort((a, b) => a._originalIndex - b._originalIndex);
    }
    // sortKey 예: '집행금액-asc', '집행금액-desc'
    const [col, dir] = sortKey.split('-');
    if (!col || !dir) return sorted;
    return sorted.sort((a, b) => {
      const aVal = a[col] ?? '';
      const bVal = b[col] ?? '';
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return dir === 'asc' ? aVal - bVal : bVal - aVal;
      }
      return dir === 'asc'
        ? (aVal + '').localeCompare(bVal + '')
        : (bVal + '').localeCompare(aVal + '');
    });
  };

  // 필터링 적용
  const filteredData = data.filter(row => {
    console.log('filterValue:', filterValue);
    if (filterValue === 'all') return true;
    if (filterValue === 'answer') {
      const v = row['답변'];
      return typeof v === 'string' && v.replace(/[-\s]/g, '').length > 0;
    }
    if (filterValue === 'note') {
      const v = row['보완사항'];
      return typeof v === 'string' && v.replace(/[-\s]/g, '').length > 0;
    }
    if (filterValue === 'cancel') {
      const v = row['취소사유'];
      return typeof v === 'string' && v.replace(/[-\s]/g, '').length > 0;
    }
    if (filterValue === 'memo') {
      const v = row['메모'];
      return typeof v === 'string' && v.replace(/[-\s]/g, '').length > 0;
    }
    return true;
  }).filter(row =>
    searchTerm.trim()
      ? Object.values(row).some(
          (value) =>
            typeof value === 'string' &&
            value.toLowerCase().includes(searchTerm.toLowerCase())
        )
      : true
  );

  const sortedData = getSortedData(filteredData, sortValue);

  // --- 데이터 준비 전에는 안내문만 출력 ---
  if (
    ruleLoading ||
    tableLoading ||
    !selectedXlsxFile ||
    !selectedCategoryRule ||
    !selectedDocumentRule
  ) {
    return (
      <BaseContainer direction="row" >
        <SideBar />
        <BaseContainer direction="column" $padding={false}>
          <TopBar Title="Review Table" options={filterOptions} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} sortValue={sortValue} onSortChange={setSortValue}/>
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
      <BaseContainer direction="column" $width='auto' $padding={false}>
        <TopBar
          Title="Review Table"
          // options={options} → filterOptions로 교체
          options={filterOptions}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          // sortValue, onSortChange 제거
          filterValue={filterValue}
          onFilterChange={setFilterValue}
        />
        {data.length === 0 ? (
          <Table columns={columns} width="calc(100% - 60px)">
            <div style={{ padding: '20px' }}>데이터가 없습니다.</div>
          </Table>
        ) : (
          <Table
            columns={columns}
            width="calc(100% - 60px)"
            onColumnClick={handleColumnClick}
            sortValue={sortValue}
          >
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

                      if (typeof value === 'number') {
                        return (
                          <RowItem key={colIndex} width={column.width} >
                            {value.toLocaleString()}
                          </RowItem>
                        );
                      } else if (column.label === '증빙구분' || column.label === '세목명') {
                        return (
                          <RowItem key={colIndex} width={column.width}>
                            <Tag
                              options={selectedCategoryRule?.[column.label] || []}
                              value={value}
                            >
                              {value}
                            </Tag>
                          </RowItem>
                        );
                      } else if (column.label === '검토사항') {
                        return (
                          <RowItem key={colIndex} width={column.width}>
                            {Array.isArray(value)
                              ? value.join(', ')
                              : typeof value === 'object' && value !== null
                                ? JSON.stringify(value)
                                : (value ?? '-')}
                          </RowItem>
                        );
                      } else if (column.label === '메모' || column.label === '보완사항' || column.label === '검토사항') {
                        return (
                          <RowItem key={colIndex} width={column.width}>
                            {value ?? '-'}
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
      </BaseContainer>
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
  );
};

export default ReviewTable;