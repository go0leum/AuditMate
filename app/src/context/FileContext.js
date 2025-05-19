import React, { createContext, useState, useEffect } from 'react';

// Context 생성
export const FileContext = createContext();

const FileProvider = ({ children }) => {
  const [fileData, setFileData] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);

  const handleCheckboxChange = (file) => {
    setSelectedFiles((prev) =>
      prev.includes(file) ? prev.filter((f) => f !== file) : [...prev, file]
    );
  };

  const handleExport = () => {
    if (selectedFiles.length === 0) {
      alert('다운로드할 파일을 선택하세요.');
      return;
    }

    selectedFiles.forEach((file) => {
      const link = document.createElement('a');
      link.href = `/download/${file.folderName}/${file.xlsxFiles}`;
      link.download = file.xlsxFiles;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });

    alert('파일 다운로드가 시작되었습니다.');
  };

  useEffect(() => {
    const fetchData = async () => {
      // require.context()를 사용하여 폴더 내 파일 검색
      const folderContext = require.context('../../Upload_file', true, /$/);
      const folderPaths = folderContext.keys();

      const fetchedData = await Promise.all(
        folderPaths.map(async (folderPath) => {
          const folderName = folderPath.split('/')[1];

          // xlsx 파일 검색
          const xlsxFilesContext = require.context(`../../Upload_file/${folderName}`, false, /\.xlsx$/);
          const xlsxFileNames = xlsxFilesContext.keys().map((file) => file.replace('./', ''));

          // 하위 폴더 검색
          const subFolderContext = require.context(`../../Upload_file/${folderName}`, true, /\/$/);
          const subFolderNames = subFolderContext.keys().map((folder) => folder.replace('./', ''));

          // metadata.js 가져오기
          let metadataModule = {};
          try {
            metadataModule = require(`../../Upload_file/${folderName}/metadata.js`);
          } catch (error) {
            console.warn(`Metadata.js 파일을 찾을 수 없습니다: ${folderName}`);
          }

          const lastModified = metadataModule?.lastModified || '알 수 없음';
          const progress = metadataModule?.progress || 0;

          return {
            folderName,
            xlsxFiles: xlsxFileNames[0] || '없음',
            subFolder: subFolderNames[0] || '없음',
            lastModified,
            progress,
          };
        })
      );

      setFileData(fetchedData);
    };

    fetchData();
  }, []);

  return (
    <FileContext.Provider
      value={{
        fileData,
        handleCheckboxChange,
        handleExport,
        selectedFiles,
      }}
    >
      {children}
    </FileContext.Provider>
  );
};

export default FileProvider;