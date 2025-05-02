import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import RecentFile from './pages/RecentFile';
import ReviewTable from './pages/ReviewTable';
import DocumentOCR from './pages/DocumentOCR.js';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/recentFiles" element={<RecentFile />} />
        <Route path="/reviewTable" element={<ReviewTable />} />
        <Route path="/documentOCR" element={<DocumentOCR />} />
      </Routes>
    </Router>
  );
}

export default App;
