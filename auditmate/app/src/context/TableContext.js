import React, { createContext, useState, useEffect, useCallback, useMemo, useContext } from 'react';
import axios from 'axios';
import debounce from 'lodash.debounce';
import { useLocation } from 'react-router-dom';
import { RuleContext } from './RuleContext';

export const TableContext = createContext();

const TableProvider = ({ children }) => {
  const location = useLocation();
  const { ruleLoading, selectedCategoryRule, selectedDocumentRule } = useContext(RuleContext);
  const [selectedXlsxFile, setSelectedXlsxFile] = useState(null);
  const [tableData, setTableData] = useState([]);

  
  const fetchExcelData = useCallback(async () => {
    if (!selectedXlsxFile) return;

    try {
      const response = await axios.post('http://localhost:8000/api/read-xlsx/', {
        folderName: selectedXlsxFile?.folderName,
        xlsxFile: selectedXlsxFile?.xlsxFile,
      });

      const { status, data, message, expected_columns, actual_columns } = response.data;

      if (status === 'success') {
        // '검토내용'을 항상 배열로 변환
        const normalizedData = data.map(row => ({
          ...row,
          검토내용: Array.isArray(row.검토내용)
            ? row.검토내용
            : typeof row.검토내용 === 'string' && row.검토내용.trim() !== ''
              // 괄호 밖 쉼표만 분할
              ? row.검토내용.split(/,(?![^(]*\))/).map(s => s.trim())
              : []
        }));
        setTableData(normalizedData);
      } else if (status === 'warning') {
        alert(
          `⚠️ 컬럼명이 다릅니다.\n\n[예상 컬럼]\n${expected_columns.join(', ')}\n\n[실제 컬럼]\n${actual_columns.join(', ')}\n\n${message}`
        );
        setTableData([]);
      } else {
        console.error("Server returned unexpected structure:", response.data);
        setTableData([]);
      }

    } catch (error) {
      console.error("Error fetching data:", error);
      setTableData([]);
    }
  }, [selectedXlsxFile]); 

  const saveTableData = useCallback(async (data) => {
    // 서버로 보낼 때만 변환
    const dataToSave = data.map(row => ({
      ...row,
      검토내용: Array.isArray(row.검토내용) ? row.검토내용.join(', ') : row.검토내용
    }));
    try {
      await axios.post('http://localhost:8000/api/save-xlsx/', {
        folderName: selectedXlsxFile?.folderName,
        xlsxFile: selectedXlsxFile?.xlsxFile,
        lastModified: selectedXlsxFile?.lastModified,
        data: dataToSave,
      });
    } catch (error) {
      console.error("Error saving data:", error);
    }
  }, [selectedXlsxFile]);

  const debouncedSave = useMemo(
    () => debounce((data) => {
      saveTableData(data);
    }, 100), //변경후 0.1초후 저장
    [saveTableData]
  );

  // 앱 시작 시 localStorage에서 복원
  useEffect(() => {
    const savedFile = localStorage.getItem('selectedXlsxFile');
    if (savedFile) {
      setSelectedXlsxFile(JSON.parse(savedFile));
    }
    const savedTableData = localStorage.getItem('tableData');
    if (savedTableData) {
      setTableData(JSON.parse(savedTableData));
    }
  }, []);

  // selectedXlsxFile이 바뀔 때마다 localStorage에 저장
  useEffect(() => {
    if (selectedXlsxFile) {
      localStorage.setItem('selectedXlsxFile', JSON.stringify(selectedXlsxFile));
    }
  }, [selectedXlsxFile]);

  // tableData가 바뀔 때마다 localStorage에 저장
  useEffect(() => {
    if (tableData) {
      localStorage.setItem('tableData', JSON.stringify(tableData));
    }
  }, [tableData]);

  // 자동 저장
  useEffect(() => {
    if (selectedXlsxFile && tableData.length > 0) {
      debouncedSave(tableData);
    }
    return () => debouncedSave.cancel();
  }, [selectedXlsxFile, tableData, debouncedSave]);

  // reviewTable 진입 시 규칙이 모두 준비되면 항상 서버에서 데이터 fetch
  useEffect(() => {
    if (
      location.pathname.includes('/reviewTable/') &&
      selectedXlsxFile &&
      !ruleLoading &&
      selectedCategoryRule &&
      selectedDocumentRule
    ) {
      fetchExcelData();
    }
    // fetchExcelData는 useCallback이므로 의존성 배열에 포함
  }, [
    location.pathname,
    selectedXlsxFile,
    ruleLoading,
    selectedCategoryRule,
    selectedDocumentRule,
    fetchExcelData,
  ]);

  const handleExport = async () => {
    try {
      const response = await fetch(`http://localhost:8000/api/download/${selectedXlsxFile.folderName}/${selectedXlsxFile.xlsxFile}/`);
      if (!response.ok) throw new Error(`다운로드 실패: ${selectedXlsxFile.xlsxFile}`);

      const blob = await response.blob();
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = selectedXlsxFile.xlsxFile;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      alert("모든 파일이 다운로드되었습니다.");
    } catch (error) {
      console.error("파일 다운로드 오류:", error);
      alert("일부 파일 다운로드 실패!");
    }
  };

  const handleTagSelect = useCallback((originalIndex, label, selected) => {
    setTableData(prev =>
      prev.map((row, idx) =>
        idx === originalIndex ? { ...row, [label]: selected } : row
      )
    );
  }, [setTableData]);

  const handleCheckedDocumentsChange = useCallback((selectedIndex, docs) => {
    setTableData(prevTable =>
      prevTable.map((r, idx) =>
        idx === selectedIndex
          ? { ...r, 검토내용: Array.isArray(docs) ? docs : [docs] }
          : r
      )
    );
  }, [setTableData]);

  const handleMemoChange = useCallback((selectedIndex, value) => {
    setTableData(prev =>
      prev.map((r, idx) =>
        idx === selectedIndex
          ? { ...r, 메모: value }
          : r
      )
    );
  }, [setTableData]);

  const handleNoteChange = useCallback((selectedIndex, value) => {
    setTableData(prev =>
      prev.map((r, idx) =>
        idx === selectedIndex
          ? { ...r, 보완사항: value }
          : r
      )
    );
  }, [setTableData]);

  return (
    <TableContext.Provider 
      value={{
        handleTagSelect,
        handleExport,
        selectedXlsxFile, 
        tableData,
        setSelectedXlsxFile,
        setTableData,
        fetchExcelData,
        ruleLoading,
        // handleReviewContentSave,
        handleCheckedDocumentsChange,
        handleMemoChange,
        handleNoteChange,
      }}
    >
      {children}
    </TableContext.Provider>
  );
};

export default TableProvider;
