import React, { useContext, useMemo, useEffect, useCallback, useRef } from 'react';
import styled from 'styled-components';

import { TableContext } from '../../context/TableContext';
import { RuleContext } from '../../context/RuleContext';

// 배열을 n개씩 잘라주는 유틸 함수
function chunkArray(array, size) {
  const result = [];
  for (let i = 0; i < array.length; i += size) {
    result.push(array.slice(i, i + size));
  }
  return result;
}

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
  font-family: 'Inter', sans-serif;
  font-weight: 600;
  word-wrap: break-word;
`;

const SubTitle = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  color: #0647A9;
  font-size: 15px;
  font-family: 'Inter', sans-serif;
  font-weight: 600;
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

const Button = styled.div`
  width: 160px;
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
  font-family: 'Inter', sans-serif;
  font-weight: 600;
  word-wrap: break-word;
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

const DocumentList = ({ data, selectedIndex, checkedDocuments }) => {
  const { selectedDocumentRule } = useContext(RuleContext);
  const { handleCheckedDocumentsChange } = useContext(TableContext);
  const inputBuffer = useRef('');

  // data 기반으로 문서 리스트 생성
  const docList = useMemo(() => {
    if (!selectedDocumentRule || !data) return [];
    let docs = [];
    Object.entries(data).forEach(([key, value]) => {
      if (selectedDocumentRule[key] && selectedDocumentRule[key][value]) {
        docs = docs.concat(selectedDocumentRule[key][value]);
      }
    });
    return [...new Set(docs)];
  }, [selectedDocumentRule, data]);

  const handleClick = useCallback((doc) => {
    let newChecked;
    if (checkedDocuments.includes(doc)) {
      newChecked = checkedDocuments.filter(d => d !== doc);
    } else {
      newChecked = [...checkedDocuments, doc];
    }
    handleCheckedDocumentsChange(selectedIndex, newChecked);
  }, [checkedDocuments, handleCheckedDocumentsChange, selectedIndex]);

  // 번호 입력 로직: 1~9, 0(10), +1~+9(11~19), +0(20)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === '+') {
        inputBuffer.current = '+';
        return;
      }
      if (inputBuffer.current === '+' && /^\d$/.test(e.key)) {
        let idx = e.key === '0' ? 19 : 10 + Number(e.key) - 1;
        if (docList[idx]) handleClick(docList[idx]);
        inputBuffer.current = '';
        return;
      }
      if (/^\d$/.test(e.key)) {
        let idx = e.key === '0' ? 9 : Number(e.key) - 1;
        if (docList[idx]) handleClick(docList[idx]);
        inputBuffer.current = '';
        return;
      }
      inputBuffer.current = '';
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [docList, handleClick]);

  // 버튼에 번호 표시
  let docIdx = 0;

  return (
    <Wrapper>
      <Title>검토 사항</Title>
      <Section>
        <SubTitle>
          {data && Object.entries(data).map(([key, value]) => `${key}: ${value}`).join(' / ')}
        </SubTitle>
        {chunkArray(docList, 4).map((docGroup, rowIndex) => (
          <Row key={rowIndex}>
            {docGroup.map(doc => (
              <Button
                key={doc}
                $active={checkedDocuments.includes(doc)}
                onClick={() => handleClick(doc)}
              >
                <ButtonText $active={checkedDocuments.includes(doc)}>
                  {`${++docIdx}. ${doc}`}
                </ButtonText>
              </Button>
            ))}
          </Row>
        ))}
      </Section>
    </Wrapper>
  );
};

export default DocumentList;