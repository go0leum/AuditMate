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
  font-family: 'NanumGothic', sans-serif;
  font-weight: 600;
  word-wrap: break-word;
`;

const ButtonText = styled.div`
  color: ${({ $active }) => ($active ? 'white' : 'black')};
  font-size: 14px;
  font-family: 'NanumGothic', sans-serif;
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
  font-family: 'NanumGothic', sans-serif;
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
  const handleInputConfirm = (phase) => {
    const v = inputValue[phase]?.trim();
    if (v) {
      // 기존 배열에 새 값 추가
      const newArr = Array.isArray(ruleData[phase])
        ? [...ruleData[phase], v]
        : [v];
      // 상위에서 onRuleChange={newDocs => ...}로 넘겨줬으므로, phase별 새 배열만 넘김
      onRuleChange(
        {
          ...ruleData,
          [phase]: newArr
        },
        phase
      );
    }
    setInputActive(prev => ({ ...prev, [phase]: false }));
    setInputValue(prev => ({ ...prev, [phase]: "" }));
  };

  // 항목 삭제
  const handleRemove = (phase, idx) => {
    const newArr = Array.isArray(ruleData[phase])
      ? ruleData[phase].filter((_, i) => i !== idx)
      : [];
    // 전체 객체를 넘김
    onRuleChange(
      {
        ...ruleData,
        [phase]: newArr
      },
      phase
    );
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
                  {Array.isArray(itemGroup) ? itemGroup.map((item, idx) => (
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
                      onIconClick={() => handleRemove(phase, rowIdx * 3 + idx)}
                      style={disableSelect ? { pointerEvents: "auto" } : {}}
                    >
                      <ButtonText $active={selectedDocName === item}>{item}</ButtonText>
                    </EditButton>
                  )) : null}
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
                                fontFamily: 'NanumGothic',
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