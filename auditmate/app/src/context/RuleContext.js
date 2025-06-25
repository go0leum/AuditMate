import { FileContext } from './FileContext';
import React, { createContext, useState, useCallback, useEffect, useContext } from 'react';
import axios from 'axios';

// Context 생성
export const RuleContext = createContext();

const RuleProvider = ({ children }) => {
  // localStorage에서 복원하지 않고, 무조건 null로 시작
  const [editRule, setEditRule] = useState(null);
  const [selectedDocumentRule, setSelectedDocumentRule] = useState(null);
  const [selectedCategoryRule, setSelectedCategoryRule] = useState(null);
  const { setRuleData } = useContext(FileContext); 
  const [skipNextSave, setSkipNextSave] = useState(false);

  const handleEditButton = useCallback(
    (type, editRule) => (newValue, key) => {
      setEditRule(prev => {
        if (!prev) return prev;
        if (type === "category") {
          return {
            ...prev,
            categoryRule: {
              ...prev.categoryRule,
              ...newValue,
            }
          };
        } else if (type === "phase") {
          return {
            ...prev,
            documentRule: {
              ...prev.documentRule,
              세목별서류: {
                ...prev.documentRule.세목별서류,
                [key]: newValue,
              },
              ...Object.fromEntries(
                Object.entries(prev.documentRule).filter(([k]) => k !== "세목별서류")
              ),
            }
          };
        } else if (type === "proof") {
          return {
            ...prev,
            documentRule: {
              ...prev.documentRule,
              증빙구분별서류: {
                ...prev.documentRule.증빙구분별서류,
                ...newValue,
              },
              ...Object.fromEntries(
                Object.entries(prev.documentRule).filter(([k]) => k !== "증빙구분별서류")
              ),
            }
          };
        } else if (type === "fields") {
          return {
            ...prev,
            documentRule: {
              ...prev.documentRule,
              서류별기입항목: {
                ...prev.documentRule.서류별기입항목,
                ...newValue,
              },
              ...Object.fromEntries(
                Object.entries(prev.documentRule).filter(([k]) => k !== "서류별기입항목")
              ),
            }
          };
        }
        return prev;
      });
    },
    []
  );

  const saveRule = useCallback(async (rule) => {
    if (!rule) return;
    try {
      await axios.post("http://localhost:8000/api/save_rule/", rule);
    } catch (e) {
      console.error("규칙 저장 실패", e);
    }
  }, []);

  useEffect(() => {
    if (!editRule) return;
    if (skipNextSave) {
      setSkipNextSave(false);
      return;
    }
    const timer = setTimeout(() => {
      saveRule(editRule);
    }, 100);
    return () => clearTimeout(timer);
  }, [editRule, saveRule, skipNextSave]);

  useEffect(() => {
    if (!editRule || !editRule.folderName || !setRuleData) return;
    setRuleData(prev => {
      if (!Array.isArray(prev)) return prev;
      const idx = prev.findIndex(rule => rule.folderName === editRule.folderName);
      if (idx === -1) return prev;
      if (JSON.stringify(prev[idx]) === JSON.stringify(editRule)) return prev;
      return prev.map(rule =>
        rule.folderName === editRule.folderName ? { ...rule, ...editRule } : rule
      );
    });
  }, [editRule, setRuleData]);

  const resetRules = useCallback(() => {
    setEditRule(null);
    setSelectedDocumentRule(null);
    setSelectedCategoryRule(null);
    // localStorage.removeItem('editRule'); // 삭제
  }, []);

  const handleSetRule = useCallback((rule) => {
    setEditRule(rule);
    setSelectedDocumentRule(rule?.documentRule || null);
    setSelectedCategoryRule(rule?.categoryRule || null);
  }, []);

  const handleSetRuleFromFetch = useCallback((rule) => {
    setSkipNextSave(true);
    setEditRule(rule);
    setSelectedDocumentRule(rule?.documentRule || null);
    setSelectedCategoryRule(rule?.categoryRule || null);
  }, []);

  return (
    <RuleContext.Provider
      value={{
        editRule,
        setEditRule,
        selectedDocumentRule,
        setSelectedDocumentRule,
        selectedCategoryRule,
        setSelectedCategoryRule,
        handleEditButton, 
        resetRules,
        handleSetRule,
        handleSetRuleFromFetch,
      }}
    >
      {children}
    </RuleContext.Provider>
  );
};

export default RuleProvider;