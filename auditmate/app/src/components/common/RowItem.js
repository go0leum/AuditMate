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
  word-break: break-word; // 긴 단어도 강제 줄바꿈
  white-space: pre-wrap; // 줄바꿈 허용
  overflow-wrap: break-word; // 추가적인 줄바꿈 지원
  align-items: center;
  box-sizing: border-box; // 추가: padding 포함
  padding: 8px 4px; // 상하 패딩 추가
  min-height: 40px; // 최소 높이 설정
  line-height: 1.3; // 줄 간격 조정

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