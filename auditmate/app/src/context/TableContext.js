import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const TableContext = createContext();

const TableProvider = ({ children }) => {
  const [selectedXlsxFile, setSelectedXlsxFile] = useState(null);
  const [reviewTableData, setReviewTableData] = useState([]);

  const fetchExcelData = async () => {
    if (!selectedXlsxFile) return;

    try {
      const response = await axios.post('http://localhost:8000/api/read-xlsx/', {
        filename: selectedXlsxFile.xlsxFile,
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
        console.error("Server error:", message);
        setReviewTableData([]);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setReviewTableData([]);
    }
  };

  useEffect(() => {
    fetchExcelData();
  }, [selectedXlsxFile]);

  return (
    <TableContext.Provider 
      value={{
        selectedXlsxFile, 
        reviewTableData,
        setSelectedXlsxFile,
      }}
    >
      {children}
    </TableContext.Provider>
  );
};

export default TableProvider;
