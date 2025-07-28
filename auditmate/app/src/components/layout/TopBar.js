import styled from 'styled-components';
import SortDropdown from '../common/SortDropdown';
import SearchBox from '../common/SearchBox';

const Container = styled.div`
  position: fixed;           // 추가: 상단 고정
  top: 0;                    // 추가: 상단에서 0px
  left: 90px;      
  z-index: 100;          // 다른 요소 위에 표시(필요시)
  width: calc(100% - 150px);
  height: 80px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 0px 30px;
  background: white;
`;

const Title = styled.div`
  width: 200x;
  height: 35px;
  color: black;
  font-size: 24px;
  font-family: 'Poppins, sans-serif';
  font-weight: 600;
  word-wrap: break-word;
`;

const TopBar = ({ Title: titleText, value, onChange, sortValue, onSortChange, options }) => {
  return (
    <Container>
      <Title>{titleText}</Title>
      <SearchBox placeholder="Search here..." style={{ width: 200.0, height: 42.12 }} value={value} onChange={onChange} />
      <SortDropdown options={options} initialValue={sortValue} onChange={onSortChange} style={{ margin: '0 auto' }} />
    </Container>
  );
};

export default TopBar;