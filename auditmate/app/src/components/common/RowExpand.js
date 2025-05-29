import React from "react";
import styled from "styled-components";

const ExpandContainer = styled.div`
  width: 150px;
  border-radius: 5px;
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  position: absolute;
  top: 20px;
  left: 0;
  z-index: 10;
  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
  padding: 8px;
  margin-top: 8px;
  text-align: left;
  font-weight: 400;
  font-size: 11px;
  background: #f5f5f5;
`;

const DocTitle = styled.div`
  font-weight: bold;
  margin-bottom: 4px;
`;

const FieldList = styled.ul`
  margin: 0;
  padding-left: 16px;
`;

const RowExpand = ({ value }) => {
  if (!value || typeof value !== "object") return null;

  return (
    <ExpandContainer>
      {Object.entries(value).map(([doc, fields]) => (
        <div key={doc} style={{ marginBottom: 4 }}>
          <DocTitle>{doc}</DocTitle>
          <FieldList>
            {Object.entries(fields).map(([k, v]) => (
              <li key={k}>
                {k}: {v}
              </li>
            ))}
          </FieldList>
        </div>
      ))}
    </ExpandContainer>
  );
};

export default RowExpand;

