import React from "react";

const ColorButton = ({ color, onClick }) => (
  <button
    style={{
      width: "40px",
      height: "40px",
      borderRadius: "50%",
      backgroundColor: color,
      margin: "10px",
      cursor: "pointer",
    }}
    className="border-2 border-gray-400"
    onClick={(e) => {
      e.preventDefault();
      onClick(color);
    }}
    onMouseOver={(e) => (e.target.style.border = "2px solid white")} // Adding border on mouse over
    onMouseOut={(e) => (e.target.style.border = "none")} // Removing border on mouse out
  />
);

export default ColorButton;
