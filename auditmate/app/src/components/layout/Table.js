import styled from 'styled-components';

const Container = styled.div`
  background: white;
  display: flex;
  flex-direction: column;
  width: 100%;
  padding: 20px;
  box-sizing: border-box;
`;

const ColumnContainer = styled.div`
  min-width: ${({ $minWidth }) => $minWidth || '900px'};
  width: 100%;
  align-items: center;
  padding: ${({ $padding }) => $padding || '20px 20px'};
  display: flex;
  justify-content: space-between;
  box-sizing: border-box;
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
  box-sizing: border-box;
  flex-shrink: 0; // 줄어들지 않게
`;

const Line = styled.div`
  min-width: ${({ $minWidth }) => $minWidth || '900px'};
  width: 100%;
  height: 0px;
  outline: 1px solid #EEEEEE;
  outline-offset: -0.5px;
`;

const Table = ({ columns, children, columnPadding, width, onColumnClick, sortValue }) => {
  // 컬럼 총합 너비 계산
  const minWidth = columns.reduce((sum, col) => sum + (col.width || 110), 0) + 'px';

  const getSortIcon = (label) => {
    if (!sortValue) return null;
    if (sortValue.startsWith(label + '-')) {
      return sortValue.endsWith('-asc') ? ' ▼' : ' ▲';
    }
    return null;
  };

  return (
    <Container>
      <ColumnContainer $minWidth={minWidth} $padding={columnPadding}>
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
      <Line $minWidth={minWidth}/>
      {children}
    </Container>
  );
};

export default Table;