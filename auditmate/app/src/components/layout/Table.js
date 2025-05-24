import styled from 'styled-components';

const Container = styled.div`
  background: white;
  display: flex;
  width: 100%;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  box-sizing: border-box;
`;

const ColumnContainer = styled.div`
  width: ${({ $width }) => $width || 'calc(100% - 60px)'};
  align-items: center;
  padding: ${({ padding }) => padding || '20px 20px'};
  display: inline-flex;
  justify-content: space-between;
  align-items: center;
`;


const ColumnItem = styled.div`
  width: ${({ width }) => width}px;
  text-align: center;
  justify-content: center;
  display: flex;
  flex-direction: column;
  color: #0647A9;
  font-size: 15px;
  font-family: 'NanumGothic', sans-serif;
  font-weight: 600;
  word-wrap: break-word;
`;

const Line = styled.div`
  width: calc(100% - 60px);
  height: 0px;
  outline: 1px solid #EEEEEE;
  outline-offset: -0.5px;
`;

const Table = ({ columns, children, columnPadding, width }) => {
  return (
    <Container>
      <ColumnContainer $width={width} padding={columnPadding}>
        {columns.map(({ label, width }, index) => (
          <ColumnItem key={index} width={width}>
            {label}
          </ColumnItem>
        ))}
      </ColumnContainer>
      <Line />
      {children}
    </Container>
  );
};

export default Table;