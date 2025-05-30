import styled from 'styled-components';
import { useNavigate, useLocation } from 'react-router-dom';

// 스타일 정의
const ButtonStyled = styled.button`
  width: 46px;
  height: 46px;
  background: ${(props) => (props.$isActive ? '#CDDAEE' : '#0647A9')};
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  padding: 0;
  cursor: pointer;
  transition: background 0.2s;
  position: relative;
`;

const IconStyled = styled.img`
  width: 30px;
  height: 30px;
  object-fit: contain;
  filter: ${(props) =>
    props.$isActive
      ? 'brightness(0) saturate(100%) invert(19%) sepia(73%) saturate(2341%) hue-rotate(192deg) brightness(95%) contrast(98%)'
      : 'none'};
  transition: filter 0.2s;
`;

const Tooltip = styled.div`
  visibility: hidden;
  opacity: 0;
  background: #222;
  color: #fff;
  font-size: 11px;
  padding: 4px 8px;
  border-radius: 4px;
  position: absolute;
  bottom: -30px;
  left: 50%;
  transform: translateX(-50%);
  white-space: nowrap;
  pointer-events: none;
  transition: opacity 0.2s;
  z-index: 10;

  ${ButtonStyled}:hover & {
    visibility: visible;
    opacity: 1;
  }
`;

const IconButton = ({ iconSrc, path, alt = 'icon', tooltip }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = location.pathname === path;

  const navigateTo = () => {
    navigate(path);
  };

  return (
    <ButtonStyled onClick={navigateTo} type="button" $isActive={isActive}>
      <IconStyled src={iconSrc} alt={alt} $isActive={isActive} />
      {tooltip && <Tooltip>{tooltip}</Tooltip>}
    </ButtonStyled>
  );
};

export default IconButton;