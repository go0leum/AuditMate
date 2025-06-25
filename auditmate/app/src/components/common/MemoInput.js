import React, { forwardRef } from 'react';
import styled from 'styled-components';

// Styled-components
const TextareaContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  gap: 15px;
  padding-bottom : 20px;
`;

const Label = styled.div`
  color: #0647A9;
  font-size: 16px;
  font-family: 'NanumGothic';
  font-weight: 600;
`;

const TextareaWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  gap: 4px;
`;

const StyledTextarea = styled.textarea`
  width: 300px;
  height: 100px;
  resize: none;
  padding: 8px;
  border: 1px solid #B1B1B1;
  border-radius: 4px;
  font-size: 14px;
  font-family: 'Inter';
  font-weight: 400;
  color: #333;

  &::placeholder {
    color: #B1B1B1;
  }

  &:focus {
    outline: none;
    border-color: #0647A9;
  }
`;

const MemoInput = forwardRef(({ label, placeholder, value, onChange }, ref) => {
  // Enter 키 누르면 blur
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      e.stopPropagation(); // ← 이 줄 추가!
      if (ref && typeof ref !== 'function' && ref.current) {
        ref.current.blur();
      }
    }
  };

  return (
    <TextareaContainer>
      <Label>{label}</Label>
      <TextareaWrapper>
        <StyledTextarea
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          ref={ref}
          onKeyDown={handleKeyDown}
        />
      </TextareaWrapper>
    </TextareaContainer>
  );
});

export default MemoInput;