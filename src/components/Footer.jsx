import React, { useState, useEffect } from "react";

import { subscribe } from "./EventMediator";

const Footer = ({ title, isLast, tileType, checkoutItem }) => {
  const [price, setPrice] = useState(62400);
  const [quantity, setQuantity] = useState(1);
  useEffect(() => {
    const handleFloorUpdate = (payload) => {
      setPrice(payload.price);
      setQuantity(payload.quantity);
    };

    const subscription = subscribe("floorUpdated", handleFloorUpdate);

    // return () => {
    //   // Cleanup subscription when the component is unmounted
    //   subscription.unsubscribe();
    // };
  }, []);

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
          src="https://cdn.shopify.com/s/files/1/0620/9817/8148/files/storelogo.svg?v=1702842586"
          alt="Store Logo"
          style={{ height: "50px" }}
        />
      </div>
      <div className="flex flex-row items-center justify-center gap-6">
        <p className="text-center font-semibold">
          {" "}
          <p className=" right-8 relative">Quantity: {quantity}</p>
        </p>

        <div className="text-left right-6 relative">
          <p className="text-2xl font-bold">&pound; {price}</p>
          {tileType === "Vented mat" ? (
            <p className="text-xs">Price Per Metre² = 6.25 tiles</p>
          ) : (
            <p className="text-xs">Price Per Metre² = 4 tiles</p>
          )}
        </div>
      </div>

      <div className="w-full flex flex-row-reverse">
        <button
          className="bg-[#C11D37] w-1/2  right-0 h-16 rounded-lg px-4 text-xl font-semibold text-white hover:bg-[#cf4b4b]"
          onClick={(e) => {
            e.preventDefault();
            checkoutItem();
          }}
        >
          Check Out
        </button>
      </div>

      {/* {isLast && (
        <div className="text-right right-6 relative">
          <button
            className="bg-[#C11D37] h-16 rounded-lg px-4 text-xl font-semibold text-white hover:bg-[#cf4b4b]"
            onClick={() => {
              checkout();
            }}
          >
            Check Out
          </button>
        </div>
      )} */}
    </div>
  );
};

export default Footer;
