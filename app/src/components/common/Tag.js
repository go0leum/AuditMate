import React from 'react';

```
사용예시
import Tag from './Tag';

function App() {
  return (
    <div style={{display: 'flex', gap: 8}}>
      <Tag color="blue">전자세금계산서</Tag>
      <Tag color="green">보조금전용카드</Tag>
      <Tag color="yellow">기타</Tag>
      <Tag color="red">일반수용비</Tag>
      <Tag color="grey">복리후생비</Tag>
      <Tag color="purple">인건비</Tag>
    </div>
  );
}
```

const TAG_STYLES = {
  blue: {
    wrapper: {
      background: '#CDDAEE',
      outline: '1px #ACC2E2 solid',
    },
    text: {
      color: '#0647A9',
    },
  },
  green: {
    wrapper: {
      background: '#D3DFCE',
      outline: '1px #B6CAAE solid',
    },
    text: {
      color: '#255F0B',
    },
  },
  yellow: {
    wrapper: {
      background: '#F3EAD1',
      outline: '1px #EBDCB3 solid',
    },
    text: {
      color: '#C4951B',
    },
  },
  red: {
    wrapper: {
      background: '#EED3D3',
      outline: '1px #E2B6B6 solid',
    },
    text: {
      color: '#A92525',
    },
  },
  grey: {
    wrapper: {
      background: '#F5F5F5',
      outline: '1px #C2C2C2 solid',
    },
    text: {
      color: '#5F5F5F',
    },
  },
  purple: {
    wrapper: {
      background: '#F7F5FF',
      outline: '1px #B6ABED solid',
    },
    text: {
      color: '#4C34C2',
    },
  },
};

const Tag = ({
  children,
  color = 'blue', // blue, green, yellow, red, grey, purple
  style = {},
  textStyle = {},
  ...props
}) => {
  const wrapperBase = {
    paddingLeft: 8,
    paddingRight: 8,
    paddingTop: 2,
    paddingBottom: 2,
    borderRadius: 50,
    outlineOffset: '-1px',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
    display: 'inline-flex',
    ...TAG_STYLES[color]?.wrapper,
    ...style,
  };

  const textBase = {
    fontSize: 13,
    fontFamily: 'NanumGothic, sans-serif',
    fontWeight: 600,
    lineHeight: '16px',
    wordWrap: 'break-word',
    ...TAG_STYLES[color]?.text,
    ...textStyle,
  };

  return (
    <div style={wrapperBase} {...props}>
      <div style={textBase}>{children}</div>
    </div>
  );
};

export default Tag;