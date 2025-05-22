import React, { createContext, useState } from 'react';

// Context 생성
export const DocumentContext = createContext();

const DocumentProvider = ({ children }) => {
  const [selectedDocumentDir, setSelectedDocumentDir] = useState(null);

  return (
    <DocumentContext.Provider 
      value={{
        selectedDocumentDir, 
        setSelectedDocumentDir 
      }}
    >
      {children}
    </DocumentContext.Provider>
  );
};

export default DocumentProvider;