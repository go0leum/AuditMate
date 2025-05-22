import styled from 'styled-components';
import SortDropdown from '../common/SortDropdown';
import SearchBox from '../common/SearchBox';

const Container = styled.div`
  width: calc(100% - 60px);
  height: 110px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 0 30px;
`;

const Title = styled.div`
  width: 214.57px;
  height: 36.58px;
  color: black;
  font-size: 24px;
  font-family: 'Poppins, sans-serif';
  font-weight: 600;
  word-wrap: break-word;
`;

const TopBar = ({ Title: titleText, onChange }) => {
  return (
    <Container>
      <Title>{titleText}</Title>
      <SearchBox placeholder="Search here..." style={{ width: 200.0, height: 42.12 }} onChange={onChange} />
      <SortDropdown shortByText="Sort by :" newestText="Newest" style={{ margin: '0 auto' }} />
    </Container>
  );
};

export default TopBar;