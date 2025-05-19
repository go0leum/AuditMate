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
  background: ${(props) => (props.secondary ? '#CDDAEE' : '#0647A9')};
  color: ${(props) => (props.secondary ? '#0647A9' : 'white')};
`;

const Button = ({ children = 'Okay', onClick, secondary = false, ...props }) => {
  return (
    <ButtonStyled onClick={onClick} secondary={secondary} {...props}>
      {children}
    </ButtonStyled>
  );
};

export default Button;