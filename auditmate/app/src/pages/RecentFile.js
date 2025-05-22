import { useContext, useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';

import { FileContext } from '../context/FileContext';
import { TableContext } from '../context/TableContext';
import { DocumentContext } from '../context/DocumentContext';

import TopBar from '../components/layout/TopBar';
import SideBar from '../components/layout/SideBar';
import BaseContainer from '../components/layout/BaseContainer';
import Table from '../components/layout/Table';
import UploadModal from '../components/layout/UploadModal';

import Button from '../components/common/Button';
import UsageBar from '../components/common/UsageBar';

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



const RecentFile = () => {
  const { fileData, handleCheckboxChange, handleExport, selectedFiles } = useContext(FileContext);
  const { setSelectedXlsxFile } = useContext(TableContext);
  const { setSelectedDocumentDir }= useContext(DocumentContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  
  const navigate = useNavigate();

  const columns = [
    { label: '선택', width: 100 },
    { label: '검토 내역', width: 250 },
    { label: '검토 자료', width: 250 },
    { label: '수정한 날짜', width: 200 },
    { label: '진행도', width: 300},
  ];

  const filteredData = searchTerm.trim()
    ? fileData.filter((file) =>
        Object.values(file).some((value) =>
          typeof value === "string" && value.toLowerCase().includes(searchTerm.toLowerCase())
        )
      )
    : fileData; // 검색어가 없으면 전체 출력


  return (
    <BaseContainer direction="row">
      <SideBar/>
      <BaseContainer direction="column">
        <TopBar Title='Recent Files' onChange={(e) => setSearchTerm(e.target.value)} />
        <div style={{ width: 'calc(100% - 60px)', padding: '0 20px', gap: '20px', display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
          <Button onClick={() => setIsModalOpen(true)}>Import</Button>
          <UploadModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onUpload={(data) => console.log(data)} />
          <Button onClick={handleExport} secondary>Export</Button>
        </div>
        <Table columns={columns}>
          {filteredData.length > 0 ? (
            filteredData.map((file, index) => (
              <RowContainer key={index}>
                <RowItem width={100}>
                  <input type="checkbox" checked={selectedFiles.includes(file)} onChange={() => handleCheckboxChange(file)} />
                </RowItem>
                <RowItem width={250} 
                  $clickable style={{ cursor: 'pointer' }} 
                  onClick={() => {
                    setSelectedXlsxFile(file);
                    navigate(`/reviewTable/${file.xlsxFile}/`);}}>{file.xlsxFile}</RowItem>
                <RowItem width={250} 
                  $clickable 
                  style={{ cursor: 'pointer' }} 
                  onClick={() => {
                    setSelectedDocumentDir(file);
                    navigate(`/documentOCR/${file.documentDir}/`);}}>{file.documentDir}</RowItem>
                <RowItem width={200}>{file.lastModified}</RowItem>
                <RowItem width={300}>
                  <UsageBar progress={file.progress} />
                </RowItem>
              </RowContainer>
            ))
          ) : (
            <RowContainer style={{ justifyContent: 'center' }}>
              <RowItem width={'calc(100% - 60px)'} style={{ textAlign: 'center', padding: '20px', color: '#777'}}>
                파일이 없습니다.
              </RowItem>
            </RowContainer>
          )}
        </Table>
      </BaseContainer>
    </BaseContainer>
  );
};

export default RecentFile;