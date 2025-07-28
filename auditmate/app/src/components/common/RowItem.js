import styled from "styled-components";

const RowItemStyle = styled.div`
  width: ${({ width }) => width}px;
  flex-shrink: 0; // 추가: 줄어들지 않게
  text-align: center;
  justify-content: center;
  display: flex;
  flex-direction: column;
  color: #292D32;
  font-size: 13px;
  font-family: 'Inter', sans-serif;
  font-weight: 600;
  word-wrap: break-word;
  align-items: center;
  box-sizing: border-box; // 추가: padding 포함

  ${({ $clickable }) =>
    $clickable &&
    `
    &:hover {
      text-decoration: underline;
      cursor: pointer;
    }
  `}
`;

const RowItem = ({ width, children, $clickable, onClick, style }) => {
  return (
    <RowItemStyle width={width} $clickable={$clickable} onClick={onClick} style={style}>
      {children}
    </RowItemStyle>
  );
}

export default RowItem;