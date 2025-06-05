import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import Tag from './Tag';

const DropdownWrapper = styled.div`
  background: white;
  border-radius: 4px;
  display: inline-flex;
  flex-direction: column;
  gap: 6px;
  position: relative;
`;

const DropdownHeader = styled.div`
  position: relative;
  width: 105px;
  text-align: center;
  display: flex;
  flex-direction: column;
  color: #292D32;
  font-size: 12px;
  font-family: 'NanumGothic', sans-serif;
  font-weight: 600;
  word-wrap: break-word;
  cursor: pointer;
`;

const TagList = styled.div`
  width: 105px;
  border-radius: 5px;
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  background: white;
  position: absolute;
  top: 40px;
  left: 0;
  z-index: 10;
  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
  padding: 8px;
`;

const TagDropdown = ({ options, onSelect, value = null }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // selected를 useState로 관리하지 않고, 항상 value prop을 사용
  const selected = value;

  const handleSelect = (value) => {
    if (onSelect) onSelect(value);
    setIsOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <DropdownWrapper ref={dropdownRef}>
      <DropdownHeader
        onMouseDown={(e) => e.stopPropagation()}
        onClick={() => setIsOpen(!isOpen)}
      >
        {selected ? (
          <Tag value={selected} options={options}>{selected}</Tag>
        ) : (
          <span style={{ color: '#b1b1b1' }}>선택하세요</span>
        )}
      </DropdownHeader>
      {isOpen && (
        <TagList onMouseDown={(e) => e.stopPropagation()}>
          {options.map((option) => (
            <Tag
              key={option}
              options={options}
              value={option}
              onClick={() => handleSelect(option)}
              style={{
                cursor: 'pointer',
                opacity: selected === option ? 1 : 0.5,
                border: selected === option ? '2px solid #000' : undefined,
              }}
            >
              {option}
            </Tag>
          ))}
        </TagList>
      )}
    </DropdownWrapper>
  );
};

export default TagDropdown;
