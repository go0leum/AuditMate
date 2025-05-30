import { useContext, useState } from 'react';
import styled from 'styled-components';

import { FileContext } from '../context/FileContext';
import { RuleContext } from '../context/RuleContext';

import TopBar from '../components/layout/TopBar';
import SideBar from '../components/layout/SideBar';
import BaseContainer from '../components/layout/BaseContainer';
import Table from '../components/layout/Table';
import UploadRuleModal from '../components/layout/UploadRuleModal';
import Button from '../components/common/Button';

const RowContainer = styled.div`
  width: calc(100% - 60px);
  justify-content: flex-start;
  align-items: center;
  padding : 20px 20px;
  display: inline-flex;
  justify-content: space-between;
  align-items: center;
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

  ${({ $clickable }) =>
    $clickable &&
    `
    &:hover {
      text-decoration: underline;
      cursor: pointer;
    }
  `}
`;

const RuleList = () => {
  const { ruleData, handleCheckboxChange, handleCheckExport, selectedRules } = useContext(FileContext);
  const { handleSetRule } = useContext(RuleContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortValue, setSortValue] = useState('date-dsc'); 

  const columns = [
    { label: '선택', width: 100 },
    { label: '검토 규칙', width: 500 },
    { label: '업로드 날짜', width: 500 },
  ];

  const options = [
    { label: '날짜 내림차순', value: 'date-dsc' },
    { label: '날짜 오름차순', value: 'date-asc' },
    { label: '파일이름 오름차순', value: 'name-asc' },
    { label: '파일이름 내림차순', value: 'name-dsc' },
  ];
  
  const getSortedData = (data, sortKey) => {
    const sorted = [...data];
    switch (sortKey) {
      case 'name-asc':
        return sorted.sort((a, b) => a.folderName.localeCompare(b.folderName));
      case 'name-dsc':
        return sorted.sort((a, b) => b.folderName.localeCompare(a.folderName));
      case 'date-asc':
        return sorted.sort((a, b) => new Date(a.uploadTime) - new Date(b.uploadTime));
      case 'date-dsc':
        return sorted.sort((a, b) => new Date(b.uploadTime) - new Date(a.uploadTime));
      default:
        return sorted;
    }
  };

  const filteredData = searchTerm.trim()
    ? ruleData.filter((rule) =>
        Object.values(rule).some((value) =>
          typeof value === "string" && value.toLowerCase().includes(searchTerm)
        )
      )
    : ruleData;

  const sortedData = getSortedData(filteredData, sortValue);

  return (
    <BaseContainer direction="row">
      <SideBar/>
      <BaseContainer direction="column">
        <TopBar Title='Recent Files' options={options} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} sortValue={sortValue} onSortChange={setSortValue}/>
        <div style={{ width: 'calc(100% - 60px)', padding: '0 20px', gap: '20px', display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
          <Button onClick={() => handleSetRule(selectedRules[0])}>Set Rule</Button>
          <Button onClick={() => setIsModalOpen(true)}>Import</Button>
          <UploadRuleModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onUpload={(data) => console.log(data)} />
          <Button onClick={() => handleCheckExport("rule")} secondary>Export</Button>
        </div>
        <Table columns={columns}>
          {sortedData.length > 0 ? (
            sortedData.map((rule, index) => (
              <RowContainer key={index}>
                <RowItem width={100}>
                  <input
                    type="checkbox"
                    checked={(selectedRules || []).some(r => r.folderName === rule.folderName)}
                    onChange={() => handleCheckboxChange("rule", rule)}
                  />
                </RowItem>
                <RowItem width={500} >{rule.folderName}</RowItem>
                <RowItem width={500}>{rule.uploadTime}</RowItem>
              </RowContainer>
            ))
          ) : (
            <div style={{ padding: '20px' }}>데이터가 없습니다.</div>
          )}
        </Table>
      </BaseContainer>
    </BaseContainer>
  );
};

export default RuleList;