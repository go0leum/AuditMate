import styled from 'styled-components';

const ButtonStyled = styled.button`
  padding: 8px 16px;
  border-radius: 4px;
  display: inline-flex;
  justify-content: center;
  align-items: center;
  gap: 4px;
  border: none;
  cursor: pointer;
  font-size: 14px;
  font-family: 'Inter, sans-serif';
  font-weight: 500;
  line-height: 20px;
  word-wrap: break-word;
  background: ${({ $danger, $secondary }) =>
    $danger ? '#E2B6B6' : $secondary ? '#CDDAEE' : '#0647A9'};
  color: ${({ $danger, $secondary }) =>
    $danger ? '#A92525' : $secondary ? '#0647A9' : 'white'};
`;

const Button = ({
  children = 'Okay',
  onClick,
  secondary = false,
  danger = false, // 추가
  ...props
}) => {
  return (
    <ButtonStyled
      onClick={onClick}
      $secondary={secondary}
      $danger={danger} // 추가
      {...props}
    >
      {children}
    </ButtonStyled>
  );
};

export default Button;