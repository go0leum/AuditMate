import styled from 'styled-components';
import IconButton from '../common/IconButton';

import BrandLogo from '../../assets/icon/XWrist.jpg';
import FolderIcon from '../../assets/icon/folder icon.png';
import DocumentIcon from '../../assets/icon/document icon.png';
// import EmailIcon from '../../assets/icon/email icon.png';

const SidebarContainer = styled.div`
  position: fixed; // 추가: 사이드바를 화면에 고정
  top: 0;          // 상단에 고정
  left: 0;         // 좌측에 고정
  z-index: 100;    // 다른 요소 위에 표시(필요시)
  padding: 20px 15px;
  width: 60px;
  height: 100vh;
  background: #FAFBFF;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 70px;
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
  return (
    <SidebarContainer>
      <LogoContainer>
        <LogoImage src={BrandLogo} alt="Brand Logo" />
      </LogoContainer>
      <MenuList>
        <IconButton iconSrc={FolderIcon} path='/recentFile' tooltip="파일 목록"/>
        <IconButton iconSrc={DocumentIcon} path='/ruleList' tooltip="검토 규칙 목록"/>
        {/* <IconButton iconSrc={EmailIcon} path='/contactInfo' tooltip="연락처 정보"/> */}
      </MenuList>
    </SidebarContainer>
  );
};

export default Sidebar;