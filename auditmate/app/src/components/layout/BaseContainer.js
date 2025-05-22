import styled from 'styled-components';

const Container = styled.div`
  background: white;
  display: flex;
  width: 100%;
  flex-direction: ${({ direction }) => direction || 'column'};
  justify-content: flex-start;
  box-sizing: border-box;
`;

const BaseContainer = ({ children, direction = 'column' }) => {
  return <Container direction={direction}>{children}</Container>;
};

export default BaseContainer;