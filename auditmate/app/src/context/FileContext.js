import React, { createContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useLocation } from 'react-router-dom'; // 추가

// Context 생성
export const FileContext = createContext();

const FileProvider = ({ children }) => {
  const [excelFile, setExcelFile] = useState(null);
  const [ruleName, setRuleName] = useState(null);
  const [documentRule, setDocumentRule] = useState(null);
  const [ruleData, setRuleData] = useState([]);
  const [fileData, setFileData] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [selectedRules, setSelectedRules] = useState([]);
  const location = useLocation(); // 추가

  const handleCheckboxChange = (type, file) => {
    if (type === "file") {
      setSelectedFiles((prev) =>
        prev.some(f => f.xlsxFile === file.xlsxFile)
          ? prev.filter(f => f.xlsxFile !== file.xlsxFile)
          : [...prev, file]
      );
    } else if (type === "rule") {
      setSelectedRules((prev) =>
        prev.some(r => r.folderName === file.folderName)
          ? [] // 이미 선택된 경우 해제(0개)
          : [file] // 새로 선택하면 해당 rule만 남김(1개)
      );
    } else {
      console.error("잘못된 타입입니다:", type);
    }
  };

  const handleRuleNameChange = useCallback(async (file, newRuleName) => {
    setFileData(prev =>
      prev.map(f =>
        f.folderName === file.folderName
          ? { ...f, ruleName: newRuleName }
          : f
      )
    );
    // 서버 metadata.json의 ruleName도 변경
    try {
      await fetch('http://localhost:8000/api/update_rule_name/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          folderName: file.folderName,
          ruleName: newRuleName,
        }),
      });
    } catch (error) {
      console.error('ruleName 서버 업데이트 실패:', error);
    }
  }, [setFileData]);

  // 파일 다운로드 함수 분리
  const downloadFiles = async (targets) => {
    // 사용자에게 검토사항/메모 포함 여부 확인
    const includeReview = window.confirm("다운로드 파일에 '검토사항' 및 '메모' 열을 포함하시겠습니까?");
    try {
      await Promise.all(
        targets.map(async (item) => {
          const fileName = item.xlsxFile;
          // type 파라미터로 포함 여부 전달
          const response = await fetch(
            `http://localhost:8000/api/download/${item.folderName}/${fileName}/?type=${includeReview ? 'full' : 'no_review'}`
          );
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

  // 규칙 다운로드 함수 분리
  const downloadRules = async (targets) => {
    try {
      await Promise.all(
        targets.map(async (item) => {
          const response = await fetch(
            `http://localhost:8000/api/download_rule/${item.folderName}/`
          );
          if (!response.ok) throw new Error(`다운로드 실패: ${item.folderName}`);
          const blob = await response.blob();
          const link = document.createElement("a");
          link.href = URL.createObjectURL(blob);
          link.download = `${item.folderName}.zip`;
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

  const handleCheckExport = async (type) => {
    if (type === "file") {
      if (selectedFiles.length === 0) {
        alert("다운로드할 파일을 선택하세요.");
        return;
      }
      const targets = selectedFiles.filter((file) => !!file.xlsxFile);
      if (targets.length === 0) {
        alert("다운로드할 엑셀 파일이 존재하는 항목을 선택하세요.");
        return;
      }
      await downloadFiles(targets);
    } else if (type === "rule") {
      if (selectedRules.length === 0) {
        alert("다운로드할 규칙을 선택하세요.");
        return;
      }
      const targets = selectedRules.filter((rule) => !!rule.folderName);
      if (targets.length === 0) {
        alert("다운로드할 규칙 파일이 존재하는 항목을 선택하세요.");
        return;
      }
      await downloadRules(targets);
    } else {
      alert("잘못된 다운로드 타입입니다.");
      return;
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
    let uploadUrl = "http://localhost:8000/api/upload/";

    if (type === "file") {
      if (excelFile) {
        formData.append("excel_file", excelFile);
        uploadUrl = "http://localhost:8000/api/upload/";
      } else {
        alert("Excel 파일을 선택하세요.");
        return;
      }
    } else if (type === "rule") {
      if (ruleName && documentRule) {
        formData.append("rule_name", ruleName);
        formData.append("document_rule", documentRule);
        uploadUrl = "http://localhost:8000/api/upload_rules/";
      } else {
        alert("규칙 이름과 검토 자료 규칙을 입력하세요.");
        return;
      }
    } else {
      alert("잘못된 업로드 타입입니다.");
      return;
    }

    try {
      const response = await fetch(uploadUrl, {
        method: "POST",
        body: formData,
      });
      const data = await response.json();

      if (response.ok && data.status !== "error") {
        if (type === "file") {
          // 파일 업로드 성공 후 read_xlsx로 실제 데이터 읽기 검증
          const folderName = data.metadata.folderName;
          const xlsxFile = data.metadata.xlsxFile;
          const readRes = await fetch("http://localhost:8000/api/read-xlsx/", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ folderName, xlsxFile }),
          });
          const readData = await readRes.json();

          if (readRes.ok && readData.status === "success") {
            alert("파일 업로드 성공!");
            await fetchFileData();
          } else {
            // 업로드된 파일 삭제
            await fetch(`http://localhost:8000/api/delete_file/${folderName}/`, {
              method: "DELETE",
            });
            alert("엑셀 파일을 읽을 수 없습니다. 정렬/필터를 해제하고 다시 업로드 해주세요.");
            await fetchFileData(); // 목록 갱신
          }
        } else if (type === "rule") {
          alert("규칙 업로드 성공!");
          await fetchRuleData();
        }
      } else {
        alert("파일 업로드 실패!");
      }
    } catch (error) {
      console.error("업로드 오류:", error);
      alert("업로드 중 오류 발생");
    }
  };

  // 선택한 파일 삭제 핸들러 추가
  const handleCheckDelete = async (type) => {
    if (type === "file") {
      if (selectedFiles.length === 0) {
        alert("삭제할 파일을 선택하세요.");
        return;
      }
      if (!window.confirm("정말로 선택한 파일을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.")) {
        return;
      }
      try {
        for (const file of selectedFiles) {
          await fetch(`http://localhost:8000/api/delete_file/${file.folderName}/`, {
            method: "DELETE",
          });
        }
        fetchFileData();
        setSelectedFiles([]);
        alert("선택한 파일이 삭제되었습니다.");
      } catch (error) {
        alert("파일 삭제 중 오류가 발생했습니다.");
      }
    } else if (type === "rule") {
      if (selectedRules.length === 0) {
        alert("삭제할 규칙을 선택하세요.");
        return;
      }
      if (!window.confirm("정말로 선택한 규칙을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.")) {
        return;
      }
      try {
        for (const rule of selectedRules) {
          await fetch(`http://localhost:8000/api/delete_rule/${rule.folderName}/`, {
            method: "DELETE",
          });
        }
        fetchRuleData();
        setSelectedRules([]);
        alert("선택한 규칙이 삭제되었습니다.");
      } catch (error) {
        alert("규칙 삭제 중 오류가 발생했습니다.");
      }
    } else {
      alert("잘못된 삭제 타입입니다.");
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
        documentRule,
        handleCheckboxChange,
        handleCheckExport,
        selectedFiles,
        selectedRules,
        setExcelFile,
        setDocumentRule,
        setRuleName,
        setRuleData,
        handleUpload,
        fetchFileData,
        handleRuleNameChange,
        handleCheckDelete, 
      }}
    >
      {children}
    </FileContext.Provider>
  );
};

export default FileProvider;