import { useContext, useState } from 'react';
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
`;


const ReviewTable = () => {
  const { fileData, handleExport } = useContext(FileContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const columns = [
    { label: '집행실행일자', width: 90 },
    { label: '증빙구분', width: 105 },
    { label: '집행용도', width: 80 },
    { label: '비목명', width: 80 },
    { label: '세목명', width: 105},
    { label: '거래처명', width: 80},
    { label: '예금주명', width: 80},
    { label: '집행금액', width: 80},
    { label: '검토내용', width: 150},
    { label: '메모', width: 150},
    { label: '보완사항', width: 150},
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
        <TopBar Title='Review Table' onChange={(e) => setSearchTerm(e.target.value)} />
        <div style={{ width: 'calc(100% - 60px)', padding: '0 20px', gap: '20px', display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
          <Button onClick={() => setIsModalOpen(true)}>Import</Button>
          <UploadModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onUpload={(data) => console.log(data)} />
          <Button onClick={handleExport} secondary>Export</Button>
        </div>
        <Table columns={columns}>
          {filteredData.map((file, index) => (
            <RowContainer key={index}>
              {columns.map((column, colIndex) => (
                <RowItem key={colIndex} width={column.width}>
                  {file[column.label]}
                </RowItem>
              ))}
            </RowContainer>
          ))}
        </Table>
      </BaseContainer>
    </BaseContainer>
  );
};

export default ReviewTable;