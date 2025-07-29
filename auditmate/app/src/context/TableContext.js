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
  const [tableLoading, setTableLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  const fetchExcelData = useCallback(async () => {
    if (!selectedXlsxFile) return;
    setTableData([]); // 데이터 초기화
    setTableLoading(true); // 로딩 시작

    try {
      const response = await axios.post('http://localhost:8000/api/read-xlsx/', {
        folderName: selectedXlsxFile?.folderName,
        xlsxFile: selectedXlsxFile?.xlsxFile,
      });

      const { status, data, message, extra_columns } = response.data;

      if (status === 'success') {
        // '검토사항'을 항상 배열로 변환
        const normalizedData = data.map(row => ({
          ...row,
          검토사항: Array.isArray(row.검토사항)
            ? row.검토사항
            : typeof row.검토사항 === 'string' && row.검토사항.trim() !== ''
              // 괄호 밖 쉼표만 분할
              ? row.검토사항.split(/,(?![^(]*\))/).map(s => s.trim())
              : []
        }));
        setTableData(normalizedData);
        setTableLoading(false); // 로딩 완료
      } else if (status === 'warning') {
        alert(
          `⚠️ 예상치 못한 컬럼명이 있습니다.\n\n[예외 컬럼]\n${extra_columns.join(', ')}\n\n${message}`
        );
        setTableData([]);
        setTableLoading(false); // 로딩 완료
      } else {
        console.error("Server returned unexpected structure:", response.data);
        setTableData([]);
        setTableLoading(false); // 로딩 완료
        alert("데이터를 불러오는 중 오류가 발생했습니다.");
      }

    } catch (error) {
      console.error("Error fetching data:", error);
      setTableData([]);
      setTableLoading(false); // 로딩 완료
      alert("데이터를 불러오는 중 오류가 발생했습니다.");
    }
  }, [selectedXlsxFile]); 

  const saveTableData = useCallback(async (data) => {
    // 서버로 보낼 때만 변환
    const dataToSave = data.map(row => ({
      ...row,
      검토사항: Array.isArray(row.검토사항) ? row.검토사항.join(', ') : row.검토사항
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
    }, 1000), //변경후 1초후 저장
    [saveTableData]
  );

  
  // 파일이 바뀌면 즉시 데이터 비움
  useEffect(() => {
    setTableData([]); // 파일이 바뀌면 즉시 데이터 비움
  }, [selectedXlsxFile]);

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
    if (selectedXlsxFile && tableData.length > 0 && !isEditing) {
      debouncedSave(tableData);
    }
    return () => debouncedSave.cancel();
  }, [selectedXlsxFile, tableData, debouncedSave, isEditing]);

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
          ? { ...r, 검토사항: Array.isArray(docs) ? docs : [docs] }
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
        tableLoading,
        setTableLoading,
        isEditing,
        setIsEditing,
      }}
    >
      {children}
    </TableContext.Provider>
  );
};

export default TableProvider;
