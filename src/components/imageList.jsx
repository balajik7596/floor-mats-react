import React from 'react';

// Define a data array with image URLs and labels
const imageList = [
  {
    src: '../assets/vented.svg',
    label: 'Vented mat',
    texture: '../assets/vented.jpg'

  },
  {
    src: '../assets/pvcfloormat.svg',
    label: 'Raised disc',
    texture: '../assets/Premiumpvc.png'
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
    <div className="image-list-menu" >
      <h2>Tile Options</h2>
      <ul>
        {imageList.map((image, index) => (
          <li key={index}>
            <img style={{ width: '150px', height: '150px' }}src={image.src} alt={image.label} onClick={() => handleClick(image  .texture.toString())} />
            <p>{image.label}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ImageListMenu;
