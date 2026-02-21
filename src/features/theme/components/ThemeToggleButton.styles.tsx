import styled from "styled-components";

export const ThemeToggleButton = styled.button<{theme: string}>`
  width: 64px;
  height: 32px;
  background-color: ${({theme}) => (theme === "light" ? "#6e6e6e" : "#a3a3a3")};
  border: none;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  cursor: pointer;
  shadow: 0px 1px 3px rgba(0, 0, 0, 0.2);
`;
