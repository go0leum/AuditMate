import React, { useContext, useState } from "react";
import styled from "styled-components";

import { FileContext } from "../context/FileContext";
import { RuleContext } from "../context/RuleContext"; // 추가

import TopBar from "../components/layout/TopBar";
import SideBar from "../components/layout/SideBar";
import BaseContainer from "../components/layout/BaseContainer";
import Table from "../components/layout/Table";
import UploadRuleModal from "../components/layout/UploadRuleModal";
import RowContainer from "../components/layout/RowContainer";

import RowItem from "../components/common/RowItem";
import Button from "../components/common/Button";
import RuleDrawer from "../components/layout/RuleDrawer"; // RuleDrawer import

const Line = styled.div`
  width: ${({ $width }) => $width || 'calc(100% - 60px)'};
  height: 0px;
  outline: 1px solid #EEEEEE;
  outline-offset: -0.5px;
`;

const RuleList = () => {
  const { ruleData, handleCheckboxChange, handleCheckExport, selectedRules, handleCheckDelete } = useContext(FileContext);
  const { setEditRule } = useContext(RuleContext); // FileContext → RuleContext로 변경
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortValue, setSortValue] = useState('date-dsc');
  const [ruleDrawerOpen, setRuleDrawerOpen] = useState(false);

  const columns = [
    { label: '선택', width: 100 },
    { label: '검토 규칙 이름', width: 250 },
    { label: '업로드 날짜', width: 250 },
  ];

  const options = [
    { label: '날짜 내림차순', value: 'date-dsc' },
    { label: '날짜 오름차순', value: 'date-asc' },
    { label: '파일이름 오름차순', value: 'name-asc' },
    { label: '파일이름 내림차순', value: 'name-dsc' },
  ];

  // 컬럼 클릭 시 정렬 상태 토글
  const handleColumnClick = (label) => {
    if (label === '선택') return;
    if (sortValue === `${label}-asc`) {
      setSortValue(`${label}-dsc`);
    } else {
      setSortValue(`${label}-asc`);
    }
  };

  // getSortedData에서 sortValue를 컬럼명-asc/dsc로 처리
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

  // RuleDrawer 열기
  const openRuleDrawer = (rule) => {
    setRuleDrawerOpen(true);
    setEditRule(rule);
  };

  // RuleDrawer 닫기
  const handleDrawerClose = () => {
    setRuleDrawerOpen(false);
  };

  return (
    <BaseContainer direction="row">
      <SideBar/>
       <TopBar Title='Rule List' options={options} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} sortValue={sortValue} onSortChange={setSortValue}/>
      <UploadRuleModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onUpload={(data) => console.log(data)} />
      <BaseContainer direction="column" $padding={false}>
        <div style={{ width: 'calc(100% - 60px)', padding: '0 20px', gap: '20px', display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
          <Button onClick={() => setIsModalOpen(true)}>Import</Button>
          <Button onClick={() => handleCheckExport("rule")} secondary>Export</Button>
          <Button onClick={() => handleCheckDelete("rule")} danger>Delete</Button>
        </div>
        <Table
          columns={columns}
          onColumnClick={handleColumnClick}
          sortValue={sortValue}
        >
          {sortedData.length > 0 ? (
            sortedData.map((rule, index) => (
              <React.Fragment key={rule.folderName || index}>
                <RowContainer>
                  <RowItem width={100}>
                    <input
                      type="checkbox"
                      checked={(selectedRules || []).some(r => r.folderName === rule.folderName)}
                      onChange={() => handleCheckboxChange("rule", rule)}
                    />
                  </RowItem>
                  <RowItem
                    width={250}
                    $clickable
                    style={{ cursor: 'pointer' }}
                    onClick={() => openRuleDrawer(rule)}
                  >
                    {rule.folderName}
                  </RowItem>
                  <RowItem width={250}>{rule.uploadTime}</RowItem>
                </RowContainer>
                <Line />
              </React.Fragment>
            ))
          ) : (
            <div style={{ padding: '20px' }}>데이터가 없습니다.</div>
          )}
        </Table>
      </BaseContainer>
      {sortedData.length > 0 && (
        <RuleDrawer 
          open={ruleDrawerOpen} 
          onClose={handleDrawerClose} 
          width={750}
        />
      )}
    </BaseContainer>
  );
};

export default RuleList;