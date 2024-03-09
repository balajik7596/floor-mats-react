import React from "react";

// Define a data array with image URLs and labels
const imageList = [
  {
    src: "https://cdn.shopify.com/s/files/1/0620/9817/8148/files/vented.svg?v=1702842587",
    label: "Vented mat",
    texture:
      "https://cdn.shopify.com/s/files/1/0251/5828/7434/files/vented2.png?v=1709642311",
  },
  {
    src: "https://cdn.shopify.com/s/files/1/0620/9817/8148/files/pvcfloormat.svg?v=1702842587",
    label: "Raised disc",
    texture:
      "https://cdn.shopify.com/s/files/1/0251/5828/7434/files/Premiumpvc_9c61b5b4-00a7-498b-a30e-f919fb52f3ba.png?v=1709642309",
  },
];

// Create the ImageListMenu component
const ImageListMenu = ({ onImageClick }) => {
  const handleClick = (imageName, type) => {
    if (onImageClick) {
      onImageClick(imageName, type);
    }
  };

  return (
    <div className="image-list-menu gap-2">
      <ul className="flex flex-row gap-2 items-center justify-center ">
        {imageList.map((image, index) => (
          <li key={index} className="">
            <img
              className="hover:cursor-pointer  hover:scale-110 hover:border-sky-400 hover:border-2"
              // style={{ height: "80px" }}
              src={image.src}
              alt={image.label}
              onClick={() => handleClick(image.texture.toString(), image.label)}
            />
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ImageListMenu;
