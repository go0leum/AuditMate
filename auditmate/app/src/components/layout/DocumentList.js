import React, { useContext } from 'react';
import styled from 'styled-components';
import data from '../../data/document_rule.json';

import { DrawerContext } from '../../context/DrawerContext';

const Wrapper = styled.div`
  align-self: stretch;
  display: inline-flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  gap: 15px;
`;

const Title = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  color: #0647A9;
  font-size: 16px;
  font-family: 'NanumGothic', sans-serif;
  font-weight: 600;
  word-wrap: break-word;
`;

const SubTitle = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  color: #0647A9;           // 원하는 색상으로 변경
  font-size: 14px;          // 원하는 크기로 변경
  font-family: 'NanumGothic', sans-serif;
  font-weight: 500;
  word-wrap: break-word;
`;

const Section = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  gap: 10px;
`;

const Row = styled.div`
  height: 40px;
  display: flex;
  justify-content: left;
  align-items: center;
  gap: 10px;
`;

const Label = styled.div`
  width: 100px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  color: black;
  font-size: 14px;
  font-family: 'NanumGothic', sans-serif;
  font-weight: 600;
  word-wrap: break-word;
`;

const Button = styled.div`
  width: 150px;
  height: 40px;
  border-radius: 4px;
  outline: 1px solid #7E7E7E;
  outline-offset: -1px;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  gap: 10px;
  background: ${({ $active }) => ($active ? '#0647A9' : 'white')};
`;

const ButtonText = styled.div`
  color: ${({ $active }) => ($active ? 'white' : 'black')};
  font-size: 14px;
  padding: 17px 15px;
  font-family: 'NanumGothic', sans-serif;
  font-weight: 600;
  word-wrap: break-word;
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

const DocumentList = ({ category, proof }) => {
  const { selectedDocument, setSelectedDocument } = useContext(DrawerContext);

  const documentSections = data.세목별서류[category] || {};
  const proofSections = data.증빙구분별서류[proof] || {};

  const handleClick = (doc) => {
    setSelectedDocument(doc);
  };

  // 🔥 Helper function: 문서를 3개씩 그룹화
  const chunkArray = (arr, size) => {
    return Array.from({ length: Math.ceil(arr.length / size) }, (_, index) =>
      arr.slice(index * size, index * size + size)
    );
  };

  return (
    <Wrapper>
      <Title>검토 문서 리스트</Title>

      <Section>
        <SubTitle>세목별 서류: {category}</SubTitle>
        {Object.entries(documentSections).map(([phase, docs]) => (
          <React.Fragment key={phase}>
            {chunkArray(docs, 3).map((docGroup, rowIndex) => (
              <Row key={`${phase}-${rowIndex}`}>
                {rowIndex === 0 && <Label>{phase}</Label>}
                {rowIndex > 0 && <Label>{''}</Label>}
                {docGroup.map(doc => (
                  <Button key={doc} $active={selectedDocument === doc} onClick={() => handleClick(doc)}>
                    <ButtonText $active={selectedDocument === doc}>{doc}</ButtonText>
                  </Button>
                ))}
              </Row>
            ))}
          </React.Fragment>
        ))}

        <SubTitle>증빙구분별 서류: {proof}</SubTitle>
        {Object.entries(proofSections).map(([proofType, docs]) => (
          <React.Fragment key={proofType}>
            {chunkArray(docs, 3).map((docGroup, rowIndex) => (
              <Row key={`${proofType}-${rowIndex}`}>
                {rowIndex === 0 && <Label>{proofType}</Label>}
                {docGroup.map(doc => (
                  <Button key={doc} $active={selectedDocument === doc} onClick={() => handleClick(doc)}>
                    <ButtonText $active={selectedDocument === doc}>{doc}</ButtonText>
                  </Button>
                ))}
              </Row>
            ))}
          </React.Fragment>
        ))}
      </Section>
    </Wrapper>
  );
};

export default DocumentList;