import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import FileProvider from './context/FileContext.js';
import TableProvider from './context/TableContext.js';
import TableDrawerProvider from './context/DrawerContext.js';
import RuleProvider from './context/RuleContext.js';
// import { ContactProvider } from './context/ContactContext.js';

import RecentFile from './pages/RecentFile';
import ReviewTable from './pages/ReviewTable';
import TableDrawer from './components/layout/TableDrawer.js';
import RuleList from './pages/RuleList.js';
// import ContactInfo from './pages/ContactInfo.js';

function App() {
  return (
    <Router>
      <FileProvider>
        <RuleProvider>
          <TableProvider>
            <TableDrawerProvider>
              {/* <ContactProvider> */}
                <Routes>
                  <Route path="/" element={<Navigate to="/recentFile" replace />} />
                  <Route path="/recentFile" element={<RecentFile />} />
                  <Route path="/ruleList" element={<RuleList/>} />
                  <Route path="/reviewTable/:file_name" element={<ReviewTable />} />
                  <Route path="/reviewTable/:file_name/TableDrawer" element={<TableDrawer />} />
                  {/* <Route path="/contactInfo" element={<ContactInfo />} /> */}
                  {/* Catch-all route to handle 404 */}
                </Routes>
              {/* </ContactProvider> */}
            </TableDrawerProvider>
          </TableProvider>
        </RuleProvider>
      </FileProvider>
    </Router>
  );
}

export default App;
