import styled from 'styled-components';
import React, { useState, useRef, useEffect } from 'react';

const Container = styled.div`
  width: 213.18px;
  height: 42.12px;
  position: relative;
  user-select: none;
`;

const Rectangle = styled.div`
  width: 100%;
  height: 100%;
  position: absolute;
  background: #F9FBFF;
  border-radius: 10px;
  box-sizing: border-box;
  border: 1px solid #ccc;
  cursor: pointer;
`;

const Chevron = styled.div`
  width: 24.92px;
  height: 19.95px;
  position: absolute;
  right: 10px;
  top: 50%;
  transform: ${({ $isOpen }) => ($isOpen ? 'translateY(-50%) rotate(180deg)' : 'translateY(-50%) rotate(0deg)')};
  transition: transform 0.3s ease;
`;

const TextContainer = styled.div`
  position: absolute;
  left: 20.76px;
  top: 50%;
  transform: translateY(-50%);
  font-family: 'Poppins, sans-serif';
  font-size: 13px;
  color: #3D3C42;
  font-weight: 600;
`;

const DropdownList = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  width: 100%;
  background: white;
  border: 1px solid #ccc;
  border-radius: 10px;
  margin-top: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  max-height: 200px;
  overflow-y: auto;
`;

const DropdownItem = styled.div`
  padding: 8px 16px;
  cursor: pointer;
  font-family: 'Poppins, sans-serif';
  font-size: 12px;
  color: #3D3C42;
  font-weight: ${({ $isSelected }) => ($isSelected ? 600 : 400)};
  background-color: ${({ $isSelected }) => ($isSelected ? '#E6F0FF' : 'transparent')};
  &:hover {
    background-color: #F0F0F0;
  }
`;

const SortDropdown = ({ options, onChange, initialValue = 'date-asc' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState(initialValue);
  const dropdownRef = useRef(null);

  const selectedOption = options.find((opt) => opt.value === selectedValue) || options[0];

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <Container ref={dropdownRef} onClick={() => setIsOpen((prev) => !prev)}>
      <Rectangle />
      <Chevron $isOpen={isOpen} />
      <TextContainer>{selectedOption.label}</TextContainer>
      {isOpen && (
        <DropdownList>
          {options.map(({ label, value }) => (
            <DropdownItem
              key={value}
              $isSelected={value === selectedValue}
              onClick={() => {
                setSelectedValue(value);
                setIsOpen(false);
                if (onChange) onChange(value);
              }}
            >
              {label}
            </DropdownItem>
          ))}
        </DropdownList>
      )}
    </Container>
  );
};

export default SortDropdown;