import React from "react";
import IconButton from "../common/IconButton";

import BrandLogo from '../../assets/icon/XWrist.jpg';
import FolderIcon from '../../assets/icon/folder icon.png';
import TableIcon from '../../assets/icon/table icon.png';
import DocumentIcon from '../../assets/icon/document icon.png';


// 사용 예시
// <Sidebar>
// </Sidebar>

import React from "react";

const boxStyle = {
  width: 40,
  height: 40,
  background: "#fff", // 필요에 따라 배경색 변경
  borderRadius: 8,    // 선택: 모서리 둥글게
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  overflow: "hidden", // 이미지가 박스 밖으로 나가지 않게
  boxShadow: "0 1px 3px rgba(0,0,0,0.08)", // 선택: 약간의 그림자 효과
};

const imgStyle = {
  width: "100%",
  height: "100%",
  objectFit: "contain", // 이미지 비율 유지하며 박스에 맞춤
};

const sidebarStyle = {
  paddingLeft: 24,
  paddingRight: 24,
  paddingTop: 36,
  paddingBottom: 36,
  width: 95,
  height: "100vh",
  background: "#FFFFFF", // 필요에 따라 배경색 변경
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: 100,
  // 추가 스타일: 그림자, 패딩 등 필요시 추가
};

const menuListStyle = {
  display: "flex",
  flexDirection: "column",
  gap: 44, // 아이콘 간격
};

export default function Sidebar() {
  return (
    <div style={sidebarStyle}>
      // BrandLogo 컴포넌트
      <div style={boxStyle}>
        <img src={BrandLogo} alt={alt} style={imgStyle} />
      </div>

      // ListMenue 컴포넌트
      <div style={menuListStyle}>
        <IconButton iconSrc={FolderIcon} to='/RecentFile/'/>
        <IconButton iconSrc={TableIcon} to='/ReviewTable/'/>
        <IconButton iconSrc={DocumentIcon} to='/DocumentOCR/'/>
      </div>
    </div>
  );
}