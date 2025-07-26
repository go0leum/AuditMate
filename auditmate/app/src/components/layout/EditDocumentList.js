import React, { useState } from "react";
import EditButton from "../common/EditButton";
import styled from "styled-components";

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

const ButtonText = styled.div`
  color: ${({ $active }) => ($active ? 'white' : 'black')};
  font-size: 14px;
  font-family: 'Inter', sans-serif;
  font-weight: 600;
  word-wrap: break-word;
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

const SubTitle = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  color: #0647A9;           // 원하는 색상으로 변경
  font-size: 14px;          // 원하는 크기로 변경
  font-family: 'Inter', sans-serif;
  font-weight: 500;
  word-wrap: break-word;
`;

const EditDocumentList = ({
  title,
  ruleData,
  onRuleChange,
  setSelectedDocName,
  selectedDocName,
  disableSelect = false, // 추가
}) => {
  const [inputActive, setInputActive] = useState({});
  const [inputValue, setInputValue] = useState({});

  // 🔥 Helper function: 문서를 3개씩 그룹화
  const chunkArray = (arr, size) => {
    return Array.from({ length: Math.ceil(arr.length / size) }, (_, index) =>
      arr.slice(index * size, index * size + size)
    );
  };

  // + 버튼 클릭 시 input 활성화
  const handleAddInput = (phase) => {
    setInputActive(prev => ({ ...prev, [phase]: true }));
    setInputValue(prev => ({ ...prev, [phase]: "" }));
  };

  // input 값 변경
  const handleInputChange = (phase, e) => {
    setInputValue(prev => ({ ...prev, [phase]: e.target.value }));
  };

  // input에서 엔터/포커스아웃 시 추가
  const handleInputConfirm = (docName) => {
    const value = inputValue[docName]?.trim();
    if (value) {
      const items = Array.isArray(ruleData) ? ruleData : ruleData[docName] || [];
      const newArr = [...items, value];

      // 증빙구분/세목명(배열)일 때
      if (Array.isArray(ruleData)) {
        onRuleChange(newArr, docName);
      }
      // "서류별기입항목" 구조일 때
      else if (
        title && (
          title.includes("기입항목") ||
          Object.keys(ruleData).length === 1
        )
      ) {
        onRuleChange(newArr, docName);
      } else {
        // 증빙구분별/세목별 서류는 proofType(phase) 전체 객체를 넘김
        onRuleChange(
          {
            ...ruleData,
            [docName]: newArr
          },
          docName
        );
      }
    }
    setInputActive(prev => ({ ...prev, [docName]: false }));
    setInputValue(prev => ({ ...prev, [docName]: "" }));
  };

  // 항목 삭제
  const handleRemove = (phase, idx) => {
    const items = Array.isArray(ruleData[phase]) ? ruleData[phase] : [];
    const newArr = items.filter((_, i) => i !== idx);

    // "서류별기입항목" 구조일 때는 phase가 문서명임
    if (
      title && (
        title.includes("기입항목") || // "기입항목"이 제목에 포함되어 있으면
        Object.keys(ruleData).length === 1 // 단일 문서만 있을 때도
      )
    ) {
      // 기입항목만 배열로 넘김
      onRuleChange(newArr, phase);
    } else {
      // 증빙구분별/세목별 서류는 객체 전체를 넘김
      onRuleChange(
        {
          ...ruleData,
          [phase]: newArr
        },
        phase
      );
    }
  };

  return (  
    <>
      {title && (
        <SubTitle>{title}</SubTitle>
      )}
      {Object.entries(ruleData).map(([phase, items]) => {
        const docs = Array.isArray(items) ? items : []; // <-- 추가
        const groups = chunkArray(docs, 3);
        const needExtraRow = groups.length === 0 || groups[groups.length - 1].length === 3;
        if (needExtraRow) groups.push([]);

        return (
          <React.Fragment key={phase}>
            {groups.map((itemGroup, rowIdx) => {
              const isLastRow = rowIdx === groups.length - 1;
              return (
                <Row key={`${phase}-${rowIdx}`}>
                  {rowIdx === 0 && <Label>{phase}</Label>}
                  {rowIdx > 0 && <Label />}
                  {Array.isArray(itemGroup) ? itemGroup.map((item, idx) => {
                    // 실제 배열에서의 인덱스 계산
                    const realIdx = rowIdx * 3 + idx;
                    return (
                      <EditButton
                        key={item}
                        width={150}
                        $active={selectedDocName === item}
                        icon="-"
                        iconColor="black"
                        onClick={
                          disableSelect
                            ? undefined
                            : () =>
                                setSelectedDocName &&
                                setSelectedDocName(selectedDocName === item ? "" : item)
                        }
                        onIconClick={() => handleRemove(phase, realIdx)}
                        style={disableSelect ? { pointerEvents: "auto" } : {}}
                      >
                        <ButtonText $active={selectedDocName === item}>{item}</ButtonText>
                      </EditButton>
                    );
                  }) : null}
                  {/* 마지막 row의 첫 번째 칸에 +버튼 또는 input, 나머지는 빈칸 */}
                  {isLastRow &&
                    Array.from({ length: 3 - itemGroup.length }).map((_, emptyIdx) =>
                      emptyIdx === 0 ? (
                        inputActive[phase] ? (
                          <EditButton width={150} $active={false} key="input">
                            <input
                              autoFocus
                              style={{
                                width: "100%",
                                border: "none",
                                outline: "none",
                                fontSize: 14,
                                fontFamily: 'Inter',
                                backgroundColor: "#EEEEEE",
                                fontWeight: 600
                              }}
                              value={inputValue[phase] || ""}
                              onChange={e => handleInputChange(phase, e)}
                              onBlur={() => handleInputConfirm(phase)}
                              onKeyDown={e => {
                                if (e.key === "Enter") handleInputConfirm(phase);
                              }}
                            />
                          </EditButton>
                        ) : (
                          <EditButton
                            width={150}
                            $active={false} // +버튼은 항상 비활성화로
                            $plus={true} // ⭐️ 추가: +버튼만 기존 스타일 유지
                            icon="+"
                            iconColor="#0647A9"
                            onIconClick={() => handleAddInput(phase)}
                            key="plus"
                          />
                        )
                      ) : (
                        <div key={`empty-${emptyIdx}`} style={{ width: 150, height: 40 }} />
                      )
                    )}
                </Row>
              );
            })}
          </React.Fragment>
        );
      })}
    </>
  );
};

export default EditDocumentList;