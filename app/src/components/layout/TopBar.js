import styled from 'styled-components';
import React from 'react';

import SortDropdown from '../common/SortDropdown';
import SearchBox from '../common/SearchBox';

const Container = styled.div`
  width: 100%;
  height: 42.12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 249px;
`;

const Title = styled.div`
  width: 214.57px;
  height: 36.58px;
  color: black;
  font-size: 22px;
  font-family: 'Poppins, sans-serif';
  font-weight: 600;
  word-wrap: break-word;
`;

const TopBar = ({ Title: titleText, onChange }) => {
  return (
    <Container>
      <Title>{titleText}</Title>
      <SortDropdown shortByText="Sort by :" newestText="Newest" style={{ margin: 20 }} />
      <SearchBox placeholder="Search here..." style={{ width: 299.01, height: 42.12 }} onChange={onChange} />
    </Container>
  );
};

export default TopBar;