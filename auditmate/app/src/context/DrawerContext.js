import React, { createContext, useState, useRef, useEffect } from 'react';

export const DrawerContext = createContext();

const TableDrawerProvider = ({ children }) => {
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [inputValues, setInputValues] = useState({});

  const sideRef = useRef(null);

  const [memo, setMemo] = useState('');
  const [note, setNote] = useState('');

  const columns = [
    { label: '집행실행일자', width: 90 },
    { label: '증빙구분', width: 105 },
    { label: '집행용도', width: 80 },
    { label: '비목명', width: 80 },
    { label: '세목명', width: 105 },
    { label: '거래처명', width: 80 },
    { label: '예금주명', width: 80 },
    { label: '집행금액', width: 80 },
    { label: '검토내용', width: 150 },
    { label: '메모', width: 150 },
    { label: '보완사항', width: 150 },
  ];

  // 외부 클릭 닫기
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (sideRef.current && !sideRef.current.contains(e.target)) {
        // 필요시 부모로 알리는 onClose 함수
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <DrawerContext.Provider 
      value={{
        columns,
        sideRef,
        selectedDocument,
        setSelectedDocument,
        inputValues,
        setInputValues,
        memo,
        setMemo,
        note,
        setNote,
      }}
    >
      {children}
    </DrawerContext.Provider>
  );
};

export default TableDrawerProvider;
