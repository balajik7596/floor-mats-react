import React from "react";

const Footer = ({ title }) => {
  const footerStyle = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    color: "#333",
    padding: "10px",
    borderRadius: "10px", // Add round edges
    margin: "10px", // Add space between sides
  };

  const leftStyle = {
    flex: 1,
  };

  const centerStyle = {
    flex: 1,
    textAlign: "center",
  };

  const rightStyle = {
    flex: 1,
    textAlign: "right",
  };

  const imgStyle = {
    width: "auto",
    height: "auto",
  };

  return (
    <div className="footer-container m-2 bg-white grid grid-cols-3 rounded-lg h-[80px] items-center border-2 shadow-lg">
      <div className="pl-6">
        <img
          src="../assets/storelogo.svg"
          alt="Store Logo"
          style={{ height: "50px" }}
        />
      </div>

      <p className="text-center font-semibold">{title}</p>

      <div className="text-right right-6 relative">
        <p className="text-2xl font-bold">£ 29.50 GBP</p>
        <p className="text-xs">Price Per Metre² = 6.25 tiles</p>
      </div>
    </div>
  );
};

export default Footer;
