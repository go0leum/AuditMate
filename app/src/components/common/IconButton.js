import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

// 사용 예시:
// <IconButton iconSrc="/path/to/icon.svg" to="/dashboard" />

const IconButton = ({ iconSrc, to, alt = "icon" }) => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // 현재 경로와 버튼의 목적지 경로가 같은지 확인
  const isActive = location.pathname === to;
  
  // 기본 버튼 스타일
  const buttonStyle = {
    width: 46,
    height: 46,
    background: isActive ? "#CDDAEE" : "#0647A9", // 활성 상태에 따라 배경색 변경
    borderRadius: 8,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "none",
    padding: 0,
    cursor: "pointer",
    transition: "background 0.2s",
  };
  
  // 기본 아이콘 스타일
  const iconStyle = {
    width: 30,
    height: 30,
    objectFit: "contain",
    filter: isActive 
      ? "brightness(0) saturate(100%) invert(19%) sepia(73%) saturate(2341%) hue-rotate(192deg) brightness(95%) contrast(98%)" 
      : "none", // 활성 상태에 따라 아이콘 색상 변경 (#0647A9 색상 필터)
    transition: "filter 0.2s",
  };

  return (
    <button
      style={buttonStyle}
      onClick={() => navigate(to)}
      type="button"
    >
      <img
        src={iconSrc}
        alt={alt}
        style={iconStyle}
      />
    </button>
  );
};

export default IconButton;

