import styled from "styled-components";

const RowContainerStyle = styled.div`
  min-width: ${({ $minWidth }) => $minWidth || '900px'};
  width: 100%;
  display: flex;
  padding: ${({ $padding }) => $padding || '20px 20px'};
  align-items: stretch; // center 대신 stretch로 변경하여 높이 자동 조정
  justify-content: space-between;
  box-sizing: border-box;
  min-height: 60px; // 최소 높이 보장 (패딩 포함)
`;

const Line = styled.div`
  min-width: ${({ $minWidth }) => $minWidth || '900px'};
  width: 100%;
  height: 0px;
  outline: 1px solid #EEEEEE;
  outline-offset: -0.5px;
`;

const RowContainer = ({ children, minWidth, padding, ...rest }) => {
  return (
    <>
      <RowContainerStyle $minWidth={minWidth} $padding={padding} {...rest}>{children}</RowContainerStyle>
      <Line $minWidth={minWidth} />
    </>
  );
};

export default RowContainer;