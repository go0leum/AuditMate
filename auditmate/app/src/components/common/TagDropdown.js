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

const OPTIONS_BY_LABEL = {
  세목명: [
    '인건비', '일반수용비', '일반용역비', '여비', '업무추진비',
    '복리후생비', '공공세제', '피복비', '임차료', '시설장비유지비',
    '차량비', '유형자산'
  ],
  증빙구분: ['전자세금계산서', '보조금전용카드', '기타'],
};

const TagDropdown = ({ label = '세목명', onSelect, value = null }) => {
  const [selected, setSelected] = useState(value);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const options = OPTIONS_BY_LABEL[label] || [];

  const handleSelect = (value) => {
    setSelected(value);
    if (onSelect) onSelect(value);
    setIsOpen(false); // 선택 후 드롭다운 닫기
  };

  // 바깥 클릭 감지하여 드롭다운 닫기
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
          <Tag label={label} value={selected}>
            {selected}
          </Tag>
        ) : (
          <span style={{ color: '#b1b1b1' }}>선택하세요</span>
        )}
      </DropdownHeader>
      {isOpen && (
        <TagList onMouseDown={(e) => e.stopPropagation()}>
          {options.map((option) => (
            <Tag
              key={option}
              label={label}
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
