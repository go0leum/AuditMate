import React, { createContext, useState, useCallback, useEffect, useRef } from 'react';
import axios from 'axios';

// Context 생성
export const RuleContext = createContext();

const RuleProvider = ({ children }) => {
  const [selectedDocumentRule, setSelectedDocumentRule] = useState(null);
  const [selectedCategoryRule, setSelectedCategoryRule] = useState(null);
  const [ruleLoading, setRuleLoading] = useState(true);
  const [pendingCategoryRule, setPendingCategoryRule] = useState(null);
  const [pendingDocumentRule, setPendingDocumentRule] = useState(null);
  const saveTimeout = useRef(null);

  // 규칙 초기화
  const resetRules = useCallback(() => {
    setSelectedDocumentRule(null);
    setSelectedCategoryRule(null);
  }, []);

  // rule 객체를 받아서 각각의 상태로 분리 저장
  const handleSetRule = useCallback(
    (rule) => {
      if (rule?.documentRule && rule?.categoryRule) {
        setSelectedDocumentRule(rule.documentRule);
        setSelectedCategoryRule(rule.categoryRule);
      } else {
        resetRules();
      }
    },
    [resetRules]
  );

  // ruleName(폴더명)과 ruleData를 받아서 rule 정보를 찾아 상태 업데이트
  const handleRuleSelect = useCallback(
    (ruleName, ruleData) => {
      const selectedRule = ruleData.find((r) => r.folderName === ruleName);
      if (selectedRule) {
        setSelectedDocumentRule(selectedRule.documentRule);
        setSelectedCategoryRule(selectedRule.categoryRule);
      } else {
        resetRules();
      }
    },
    [resetRules]
  );

  // 🔥 새로고침(마운트)마다 규칙 fetch
  useEffect(() => {
    setRuleLoading(true);
    axios
      .all([
        axios.get('http://localhost:8000/api/category-rule/'),
        axios.get('http://localhost:8000/api/document-rule/'),
      ])
      .then(([categoryRes, documentRes]) => {
        setSelectedCategoryRule(categoryRes.data);
        setSelectedDocumentRule(documentRes.data);
        setRuleLoading(false);
      })
      .catch(() => {
        resetRules();
        setRuleLoading(false);
      });
  }, [resetRules]);

  // 규칙 저장 함수 (categoryRule, documentRule을 각각 저장)
  const saveRules = async (categoryRule, documentRule) => {
    try {
      await axios.post('http://localhost:8000/api/category-rule/', categoryRule);
      await axios.post('http://localhost:8000/api/document-rule/', documentRule);
      // 저장 후 최신 데이터 fetch (옵션)
      const [categoryRes, documentRes] = await Promise.all([
        axios.get('http://localhost:8000/api/category-rule/'),
        axios.get('http://localhost:8000/api/document-rule/')
      ]);
      setSelectedCategoryRule(categoryRes.data);
      setSelectedDocumentRule(documentRes.data);
      return true;
    } catch (e) {
      // 에러 처리 필요시 추가
      return false;
    }
  };

  // debounce 저장 함수
  const debounceSaveRules = useCallback((categoryRule, documentRule) => {
    setPendingCategoryRule(categoryRule);
    setPendingDocumentRule(documentRule);
  }, []);

  useEffect(() => {
    if (pendingCategoryRule || pendingDocumentRule) {
      if (saveTimeout.current) clearTimeout(saveTimeout.current);
      saveTimeout.current = setTimeout(() => {
        saveRules(pendingCategoryRule, pendingDocumentRule);
        setPendingCategoryRule(null);
        setPendingDocumentRule(null);
      }, 500);
      return () => clearTimeout(saveTimeout.current);
    }
  }, [pendingCategoryRule, pendingDocumentRule]);

  return (
    <RuleContext.Provider
      value={{
        selectedDocumentRule,
        setSelectedDocumentRule,
        selectedCategoryRule,
        setSelectedCategoryRule,
        ruleLoading, 
        handleSetRule,
        handleRuleSelect,
        resetRules,
        saveRules, // 즉시 저장
        debounceSaveRules, // 0.5초 후 저장
      }}
    >
      {children}
    </RuleContext.Provider>
  );
};

export default RuleProvider;