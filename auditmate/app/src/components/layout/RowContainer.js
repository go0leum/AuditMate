import styled from "styled-components";

const RowContainerStyle = styled.div`
  width: ${({ $width }) => $width || 'calc(100% - 60px)'};
  display: inline-flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 20px;
`;

const RowContainer = ({ children, width, ...rest }) => {
  return <RowContainerStyle $width={width} {...rest}>{children}</RowContainerStyle>;
};

export default RowContainer;