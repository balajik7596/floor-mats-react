import React from 'react';

// Define a data array with image URLs and labels
const imageList = [
  {
    src: '../assets/floormat.jpg',
    label: 'Rubber dotted',
  },
  {
    src: '../assets/steel.jpeg',
    label: 'Diamond pattern',
  },
  {
    src: '../assets/vented.jpg',
    label: 'Vented mat',
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
    <div className="image-list-menu">
      <h2>Image Menu</h2>
      <ul>
        {imageList.map((image, index) => (
          <li key={index}>
            <img style={{ width: '50px', height: '50px' }}src={image.src} alt={image.label} onClick={() => handleClick(image.src.toString())} />
            <p>{image.label}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ImageListMenu;
