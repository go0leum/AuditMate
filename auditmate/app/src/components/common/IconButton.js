import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';

// 스타일 정의
const ButtonStyled = styled.button`
  width: 46px;
  height: 46px;
  background: ${(props) => (props.isActive ? '#CDDAEE' : '#0647A9')};
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  padding: 0;
  cursor: pointer;
  transition: background 0.2s;
`;

const IconStyled = styled.img`
  width: 30px;
  height: 30px;
  object-fit: contain;
  filter: ${(props) =>
    props.isActive
      ? 'brightness(0) saturate(100%) invert(19%) sepia(73%) saturate(2341%) hue-rotate(192deg) brightness(95%) contrast(98%)'
      : 'none'};
  transition: filter 0.2s;
`;

const IconButton = ({ iconSrc, path, alt = 'icon' }) => {
  const navigate = useNavigate();

  const navigateTo = () => {
    navigate(path);
  };

  return (
    <ButtonStyled onClick={navigateTo} type="button">
      <IconStyled src={iconSrc} alt={alt} />
    </ButtonStyled>
  );
};

export default IconButton;