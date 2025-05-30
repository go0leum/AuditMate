import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useLocation } from 'react-router-dom'; // 추가

// Context 생성
export const FileContext = createContext();

const FileProvider = ({ children }) => {
  const [excelFile, setExcelFile] = useState(null);
  const [attachmentFolder, setAttachmentFolder] = useState(null);
  const [ruleName, setRuleName] = useState(null);
  const [ruleData, setRuleData] = useState([]);
  const [documentRule, setDocumentRule] = useState(null);
  const [categoryRule, setCategoryRule] = useState(null);
  const [fileData, setFileData] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const location = useLocation(); // 추가

  const handleCheckboxChange = (file) => {
    setSelectedFiles((prev) =>
      prev.includes(file) ? prev.filter((f) => f !== file) : [...prev, file]
    );
  };

  const handleCheckExport = async (type) => {
    if (selectedFiles.length === 0) {
      alert("다운로드할 파일을 선택하세요.");
      return;
    }

    // 다운로드 가능한 파일만 필터링
    const filesToDownload = selectedFiles.filter((file) => !!file[type]);
    if (filesToDownload.length === 0) {
      alert(`${type}이(가) 존재하는 파일을 선택하세요.`);
      return;
    }

    try {
      await Promise.all(
        filesToDownload.map(async (file) => {
          const fileName = file[type];
          const response = await fetch(`http://localhost:8000/api/download/${file.folderName}/${fileName}/`);
          if (!response.ok) throw new Error(`다운로드 실패: ${fileName}`);

          const blob = await response.blob();
          const link = document.createElement("a");
          link.href = URL.createObjectURL(blob);
          link.download = fileName;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        })
      );
      alert("파일이 다운로드되었습니다.");
    } catch (error) {
      console.error("다운로드 오류:", error);
      alert("파일 다운로드 실패!");
    }
  };

  const fetchFileData = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/files/'); // Django API 호출
      setFileData(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Error fetching data:", error);
      setFileData([]); // 오류 발생 시 기본값 설정
    }
  };

  const fetchRuleData = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/rules/'); // Django API 호출
      setRuleData(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Error fetching data:", error);
      setRuleData([]); // 오류 발생 시 기본값 설정
    }
  };

  const handleUpload = async (type) => {
    let formData = new FormData();

    if (type === "file") {
      if (excelFile && attachmentFolder) {
        formData.append("excel_file", excelFile);
        Array.from(attachmentFolder).forEach((file) => {
          formData.append("attachment_folder", file);
        });
      } else {
        alert("Excel 파일과 첨부파일 폴더를 선택하세요.");
        return;
      }
    } else if (type === "rule") {
      if (ruleName && documentRule && categoryRule) {
        formData.append("rule_name", ruleName);
        formData.append("document_rule", documentRule);
        formData.append("category_rule", categoryRule);
      } else {
        alert("규칙 이름과 검토 자료 규칙, 증빙 구분 & 세목명 규칙을 입력력하세요.");
        return;
      }
    } else {
      alert("잘못된 업로드 타입입니다.");
      return;
    }

    try {
      const response = await fetch("http://localhost:8000/api/upload/", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        alert("파일 업로드 성공!");
      } else {
        alert("파일 업로드 실패!");
      }
    } catch (error) {
      console.error("업로드 오류:", error);
      alert("업로드 중 오류 발생");
    }
  };

  useEffect(() => {
    // 경로가 /recentFile 또는 /ruleList일 때만 실행
    if (
      location.pathname === '/recentFile' ||
      location.pathname === '/ruleList'
    ) {
      fetchFileData();
      fetchRuleData();
    }
    // eslint-disable-next-line
  }, [location.pathname]); // 경로가 바뀔 때만 실행

  return (
    <FileContext.Provider
      value={{
        fileData,
        ruleName,
        ruleData,
        excelFile,
        attachmentFolder,
        documentRule,
        categoryRule,
        handleCheckboxChange,
        handleCheckExport,
        selectedFiles,
        setAttachmentFolder,
        setExcelFile,
        setDocumentRule,
        setCategoryRule,
        setRuleName,
        handleUpload,
      }}
    >
      {children}
    </FileContext.Provider>
  );
};

export default FileProvider;