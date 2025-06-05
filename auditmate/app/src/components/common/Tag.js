import { useContext } from 'react';
import styled from 'styled-components';

import { RuleContext } from '../../context/RuleContext';

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

const COLOR_ORDER = ['blue', 'green', 'yellow', 'red', 'purple'];


const TAG_STYLES = {
  blue: { wrapper: { background: '#CDDAEE', outline: '#ACC2E2' }, text: { color: '#0647A9' } },
  green: { wrapper: { background: '#D3DFCE', outline: '#B6CAAE' }, text: { color: '#255F0B' } },
  yellow: { wrapper: { background: '#F3EAD1', outline: '#EBDCB3' }, text: { color: '#C4951B' } },
  red: { wrapper: { background: '#EED3D3', outline: '#E2B6B6' }, text: { color: '#A92525' } },
  purple: { wrapper: { background: '#F7F5FF', outline: '#B6ABED' }, text: { color: '#4C34C2' } },
  grey: { wrapper: { background: '#F5F5F5', outline: '#C2C2C2' }, text: { color: '#5F5F5F' } },
};

const getTagColor = (value, options) => {
  if (!options || !Array.isArray(options)) return 'grey';
  const idx = options.indexOf(value);
  if (idx === -1) return 'grey';
  return COLOR_ORDER[idx % COLOR_ORDER.length] || 'grey';
};

const Tag = ({ children, options, value, onClick, ...props }) => {
  const color = getTagColor(value, options) || 'grey';
  return (
    <TagWrapper color={color} onClick={onClick} {...props}>
      <TagText color={color}>{children}</TagText>
    </TagWrapper>
  );
};


export default Tag;