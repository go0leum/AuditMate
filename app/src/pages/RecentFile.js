import React, { useContext, useState } from 'react';
import styled from 'styled-components';

import { FileContext } from '../context/FileContext';

import TopBar from '../components/layout/TopBar';
import SideBar from '../components/layout/SideBar';
import BaseContainer from '../components/layout/BaseContainer';
import Table from '../components/layout/Table';
import UploadModal from '../components/layout/UploadModal';

import Button from '../components/common/Button';
import UsageBar from '../components/common/UsageBar';

const RowContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding-top: 10px;
  border-top: 1px solid #EBEFF2; // 위에 라인 추가
`;

const RowItem = styled.div`
  width: ${({ width }) => width}px;
  justify-content: center;
  display: flex;
  flex-direction: column;
  color: #292D32;
  font-size: 13px;
  font-family: 'NanumGothic', sans-serif;
  font-weight: 600;
  word-wrap: break-word;
`;

const RecentFile = () => {
  const [fileData, handleCheckboxChange, handleExport, selectedFiles] = useContext(FileContext);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const columns = [
    { label: '선택', width: 100 },
    { label: '검토 내역', width: 250 },
    { label: '검토 자료', width: 250 },
    { label: '수정한 날짜', width: 200 },
    { label: '진행도', width: 300},
  ];

  return (
    <BaseContainer direction="row">
      <SideBar/>
      <BaseContainer direction="column">
        <TopBar />
        <div style={{ width: '100%', padding: '0 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'left' }}>
          <Button onClick={() => setIsModalOpen(true)} >Import</Button>
          <UploadModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onUpload={(data) => console.log(data)} />
          <Button onClick={handleExport} secondary>Export</Button>
        </div>
        <Table columns={columns}>
          {fileData.map((file, index) => (
            <RowContainer key={index}>
              <RowItem width={100}>
                <input type="checkbox" checked={selectedFiles.includes(file)} onChange={() => handleCheckboxChange(file)}/>
              </RowItem>
              <RowItem width={250}>{file.xlsxFiles}</RowItem>
              <RowItem width={250}>{file.subFolder}</RowItem>
              <RowItem width={200}>{file.lastModified}</RowItem>
              <RowItem width={300}>
                <UsageBar progress={file.progress} />
              </RowItem>
            </RowContainer>
          ))}
        </Table>
      </BaseContainer>
    </BaseContainer>
  );
}

export default RecentFile;