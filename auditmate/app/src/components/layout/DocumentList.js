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

const Label = styled.div`
  width: 100px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  color: black;
  font-size: 14px;
  font-family: 'Inter', sans-serif;
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
  font-family: 'Inter', sans-serif;
  font-weight: 600;
  word-wrap: break-word;
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

const DocumentList = ({ category, proof, selectedIndex, checkedDocuments }) => {
  const { selectedDocumentRule } = useContext(RuleContext);
  const { handleCheckedDocumentsChange } = useContext(TableContext);
  const inputBuffer = useRef('');

  // useMemo로 sections 생성
  const documentSections = useMemo(
    () => selectedDocumentRule.세목별서류?.[category] || {},
    [selectedDocumentRule.세목별서류, category]
  );
  const proofSections = useMemo(
    () => selectedDocumentRule.증빙구분별서류?.[proof] || {},
    [selectedDocumentRule.증빙구분별서류, proof]
  );

  // 1. doc 버튼에 번호 부여 (1번부터)
  const docList = useMemo(() => {
    let docs = [];
    Object.entries(documentSections).forEach(([phase, phaseDocs]) => {
      docs = docs.concat(phaseDocs);
    });
    Object.entries(proofSections).forEach(([proofType, proofDocs]) => {
      docs = docs.concat(proofDocs);
    });
    // 중복 제거
    return [...new Set(docs)];
  }, [documentSections, proofSections]);

  // handleClick을 useCallback으로 감싸고, useEffect deps에 포함
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
      // + 입력 시작
      if (e.key === '+') {
        inputBuffer.current = '+';
        return;
      }
      // +가 입력된 상태에서 숫자 입력
      if (inputBuffer.current === '+' && /^\d$/.test(e.key)) {
        let idx;
        if (e.key === '0') {
          idx = 19; // +0 → 20번째(인덱스 19)
        } else {
          idx = 10 + Number(e.key) - 1; // +1~+9 → 11~19번째(인덱스 10~18)
        }
        if (docList[idx]) {
          handleClick(docList[idx]);
        }
        inputBuffer.current = '';
        return;
      }
      // 일반 숫자 입력
      if (/^\d$/.test(e.key)) {
        let idx;
        if (e.key === '0') {
          idx = 9; // 0 → 10번째(인덱스 9)
        } else {
          idx = Number(e.key) - 1; // 1~9 → 1~9번째(인덱스 0~8)
        }
        if (docList[idx]) {
          handleClick(docList[idx]);
        }
        inputBuffer.current = '';
        return;
      }
      // 그 외 입력 시 버퍼 초기화
      inputBuffer.current = '';
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [docList, handleClick]);

  // 3. 버튼에 번호 표시
  let docIdx = 0;

  return (
    <Wrapper>
      <Title>검토 사항</Title>
      <Section>
        <SubTitle>세목: {category}</SubTitle>
        {Object.entries(documentSections).map(([phase, docs]) => (
          <React.Fragment key={phase}>
            {chunkArray(docs, 3).map((docGroup, rowIndex) => (
              <Row key={`${phase}-${rowIndex}`}>
                {rowIndex === 0 && <Label>{phase}</Label>}
                {rowIndex > 0 && <Label>{''}</Label>}
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
          </React.Fragment>
        ))}
        <SubTitle>증빙구분: {proof}</SubTitle>
        {Object.entries(proofSections).map(([proofType, docs]) => (
          <React.Fragment key={proofType}>
            {chunkArray(docs, 3).map((docGroup, rowIndex) => (
              <Row key={`${proofType}-${rowIndex}`}>
                {rowIndex === 0 && <Label>{proofType}</Label>}
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
          </React.Fragment>
        ))}
      </Section>
    </Wrapper>
  );
};

export default DocumentList;