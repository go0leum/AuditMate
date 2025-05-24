import React from 'react';
import styled from 'styled-components';
import rules from '../../data/document_rule.json';
import { useContext } from 'react';
import { DrawerContext } from '../../context/DrawerContext';
import InputField from '../common/InputField';

const Wrapper = styled.div`
  align-self: stretch;
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const Row = styled.div`
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
`;

const SummaryBox = styled.div`
  width: 100%;
  height: 60px;
  border: 1px solid #B1B1B1;
  padding: 10px;
  border-radius: 4px;
  background: #f9f9f9;
  color: #333;
  font-family: 'NanumGothic';
  font-size: 14px;
  box-sizing: border-box; // ★ 추가
  overflow-x: auto;        // ★ 긴 텍스트 대응
  white-space: nowrap;     // ★ 텍스트 줄바꿈 방지
`;

const Title = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  color: #0647A9;
  font-size: 16px;
  font-family: 'NanumGothic', sans-serif;
  font-weight: 600;
`;

const chunkArray = (arr, size) =>
  Array.from({ length: Math.ceil(arr.length / size) }, (_, i) =>
    arr.slice(i * size, i * size + size)
  );

const ReviewContent = () => {
  const { selectedDocument, inputValues, setInputValues } = useContext(DrawerContext);
  const fields = rules["서류별기입항목"][selectedDocument] || [];

  const handleChange = (label, value) => {
    setInputValues(prev => ({ ...prev, [label]: value }));
  };

  const summaryText = selectedDocument && fields.length > 0
    ? `${selectedDocument} - ${fields.map(f => `${f}: ${inputValues[f] || ''}`).join(', ')}`
    : '';

  return (
    <Wrapper>
      <Title>검토 내용</Title>

      {chunkArray(fields, 3).map((group, idx) => (
        <Row key={idx}>
          {group.map(label => (
            <InputField
              key={label}
              label={label}
              value={inputValues[label] || ''}
              onChange={e => handleChange(label, e.target.value)}
            />
          ))}
        </Row>
      ))}

      <SummaryBox>{summaryText}</SummaryBox>
    </Wrapper>
  );
};

export default ReviewContent;
