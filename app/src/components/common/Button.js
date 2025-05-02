import React from 'react';

``` 
사용 예시

import Button from './Button';

function App() {
  return (
    <div>
      <Button onClick={() => alert('Primary!')}>Okay</Button>
      <Button secondary onClick={() => alert('Secondary!')}>Cancel</Button>
    </div>
  );
}

```

const Button = ({
  children = "Okay",
  onClick,
  style = {},
  secondary = false,
  ...props
}) => {
  // 스타일 정의
  const primaryStyle = {
    background: '#0647A9',
  };
  const secondaryStyle = {
    background: '#CDDAEE',
  };

  const defaultStyle = {
    paddingLeft: 16,
    paddingRight: 16,
    paddingTop: 8,
    paddingBottom: 8,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
    display: 'inline-flex',
    border: 'none',
    cursor: 'pointer',
    ...(!secondary ? primaryStyle : secondaryStyle),
    ...style, // 외부 스타일이 마지막에 덮어씀
  };

  const primaryTextStyle = {
    color: 'white',
  };
  const secondaryTextStyle = {
    color: '#0647A9',
  };

  const textStyle = {
    fontSize: 14,
    fontFamily: 'Inter, sans-serif',
    fontWeight: 500,
    lineHeight: '20px',
    wordWrap: 'break-word',
    ...(!secondary ? primaryTextStyle : secondaryTextStyle),
  };

  return (
    <button
      className="Button"
      style={defaultStyle}
      onClick={onClick}
      {...props}
    >
      <span style={textStyle}>{children}</span>
    </button>
  );
};

export default Button;
