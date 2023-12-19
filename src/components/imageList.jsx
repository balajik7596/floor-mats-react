import React from "react";

// Define a data array with image URLs and labels
const imageList = [
  {
    src: "https://cdn.shopify.com/s/files/1/0620/9817/8148/files/vented.svg?v=1702842587",
    label: "Vented mat",
    texture:
      "https://cdn.shopify.com/s/files/1/0620/9817/8148/files/vented.jpg?v=1702842587",
  },
  {
    src: "https://cdn.shopify.com/s/files/1/0620/9817/8148/files/pvcfloormat.svg?v=1702842587",
    label: "Raised disc",
    texture:
      "https://cdn.shopify.com/s/files/1/0620/9817/8148/files/Premiumpvc.png?v=1702842587",
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
