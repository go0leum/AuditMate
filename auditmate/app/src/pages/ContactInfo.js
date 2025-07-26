import { useContext, useState } from 'react';
import styled from 'styled-components';

import { ContactContext } from '../context/ContactContext';

import TopBar from '../components/layout/TopBar';
import SideBar from '../components/layout/SideBar';
import BaseContainer from '../components/layout/BaseContainer';
import Table from '../components/layout/Table';
import RowContainer from '../components/layout/RowContainer';

import RowItem from '../components/common/RowItem';
import Button from '../components/common/Button';

const requiredFields = ['parentOrg', 'manager', 'email'];

const StyledInput = styled.input`
  height: 10px;
  padding: 3px 3px;
  background: white;
  border-radius: 4px;
  border: 1px solid #e0e0e0;
  font-size: 13x;
  font-family: "Inter", sans-serif;
  font-weight: 600;
  color: #333;
  outline: none;

  &::placeholder {
    color: #b1b1b1;
  }
`;

const Line = styled.div`
  width: ${({ $width }) => $width || 'calc(100% - 60px)'};
  height: 0px;
  outline: 1px solid #EEEEEE;
  outline-offset: -0.5px;
`;

const ContactInfo = () => {
  const { contactData, handleCheck, handleCheckDelete, selectedRows, setContactData } = useContext(ContactContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortValue, setSortValue] = useState('date-asc');
  const [editingCell, setEditingCell] = useState({ row: null, key: null });
  const [editValue, setEditValue] = useState('');
  const [addingRow, setAddingRow] = useState(false);
  const [newRow, setNewRow] = useState({
    parentOrg: '',
    projectName: '',
    subOrg: '',
    manager: '',
    email: '',
    lastModified: '',
    memo: '',
  });

  const columns = [
    { label: '선택', width: 50, key: 'select' },
    { label: '상위 기관', width: 200, key: 'parentOrg' },
    { label: '사업명', width: 200, key: 'projectName' },
    { label: '보조사업자명', width: 200, key: 'subOrg' },
    { label: '담당자', width: 80, key: 'manager' },
    { label: '메일 주소', width: 200, key: 'email' },
    { label: '마감일', width: 130, key: 'lastModified' },
    { label: '메모', width: 200, key: 'memo' },
  ];

  const options = [
    { label: '상위 기관 오름차순', value: 'parentOrg-asc' },
    { label: '상위 기관 내림차순', value: 'parentOrg-desc' },
    { label: '사업명 오름차순', value: 'projectName-asc' },
    { label: '사업명 내림차순', value: 'projectName-desc' },
    { label: '보조사업자명 오름차순', value: 'subOrg-asc' },
    { label: '보조사업자명 내림차순', value: 'subOrg-desc' },
    { label: '담당자 오름차순', value: 'manager-asc' },
    { label: '담당자 내림차순', value: 'manager-desc' },
    { label: '마감일 오름차순', value: 'lastModified-asc' },
    { label: '마감일 내림차순', value: 'lastModified-desc' },
  ];

  const getSortedData = (data, sortKey) => {
    if (!sortKey) return data;
    const [key, order] = sortKey.split('-');
    const sorted = [...data];
    sorted.sort((a, b) => {
      let aValue = a[key];
      let bValue = b[key];

      // 날짜는 Date 비교, 나머지는 문자열 비교
      if (key === 'lastModified') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      } else {
        aValue = (aValue || '').toString();
        bValue = (bValue || '').toString();
      }

      if (aValue < bValue) return order === 'asc' ? -1 : 1;
      if (aValue > bValue) return order === 'asc' ? 1 : -1;
      return 0;
    });
    return sorted;
  };

  const filteredData = searchTerm.trim()
    ? contactData.filter((contact) =>
        Object.values(contact).some((value) =>
          typeof value === "string" && value.toLowerCase().includes(searchTerm)
        )
      )
    : contactData;

  const sortedData = getSortedData(filteredData, sortValue);

  // Add 버튼 클릭 시
  const handleAddRow = () => {
    setAddingRow(true);
    setNewRow({
      parentOrg: '',
      projectName: '',
      subOrg: '',
      manager: '',
      email: '',
      lastModified: '',
      memo: '',
    });
  };

  // 새 row input 변경
  const handleNewRowChange = (key, value) => {
    setNewRow((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  // 새 row 엔터 입력 시
  const handleNewRowKeyDown = (e) => {
    if (e.key === 'Enter') {
      // 필수 입력값 체크
      for (let field of requiredFields) {
        if (!newRow[field] || newRow[field].trim() === '') {
          alert('상위기관, 담당자, 메일주소는 필수 입력입니다.');
          return;
        }
      }
      // 마감일 값이 있으면 날짜만 저장
      const rowToAdd = {
        ...newRow,
        lastModified: newRow.lastModified ? newRow.lastModified.slice(0, 10) : ''
      };
      setContactData((prev) => [...prev, rowToAdd]);
      setAddingRow(false);
    }
  };

  // 셀 클릭 시 input으로 변경
  const handleCellClick = (rowIdx, key, value) => {
    setEditingCell({ row: rowIdx, key });
    setEditValue(value || '');
  };

  // 날짜 input에서 값 변경 시 바로 저장
  const handleEditDateChange = (e, rowIdx, key) => {
    const dateValue = e.target.value ? e.target.value.slice(0, 10) : '';
    setContactData((prev) =>
      prev.map((row, idx) =>
        idx === rowIdx
          ? { ...row, [key]: dateValue }
          : row
      )
    );
    setEditingCell({ row: null, key: null });
  };

  // 셀 input 변경
  const handleEditChange = (e) => {
    setEditValue(e.target.value);
  };

  // 셀 input 엔터 시 수정 완료
  const handleEditKeyDown = (e, rowIdx, key) => {
    if (e.key === 'Enter') {
      setContactData((prev) =>
        prev.map((row, idx) =>
          idx === rowIdx
            ? {
                ...row,
                [key]: key === 'lastModified' && editValue
                  ? editValue.slice(0, 10)
                  : editValue
              }
            : row
        )
      );
      setEditingCell({ row: null, key: null });
    }
  };

  // 셀 input 바깥 클릭 시 input 완료
  const handleEditBlur = (rowIdx, key) => {
    setContactData((prev) =>
      prev.map((row, idx) =>
        idx === rowIdx
          ? {
              ...row,
              [key]: key === 'lastModified' && editValue
                ? editValue.slice(0, 10)
                : editValue
            }
          : row
      )
    );
    setEditingCell({ row: null, key: null });
  };

  return (
    <BaseContainer direction="row">
      <SideBar/>
      <BaseContainer direction="column">
        <TopBar Title='Contact Info' options={options} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} sortValue={sortValue} onSortChange={setSortValue}/>
        <div style={{ width: 'calc(100% - 60px)', padding: '0 20px', gap: '20px', display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
          <Button onClick={handleAddRow}>Add</Button>
          <Button onClick={handleCheckDelete} danger>Delete</Button>
        </div>
        <Table columns={columns}>
          {addingRow && (
            <RowContainer>
              {columns.map((column, colIndex) => {
                if (column.key === 'select') {
                  return (
                    <RowItem key={colIndex} width={column.width}>
                      {/* 선택 체크박스 없음 */}
                    </RowItem>
                  );
                }
                return (
                  <RowItem key={colIndex} width={column.width}>
                    {column.key === 'lastModified' ? (
                      <StyledInput
                        type="date"
                        value={newRow[column.key] || ''}
                        onChange={(e) => handleNewRowChange(column.key, e.target.value)}
                        onKeyDown={handleNewRowKeyDown}
                        required={requiredFields.includes(column.key)}
                        placeholder={requiredFields.includes(column.key) ? '필수' : ''}
                        style={requiredFields.includes(column.key) ? { border: '1px solid red' } : {}}
                      />
                    ) : (
                      <StyledInput
                        type="text"
                        value={newRow[column.key] || ''}
                        onChange={(e) => handleNewRowChange(column.key, e.target.value)}
                        onKeyDown={handleNewRowKeyDown}
                        required={requiredFields.includes(column.key)}
                        placeholder={requiredFields.includes(column.key) ? '필수' : ''}
                        style={requiredFields.includes(column.key) ? { border: '1px solid red' } : {}}
                      />
                    )}
                  </RowItem>
                );
              })}
            </RowContainer>
          )}
          {sortedData.length > 0 ? (
            sortedData.map((contact, index) => (
              <>
                <RowContainer key={index} width="calc(100% - 60px)">
                  {columns.map((column, colIndex) => {
                    const value = contact[column.key];
                    if (column.key === 'select') {
                      return (
                        <RowItem key={colIndex} width={column.width}>
                          <input
                            type="checkbox"
                            checked={selectedRows.includes(index)}
                            onChange={() => handleCheck(index)}
                          />
                        </RowItem>
                      );
                    } else {
                      return (
                        <RowItem
                          key={colIndex}
                          width={column.width}
                          onClick={() => handleCellClick(index, column.key, value)}
                          style={{ cursor: 'pointer' }}
                        >
                          {editingCell.row === index && editingCell.key === column.key ? (
                            column.key === 'lastModified' ? (
                              <StyledInput
                                type="date"
                                value={editValue}
                                onChange={(e) => handleEditDateChange(e, index, column.key)}
                                onBlur={() => handleEditBlur(index, column.key)}
                                autoFocus
                              />
                            ) : (
                              <StyledInput
                                type="text"
                                value={editValue}
                                onChange={handleEditChange}
                                onKeyDown={(e) => handleEditKeyDown(e, index, column.key)}
                                onBlur={() => handleEditBlur(index, column.key)}
                                autoFocus
                              />
                            )
                          ) : (
                            column.key === 'lastModified' && value
                              ? (value.length > 10 ? value.slice(0, 10) : value)
                              : (value || '-')
                          )}
                        </RowItem>
                      );
                    }
                  })}
                </RowContainer>
                <Line />
              </>
            ))
          ) : (
            <div style={{ padding: '20px' }}>데이터가 없습니다.</div>
          )}
        </Table>
      </BaseContainer>
    </BaseContainer>
  );
};

export default ContactInfo;