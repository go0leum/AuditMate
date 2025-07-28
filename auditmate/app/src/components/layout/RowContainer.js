import styled from "styled-components";

const RowContainerStyle = styled.div`
  min-width: ${({ $minWidth }) => $minWidth || '900px'};
  width: 100%;
  display: flex;
  padding: ${({ $padding }) => $padding || '20px 20px'};
  align-items: center;
  justify-content: space-between;
  box-sizing: border-box;
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