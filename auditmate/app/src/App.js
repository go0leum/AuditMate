import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import FileProvider from './context/FileContext.js';
import DocumentProvider from './context/DocumentContext.js';
import TableProvider from './context/TableContext.js';
import DrawerProvider from './context/DrawerContext.js';
import RuleProvider from './context/RuleContext.js';

import RecentFile from './pages/RecentFile';
import ReviewTable from './pages/ReviewTable';
import DocumentOCR from './pages/DocumentOCR.js';
import Drawer from './components/layout/Drawer.js';
import RuleList from './pages/RuleList.js';

function App() {
  return (
    <Router>
      <FileProvider>
        <TableProvider>
          <DocumentProvider>
            <DrawerProvider>
              <RuleProvider>
                <Routes>
                  <Route path="/" element={<Navigate to="/recentFile" replace />} />
                  <Route path="/recentFile" element={<RecentFile />} />
                  <Route path="/ruleList" element={<RuleList/>} />
                  <Route path="/reviewTable/:file_name" element={<ReviewTable />} />
                  <Route path="/documentOCR/:file_name" element={<DocumentOCR />} />
                  <Route path="/reviewTable/:file_name/drawer" element={<Drawer />} />
                </Routes>
              </RuleProvider>
            </DrawerProvider>
          </DocumentProvider>
        </TableProvider>
      </FileProvider>
    </Router>
  );
}

export default App;
