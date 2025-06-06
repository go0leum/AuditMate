import React, { forwardRef } from 'react';
import styled from 'styled-components';

// Styled components
const InputWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  width: 200px;
`;

const Label = styled.label`
  color: #3F3F3F;
  font-size: 14px;
  font-family: 'NanumGothic';
  font-weight: 600;
  line-height: 24px;
`;

const StyledInput = styled.input`
  width: ${({ $width }) => $width || "180px"};
  height: ${({ $height }) => $height || "30px"};
  padding: 5px 10px;
  background: white;
  border-radius: 4px;
  border: 1px solid #E0E0E0;
  font-size: 14px;
  font-family: 'Inter';
  font-weight: 400;
  color: #333;

  &:focus {
    outline: none;
    border-color: #0647A9;
  }

  &::placeholder {
    color: #B1B1B1;
  }
`;

const InputField = forwardRef(({ label, value, onChange, width, height, onBlur, onKeyDown }, ref) => (
  <InputWrapper>
    <Label>{label}</Label>
    <StyledInput
      ref={ref}
      value={value}
      onChange={onChange}
      placeholder="입력해주세요"
      $width={width}
      $height={height}
      onBlur={onBlur}
      onKeyDown={onKeyDown}
    />
  </InputWrapper>
));

export default InputField;