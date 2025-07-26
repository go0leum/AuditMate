import React, { createContext, useState, useEffect } from "react";

export const ContactContext = createContext();

export const ContactProvider = ({ children }) => {
  const [contactData, setContactData] = useState([]);
  const [columns, setColumns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRows, setSelectedRows] = useState([]); // 선택된 row id 또는 index 저장

  const keyMap = {
    "상위기관": "parentOrg",
    "사업명": "projectName",
    "보조사업자명": "subOrg",
    "보조사업명": "subProjectName",
    "담당자": "manager",
    "전화번호": "phone",
    "이메일": "email",
    "상태": "status",
    "마감일": "lastModified",
    "메모": "memo"
  };

  const convertKeys = (row) =>
    Object.fromEntries(
      Object.entries(row).map(([k, v]) => [keyMap[k] || k, v])
    );

  const fetchContactData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("http://localhost:8000/api/read_contact_info/");
      const result = await response.json();
      if (result.status === "success") {
        setContactData((result.data || []).map(convertKeys));
        setColumns((result.columns || []).map((col) => keyMap[col] || col));
      } else {
        setError(result.message || "데이터를 불러올 수 없습니다.");
      }
    } catch (err) {
      setError("서버 연결 오류");
    }
    setLoading(false);
  };

  // 체크박스 선택/해제 핸들러
  const handleCheck = (rowIndex) => {
    setSelectedRows((prev) =>
      prev.includes(rowIndex)
        ? prev.filter((idx) => idx !== rowIndex)
        : [...prev, rowIndex]
    );
  };

  // 선택된 row 데이터 제거
  const handleCheckDelete = () => {
    setContactData((prev) =>
      prev.filter((_, idx) => !selectedRows.includes(idx))
    );
    setSelectedRows([]);
  };

  useEffect(() => {
    fetchContactData();
  }, []);

  return (
    <ContactContext.Provider
      value={{
        contactData,
        columns,
        loading,
        error,
        fetchContactData,
        selectedRows,
        setSelectedRows,
        setContactData,
        handleCheck,
        handleCheckDelete,
      }}
    >
      {children}
    </ContactContext.Provider>
  );
};