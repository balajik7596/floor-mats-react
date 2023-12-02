import React from "react";

// Define a data array with image URLs and labels
const imageList = [
  {
    src: "../assets/vented.svg",
    label: "Vented mat",
    texture: "../assets/vented.jpg",
  },
  {
    src: "../assets/pvcfloormat.svg",
    label: "Raised disc",
    texture: "../assets/Premiumpvc.png",
  },
];

// Create the ImageListMenu component
const ImageListMenu = ({ onImageClick }) => {
  const handleClick = (imageName) => {
    if (onImageClick) {
      onImageClick(imageName);
    }
  };

  return (
    <div className="image-list-menu gap-2">
      <ul className="grid gap-4">
        {imageList.map((image, index) => (
          <li key={index} className="">
            <img
              style={{ width: "80px", height: "80px" }}
              src={image.src}
              alt={image.label}
              onClick={() => handleClick(image.texture.toString())}
            />
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ImageListMenu;
