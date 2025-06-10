import styled from 'styled-components';

const EditButtonStyled = styled.div`
  width: ${({ width }) => width || 200}px;
  height: 40px;
  padding: 0 10px;
  background: ${({ $active, $plus }) =>
    $plus ? "#EEEEEE" : ($active ? "#0647A9" : "white")};
  border-radius: 4px;
  outline: 1px solid #7E7E7E;
  outline-offset: -1px;
  display: flex;
  align-items: center;
  gap: 10px;
  margin-right: 10px;
  margin-bottom: 5px;
  cursor: ${({ onClick }) => (onClick ? "pointer" : "default")};
  justify-content: ${({ $center }) => ($center ? "center" : "flex-start")};
`;

const EditIcon = styled.div`
  width: 30px;
  text-align: center;
  color: ${({ color }) => color || "black"};
  font-size: 20px;
  font-family: 'NanumGothic', sans-serif;
  font-weight: 600;
  user-select: none;
  cursor: pointer;
`;

const EditButton = ({
  children,
  width,
  $active = false,
  icon,
  iconColor,
  onIconClick,
  onClick,
  $plus = false, // 추가
  ...props
}) => {
  const hasChildren = !!children;
  return (
    <EditButtonStyled
      width={width}
      $active={$active}
      $plus={$plus}
      $center={!hasChildren && !!icon}
      onClick={onClick}
      {...props}
    >
      {hasChildren && (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
          {children}
        </div>
      )}
      {icon && (
        <EditIcon
          color={iconColor}
          onClick={e => {
            e.stopPropagation();
            onIconClick && onIconClick(e);
          }}
        >
          {icon}
        </EditIcon>
      )}
    </EditButtonStyled>
  );
};

export default EditButton;