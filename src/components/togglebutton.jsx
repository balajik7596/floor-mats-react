import React, { useState } from "react";

const ToggleButton = ({ onToggle, leftText, rightText }) => {
  const [isToggled, setToggled] = useState(false);

  const handleToggle = (e) => {
    console.log(e.target.innerText);
    setToggled(!isToggled);
    onToggle(!isToggled); // Pass the new state to a callback function, if needed
  };

  const buttonStyle = {
    position: "absolute",
    width: "240px", // Adjust the width of the oval
    height: "40px",
    top: "12%", // Position 25% down from the top
    left: "50%", // Center horizontally
    transform: "translateX(-50%)", // Center horizontally
    // padding: "10px",
    // background: "#f0e7e6", //isToggled ? '#f0f2f5' : '#8c1f1f',
    color: "#8c1f1f", // Text color
    cursor: "pointer",
    borderRadius: "20px",
    display: "flex",
    alignItems: "center",
    // justifyContent: !isToggled ? "flex-end" : "flex-start",
    transition: "background 0.3s, color 0.3s",
  };

  const sliderStyle = {
    width: "120px", // Adjust the width of the oval
    height: "40px", // Adjust the height of the oval
    borderRadius: "20px", // Half the height for a circular shape
    background: isToggled ? "#8c1f1f" : "#fff",
    position: "absolute",
    top: "0",
    left: isToggled ? "60px" : "0", // Adjust the left position for centering
    transition: "left 0.3s, background 0.3s",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: isToggled ? "#fff" : "#000", // Set text color to white when toggled on
  };

  const circleStyle = {
    width: "120px", // Adjust the width of the oval
    height: "40px", // Adjust the height of the oval
    borderRadius: "20px", // Half the height for a circular shape
    background: isToggled ? "#8c1f1f" : "#fff",
    position: "absolute",
    top: "0",
    left: isToggled ? "60px" : "60px", // Adjust the left position for centering
    transition: "left 0.3s, background 0.3s",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: isToggled ? "#fff" : "#000", // Set text color to white when toggled on
  };

  const textStyle = {
    color: isToggled ? "#fff" : "#8c1f1f",
  };

  return (
    <div style={buttonStyle} className=" " onClick={handleToggle}>
      <div className="grid grid-cols-2 w-full text-center bg-[#f0e7e6] rounded-full">
        <p
          className={`${
            isToggled ? "" : "rounded-full bg-red-600 text-white"
          }  h-full  py-2`}
        >
          {" "}
          {leftText}
        </p>
        <p
          className={`${
            isToggled ? "rounded-full bg-red-600 text-white" : ""
          }  h-full  py-2`}
        >
          {" "}
          {rightText}
        </p>
      </div>

      {/* {!isToggled ? rightText : leftText}
      <div style={sliderStyle} className="slider">
        <div style={circleStyle}>
          <div style={textStyle}>{isToggled ? rightText : leftText}</div>
        </div>
      </div> */}
    </div>
  );
};

export default ToggleButton;
