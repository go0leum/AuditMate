import React from "react";
import styled from "styled-components";

const BarContainer = styled.div`
  position: relative;
  width: 300px;
  height: 6px;
`;

const BackgroundBar = styled.div`
  width: 100%;
  height: 100%;
  background: #EBEFF2;
  border-radius: 24px;
  position: absolute;
  top: 0;
  left: 0;
`;

const ProgressBar = styled.div`
  width: ${({ $progress }) => `${$progress * 3}px`};
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

const UsageBar = ({ progress }) => {
  return (
    <div>
      <ProgressText>{progress}%</ProgressText>
      <BarContainer>
        <BackgroundBar />
        <ProgressBar $progress={progress} />
      </BarContainer>
    </div>
  );
};

export default UsageBar;