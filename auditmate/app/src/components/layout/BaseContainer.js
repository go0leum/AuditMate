import styled from 'styled-components';

const Container = styled.div`
  background: white;
  display: flex;
  width: ${({ $width }) => $width || '100%'};
  height: 100%;
  flex-direction: ${({ direction }) => direction || 'column'};
  justify-content: flex-start;
  box-sizing: border-box;
  ${({ $padding }) => $padding && `
    padding-left: 90px;
    padding-top: 80px;
  `}
`;

const BaseContainer = ({ children, direction = 'column', $width = '100%', $height ='100%', $padding = true }) => {
  return <Container direction={direction} $width={$width} $height={$height} $padding={$padding}>{children}</Container>;
};

export default BaseContainer;