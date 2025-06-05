import React, { createContext, useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import debounce from 'lodash.debounce';
import { useLocation } from 'react-router-dom';

export const TableContext = createContext();

const TableProvider = ({ children }) => {
  const location = useLocation();
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
        setTableData(data);
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

  const prepareTableDataForSave = (data) =>
    data.map(row => ({
      ...row,
      검토내용:
        row.검토내용 && typeof row.검토내용 === 'object'
          ? JSON.stringify(row.검토내용)
          : row.검토내용,
    }));

  const saveTableData = useCallback(async (data) => {
    try {
      const preparedData = prepareTableDataForSave(data);
      await axios.post('http://localhost:8000/api/save-xlsx/', {
        folderName: selectedXlsxFile?.folderName,
        xlsxFile: selectedXlsxFile?.xlsxFile,
        lastModified: selectedXlsxFile?.lastModified,
        data: preparedData,
      });
    } catch (error) {
      console.error("Error saving data:", error);
    }
  }, [selectedXlsxFile]);

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

  const debouncedSave = useMemo(
    () => debounce((data) => {
      saveTableData(data);
    }, 100), //변경후 0.1초후 저장
    [saveTableData]
  );

  const handleTagSelect = useCallback((originalIndex, label, selected) => {
    setTableData(prev =>
      prev.map((row, idx) =>
        idx === originalIndex ? { ...row, [label]: selected } : row
      )
    );
  }, [setTableData]);

  // 앱 시작 시 localStorage에서 복원
  useEffect(() => {
    const saved = localStorage.getItem('selectedXlsxFile');
    if (saved) {
      setSelectedXlsxFile(JSON.parse(saved));
    }
  }, []);

  // selectedXlsxFile이 바뀔 때마다 localStorage에 저장
  useEffect(() => {
    if (selectedXlsxFile) {
      localStorage.setItem('selectedXlsxFile', JSON.stringify(selectedXlsxFile));
    }
  }, [selectedXlsxFile]);

  // reviewTable 진입 시 한 번만 실행
  useEffect(() => {
    if (location.pathname.includes('/reviewTable/') && selectedXlsxFile) {
      fetchExcelData();
    }
  }, [location.pathname, selectedXlsxFile, fetchExcelData]);

  // 자동 저장
  useEffect(() => {
    if (selectedXlsxFile && tableData.length > 0) {
      debouncedSave(tableData);
    }
    return () => debouncedSave.cancel();
  }, [selectedXlsxFile, tableData, debouncedSave]);

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
      }}
    >
      {children}
    </TableContext.Provider>
  );
};

export default TableProvider;
