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
  padding: ${({ $padding }) => $padding || '20px 20px'};
  display: inline-flex;
  justify-content: space-between;
`;


const ColumnItem = styled.div`
  width: ${({ $width }) => $width}px;
  text-align: center;
  justify-content: center;
  display: flex;
  flex-direction: column;
  color: #0647A9;
  font-size: 15px;
  font-family: 'Inter', sans-serif;
  font-weight: 600;
  word-wrap: break-word;
`;

const Line = styled.div`
  width: ${({ $width }) => $width || 'calc(100% - 60px)'};
  height: 0px;
  outline: 1px solid #EEEEEE;
  outline-offset: -0.5px;
`;

const Table = ({ columns, children, columnPadding, width, onColumnClick, sortValue }) => {
  // sortValue: '컬럼명-asc' 또는 '컬럼명-desc'
  const getSortIcon = (label) => {
    if (!sortValue) return null;
    if (sortValue.startsWith(label + '-')) {
      return sortValue.endsWith('-asc') ? ' ▼' : ' ▲';
    }
    return null;
  };

  return (
    <Container>
      <ColumnContainer $width={width} $padding={columnPadding}>
        {columns.map(({ label, width }, index) => (
          <ColumnItem
            key={index}
            $width={width}
            style={{ cursor: onColumnClick ? 'pointer' : 'default' }}
            onClick={onColumnClick ? () => onColumnClick(label) : undefined}
          >
            {label}
            {getSortIcon(label)}
          </ColumnItem>
        ))}
      </ColumnContainer>
      <Line $width={width}/>
      {children}
    </Container>
  );
};

export default Table;