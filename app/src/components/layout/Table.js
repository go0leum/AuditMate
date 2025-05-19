import styled from 'styled-components';

const Container = styled.div`
  background: white;
  display: flex;
  width: 100%;
  padding: 20px;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  box-sizing: border-box;
`;

const ColumnContainer = styled.div`
  justify-content: flex-start;
  align-items: center;
  gap: 10px;
  display: inline-flex;
`;

const ColumnItem = styled.div`
  width: ${({ width }) => width}px;
  text-align: center;
  justify-content: center;
  display: flex;
  flex-direction: column;
  color: '#0647A9';
  font-size: 13px;
  font-family: 'NanumGothic', sans-serif;
  font-weight: 600;
  word-wrap: break-word;
`;

const Table = (columns, rows) => {
  return (
    <Container >
      <ColumnContainer>
        {columns.map(({ label, width }, index) => (
          <ColumnItem key={index} width={width} >
            {label}
          </ColumnItem>
        ))}
      </ColumnContainer>
      {rows}
    </Container>
    );
};

export default Table;