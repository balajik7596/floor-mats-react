import React, { useState } from "react";

const imageList = [
  {
    src: "https://cdn.shopify.com/s/files/1/0620/9817/8148/files/nopattern.svg?v=1702842586",
    label: "No Pattern",
  },
  {
    src: "https://cdn.shopify.com/s/files/1/0620/9817/8148/files/checkedpattern.svg?v=1702842585",
    label: "Checked",
  },
  {
    src: "https://cdn.shopify.com/s/files/1/0620/9817/8148/files/boxpattern.svg?v=1702842586",
    label: "Box",
  },
];

const PatternImageListMenu = ({ onImageClick }) => {
  const [hoveredIndex, setHoveredIndex] = useState(null);

  const handleMouseEnter = (index) => {
    setHoveredIndex(index);
  };

  const handleMouseLeave = () => {
    setHoveredIndex(null);
  };

  const handleClick = (pattern) => {
    if (onImageClick) {
      onImageClick(pattern);
    }
  };

  return (
    <div className="image-list-menu" style={{ flexDirection: "row" }}>
      <ul
        style={{
          display: "flex",
          flexDirection: "row",
          listStyle: "none",
          padding: 0,
        }}
      >
        {imageList.map((image, index) => (
          <li
            key={index}
            style={{ marginLeft: "10px" }}
            onMouseEnter={() => handleMouseEnter(index)}
            onMouseLeave={handleMouseLeave}
          >
            <img
              style={{
                width: "80px",
                height: "80px",
                border: index === hoveredIndex ? "2px solid red" : "none",
              }}
              src={image.src}
              alt={image.label}
              onClick={() => handleClick(image.label)}
            />
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PatternImageListMenu;
