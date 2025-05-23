import React, { createContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useLocation } from 'react-router-dom';

export const TableContext = createContext();

const TableProvider = ({ children }) => {
  const location = useLocation();
  const [selectedXlsxFile, setSelectedXlsxFile] = useState(null);
  const [reviewTableData, setReviewTableData] = useState([]);

  const fetchExcelData = useCallback(async () => {
    if (!selectedXlsxFile) return;

    try {
      const response = await axios.post('http://localhost:8000/api/read-xlsx/', {
        folderName: selectedXlsxFile?.folderName,
        xlsxFile: selectedXlsxFile?.xlsxFile,
      });

      const { status, data, message, expected_columns, actual_columns } = response.data;

      if (status === 'success') {
        setReviewTableData(data);
      } else if (status === 'warning') {
        alert(
          `⚠️ 컬럼명이 다릅니다.\n\n[예상 컬럼]\n${expected_columns.join(', ')}\n\n[실제 컬럼]\n${actual_columns.join(', ')}\n\n${message}`
        );
        setReviewTableData([]);
      } else {
        console.error("Server returned unexpected structure:", response.data);
        setReviewTableData([]);
      }

    } catch (error) {
      console.error("Error fetching data:", error);
      setReviewTableData([]);
    }
  }, [selectedXlsxFile]); // 💡 의존성: selectedXlsxFile만 포함

  useEffect(() => {
    if (location.pathname.includes('/reviewTable/')) {
      fetchExcelData();
    }
  }, [fetchExcelData, location.pathname]); // 이제 경고 없이 안전

  return (
    <TableContext.Provider 
      value={{
        selectedXlsxFile, 
        reviewTableData,
        setSelectedXlsxFile,
        setReviewTableData,
      }}
    >
      {children}
    </TableContext.Provider>
  );
};

export default TableProvider;
