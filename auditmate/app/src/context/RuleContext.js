import React, { createContext, useState } from 'react';

// Context 생성
export const RuleContext = createContext();

const RuleProvider = ({ children }) => {
  const [selectedDocumentRule, setSelectedDocumentRule] = useState(null);
  const [selectedCategoryRule, setSelectedCategoryRule] = useState(null);

  // rule 객체를 받아서 각각의 상태로 분리 저장
  const handleSetRule = (rule) => {
    if (rule.documentRule && rule.categoryRule) {
      
      setSelectedDocumentRule(rule.documentRule);
      setSelectedCategoryRule(rule.categoryRule);

      alert("검토 자료규칙과 증빙 구분&세목명 규칙이 모두 설정되었습니다.");
    } else {
      alert("검토 자료규칙과 증빙 구분&세목명 규칙이이 모두 필요합니다.");
      return;
    }
  };

  return (
    <RuleContext.Provider
      value={{
        selectedDocumentRule,
        setSelectedDocumentRule,
        selectedCategoryRule,
        setSelectedCategoryRule,
        handleSetRule,
      }}
    >
      {children}
    </RuleContext.Provider>
  );
};

export default RuleProvider;