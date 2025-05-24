import React from "react";
import styled from "styled-components";

const BarContainer = styled.div`
  position: relative;
  width: ${({ width }) =>`${width}px`};
  height: 6px;
`;

const BackgroundBar = styled.div`
  width: ${({ width }) =>`${width}px`};
  height: 100%;
  background: #EBEFF2;
  border-radius: 24px;
  position: absolute;
  top: 0;
  left: 0;
`;

const ProgressBar = styled.div`
  width: ${({ progress, width }) => `${(progress / 100) * width}px`};
  height: 100%;
  background: #0647A9;
  border-radius: 24px;
  position: absolute;
  top: 0;
  left: 0;
`;


const ProgressText = styled.div`
  font-size: 14px;
  font-family: 'Inter', sans-serif;
  font-weight: 500;
  color: #0647A9;
  text-align: center;
  margin-bottom: 5px;
`;

const UsageBar = ({ progress = 0, width = 300 }) => {
  return (
    <div>
      <ProgressText>{progress}%</ProgressText>
      <BarContainer width={width}>
        <BackgroundBar width={width} />
        <ProgressBar progress={progress} width={width} />
      </BarContainer>
    </div>
  );
};

export default UsageBar;
