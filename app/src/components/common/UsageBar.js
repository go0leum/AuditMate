import React from "react";
import styled from "styled-components";

const BackgroundBar = styled.div`
  width: 300px;
  height: 6px;
  background: #EBEFF2;
  border-radius: 24px;
`;

const ProgressBar = styled.div`
  width: ${({ progress }) => `${progress * 3}px`};
  height: 6px;
  background: #0647A9;
  border-radius: 24px;
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
      <BackgroundBar />
      <ProgressBar progress={progress} />
    </div>
  );
};

export default UsageBar;