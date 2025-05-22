import { useState } from 'react';

import TopBar from '../components/layout/TopBar';
import SideBar from '../components/layout/SideBar';
import BaseContainer from '../components/layout/BaseContainer';


const DocumentOCR = () => {
  const [setSearchTerm] = useState('');

  return (
    <BaseContainer direction="row">
      <SideBar/>
      <BaseContainer direction="column">
        <TopBar Title='Document OCR' onChange={(e) => setSearchTerm(e.target.value)} />
        
      </BaseContainer>
    </BaseContainer>
  );
};

export default DocumentOCR;