import React from "react";

const ColorButton = ({ color, onClick }) => (
  <button
    style={{
      width: "30px",
      height: "30px",
      borderRadius: "50%",
      backgroundColor: color,
      margin: "10px",
      cursor: "pointer",
      border: "none",
      outline: "none",
      transition: "border 0.3s ease", // Adding a smooth transition for better user experience
    }}
    onClick={() => onClick(color)}
    onMouseOver={(e) => (e.target.style.border = "2px solid white")} // Adding border on mouse over
    onMouseOut={(e) => (e.target.style.border = "none")} // Removing border on mouse out
  />
);

export default ColorButton;
