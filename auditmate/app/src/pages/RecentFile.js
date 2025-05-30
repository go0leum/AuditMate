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
import UploadFileModal from '../components/layout/UploadFileModal';

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
  const { fileData, handleCheckboxChange, handleCheckExport, selectedFiles } = useContext(FileContext);
  const { setSelectedXlsxFile } = useContext(TableContext);
  const { setSelectedDocumentDir }= useContext(DocumentContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortValue, setSortValue] = useState('date-asc'); // 추가
  
  const navigate = useNavigate();

  const columns = [
    { label: '선택', width: 100 },
    { label: '검토 내역', width: 250 },
    { label: '검토 자료', width: 250 },
    { label: '수정한 날짜', width: 200 },
    { label: '진행도', width: 300},
  ];

  const options = [
    { label: '날짜 내림차순', value: 'date-dsc' },
    { label: '날짜 오름차순', value: 'date-asc' },
    { label: '파일이름 오름차순', value: 'name-asc' },
    { label: '파일이름 내림차순', value: 'name-dsc' },
    { label: '진행도 오름차순', value: 'progress-asc' },
    { label: '진행도 내림차순', value: 'progress-desc' },
  ];
  
  const getSortedData = (data, sortKey) => {
    const sorted = [...data];
    switch (sortKey) {
      case 'name-asc':
        return sorted.sort((a, b) => a.xlsxFile.localeCompare(b.xlsxFile));
      case 'name-dsc':
        return sorted.sort((a, b) => b.xlsxFile.localeCompare(a.xlsxFile));
      case 'date-asc':
        return sorted.sort((a, b) => new Date(a.lastModified) - new Date(b.lastModified));
      case 'date-dsc':
        return sorted.sort((a, b) => new Date(b.lastModified) - new Date(a.lastModified));
      case 'progress-asc':
        return sorted.sort((a, b) => (a.progress || 0) - (b.progress || 0));
      case 'progress-desc':
        return sorted.sort((a, b) => (b.progress || 0) - (a.progress || 0));
      default:
        return sorted;
    }
  };

  const filteredData = searchTerm.trim()
    ? fileData.filter((file) =>
        Object.values(file).some((value) =>
          typeof value === "string" && value.toLowerCase().includes(searchTerm)
        )
      )
    : fileData;

  const sortedData = getSortedData(filteredData, sortValue);

  return (
    <BaseContainer direction="row">
      <SideBar/>
      <BaseContainer direction="column">
        <TopBar Title='Recent Files' options={options} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} sortValue={sortValue} onSortChange={setSortValue}/>
        <div style={{ width: 'calc(100% - 60px)', padding: '0 20px', gap: '20px', display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
          <Button onClick={() => setIsModalOpen(true)}>Import</Button>
          <UploadFileModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onUpload={(data) => console.log(data)} />
          <Button onClick={() => handleCheckExport("file")} secondary>Export</Button>
        </div>
        <Table columns={columns}>
          {sortedData.length > 0 ? (
            sortedData.map((file, index) => (
              <RowContainer key={index}>
                <RowItem width={100}>
                  <input type="checkbox" checked={selectedFiles.includes(file)} onChange={() => handleCheckboxChange("file", file)} />
                </RowItem>
                <RowItem width={250} 
                  $clickable style={{ cursor: 'pointer' }} 
                  onClick={() => {
                    setSelectedXlsxFile(file);
                    navigate(`/reviewTable/${file.xlsxFile}`);}}>{file.xlsxFile}</RowItem>
                <RowItem width={250} 
                  $clickable 
                  style={{ cursor: 'pointer' }} 
                  onClick={() => {
                    setSelectedDocumentDir(file);
                    navigate(`/documentOCR/${file.documentDir}`);}}>{file.documentDir}</RowItem>
                <RowItem width={200}>{file.lastModified}</RowItem>
                <RowItem width={300}>
                  <UsageBar progress={file.progress} />
                </RowItem>
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

export default RecentFile;