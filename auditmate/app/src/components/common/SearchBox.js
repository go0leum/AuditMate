import styled from 'styled-components';
import SearchIcon from '../../assets/icon/search icon.png';

const Container = styled.div`
  width: 200px;
  height: 42.12px;
  padding: 8px 11px;
  background-color: #F9FBFF;
  border-radius: 10px;
  display: inline-flex;
  justify-content: flex-start;
  align-items: center;
  gap: 11px;
  box-sizing: border-box;
`;

const Input = styled.input`
  flex-grow: 1;
  height: 100%;
  border: none;
  outline: none;
  background-color: transparent;
  font-size: 14px;
  font-family: 'Poppins, sans-serif';
  color: #333;
`;

const Icon = styled.img`
  width: 25px;
  height: 25px;
  flex-shrink: 0;
`;

const SearchBox = ({ value = '', onChange, placeholder = 'Search', ...props }) => {
  return (
    <Container {...props}>
      <Icon src={SearchIcon} aria-hidden="true" focusable="false" />
      <Input type="text" value={value} onChange={onChange} placeholder={placeholder} aria-label="Search" />
    </Container>
  );
};

export default SearchBox;