import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

// Context 생성
export const FileContext = createContext();

const FileProvider = ({ children }) => {
  const [excelFile, setExcelFile] = useState(null);
  const [attachmentFolder, setAttachmentFolder] = useState(null);
  const [fileData, setFileData] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);

  const handleCheckboxChange = (file) => {
    setSelectedFiles((prev) =>
      prev.includes(file) ? prev.filter((f) => f !== file) : [...prev, file]
    );
  };

  const handleExport = async () => {
    if (selectedFiles.length === 0) {
      alert("다운로드할 파일을 선택하세요.");
      return;
    }

    try {
      await Promise.all(
        selectedFiles.map(async (file) => {
          const response = await fetch(`http://localhost:8000/api/download/${file.folderName}/${file.xlsxFile}/`);
          if (!response.ok) throw new Error(`다운로드 실패: ${file.xlsxFile}`);

          const blob = await response.blob();
          const link = document.createElement("a");
          link.href = URL.createObjectURL(blob);
          link.download = file.xlsxFile;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        })
      );
      alert("모든 파일이 다운로드되었습니다.");
    } catch (error) {
      console.error("파일 다운로드 오류:", error);
      alert("일부 파일 다운로드 실패!");
    }
  };

  const fetchData = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/files/'); // Django API 호출
      setFileData(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Error fetching data:", error);
      setFileData([]); // 오류 발생 시 기본값 설정
    }
  };

  const handleUpload = async () => {
    if (excelFile && attachmentFolder) {
      const formData = new FormData();
      formData.append("excel_file", excelFile);
      Array.from(attachmentFolder).forEach((file) => {
        formData.append("attachment_folder", file);
      });

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
    } else {
      alert("Excel 파일과 첨부파일 폴더를 선택하세요.");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <FileContext.Provider
      value={{
        fileData,
        handleCheckboxChange,
        handleExport,
        selectedFiles,
        setAttachmentFolder,
        setExcelFile,
        handleUpload,
      }}
    >
      {children}
    </FileContext.Provider>
  );
};

export default FileProvider;