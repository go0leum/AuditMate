import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import FileProvider from './context/FileContext.js';
import DocumentProvider from './context/DocumentContext.js';
import TableProvider from './context/TableContext.js';

import RecentFile from './pages/RecentFile';
import ReviewTable from './pages/ReviewTable';
import DocumentOCR from './pages/DocumentOCR.js';

function App() {
  return (
    <Router>
      <FileProvider>
      <TableProvider>
      <DocumentProvider>
        <Routes>
          <Route path="/recentFile" element={<RecentFile />} />
          <Route path="/reviewTable/:file_name" element={<ReviewTable />} />
          <Route path="/documentOCR/:file_name" element={<DocumentOCR />} />
        </Routes>
      </DocumentProvider>
      </TableProvider>
      </FileProvider>
    </Router>
  );
}

export default App;
