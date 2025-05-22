import styled from 'styled-components';
import { useLocation } from 'react-router-dom';
import IconButton from '../common/IconButton';

import BrandLogo from '../../assets/icon/XWrist.jpg';
import FolderIcon from '../../assets/icon/folder icon.png';
import TableIcon from '../../assets/icon/table icon.png';
import DocumentIcon from '../../assets/icon/document icon.png';

const SidebarContainer = styled.div`
  padding: 36px 24px;
  width: 95px;
  height: 100vh;
  background: #FAFBFF;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 100px;
`;

const LogoContainer = styled.div`
  width: 40px;
  height: 40px;
  background: #fff;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0,0,0,0.08);
`;

const LogoImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: contain;
`;

const MenuList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 44px;
`;

const Sidebar = () => {
  const location = useLocation();
  const file_name = location.pathname.split('/')[2]

  return (
    <SidebarContainer>
      <LogoContainer>
        <LogoImage src={BrandLogo} alt="Brand Logo" />
      </LogoContainer>
      <MenuList>
        <IconButton iconSrc={FolderIcon} path='/recentFile/' />
        <IconButton iconSrc={TableIcon} path={`/reviewTable/${file_name}/`}/>
        <IconButton iconSrc={DocumentIcon} path={`/documentOCR/${file_name}/`} />
      </MenuList>
    </SidebarContainer>
  );
};

export default Sidebar;