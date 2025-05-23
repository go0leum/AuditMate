import styled from 'styled-components';

const TagWrapper = styled.div`
  padding: 2px 8px;
  border-radius: 50px;
  outline-offset: -1px;
  display: inline-flex;
  justify-content: center;
  align-items: center;
  gap: 4px;
  background: ${({ color }) => TAG_STYLES[color]?.wrapper.background};
  outline: 1px solid ${({ color }) => TAG_STYLES[color]?.wrapper.outline};
`;

const TagText = styled.div`
  font-size: 13px;
  font-family: 'NanumGothic, sans-serif';
  font-weight: 600;
  line-height: 16px;
  word-wrap: break-word;
  color: ${({ color }) => TAG_STYLES[color]?.text.color};
`;

const getTagColor = (label, value) => {
  if (label === '증빙구분') {
    if (value === '전자세금계산서') return 'blue';
    if (value === '보조금전용카드') return 'green';
    if (value === '기타') return 'grey';
  }
  if (label === '세목명') {
    if (value === '인건비') return 'purple';
    if (value === '일반수용비') return 'red';
    if (value === '일반용역비') return 'blue';
    if (value === '여비') return 'green';
    if (value === '업무추진비') return 'yellow';
    else return 'grey';
  }
};

const TAG_STYLES = {
  blue: { wrapper: { background: '#CDDAEE', outline: '#ACC2E2' }, text: { color: '#0647A9' } },
  green: { wrapper: { background: '#D3DFCE', outline: '#B6CAAE' }, text: { color: '#255F0B' } },
  yellow: { wrapper: { background: '#F3EAD1', outline: '#EBDCB3' }, text: { color: '#C4951B' } },
  red: { wrapper: { background: '#EED3D3', outline: '#E2B6B6' }, text: { color: '#A92525' } },
  grey: { wrapper: { background: '#F5F5F5', outline: '#C2C2C2' }, text: { color: '#5F5F5F' } },
  purple: { wrapper: { background: '#F7F5FF', outline: '#B6ABED' }, text: { color: '#4C34C2' } },
};

const Tag = ({ children, label, value, onClick, ...props }) => {
  const color = getTagColor(label, value) || 'grey'; // fallback도 넣으면 좋아요
  return (
    <TagWrapper color={color} onClick={onClick} {...props}>
      <TagText color={color}>{children}</TagText>
    </TagWrapper>
  );
};


export default Tag;