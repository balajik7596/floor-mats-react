import React from 'react';

const Footer = () => {
  const footerStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    color: '#333',
    padding: '10px',
    borderRadius: '10px', // Add round edges
    margin: '10px', // Add space between sides
  };

  const leftStyle = {
    flex: 1,
  };

  const centerStyle = {
    flex: 1,
    textAlign: 'center',
  };

  const rightStyle = {
    flex: 1,
    textAlign: 'right',
  };

  const imgStyle = {
    width: 'auto',
    height: 'auto',
  };

  return (
    <div style={footerStyle} className="footer-container">
      <div style={leftStyle}>
        <img src="../assets/storelogo.svg" alt="Store Logo" style={imgStyle} />
      </div>
      <div style={centerStyle}>
        <p>Choose Tile</p>
      </div>
      <div style={rightStyle}>
        <p>$99.99</p>
      </div>
    </div>
  );
};

export default Footer;
