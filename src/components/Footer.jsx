import React, { useState, useEffect } from "react";

import { subscribe } from "./EventMediator";

const Footer = ({ title, isLast, tileType, checkoutItem }) => {
  const [price, setPrice] = useState(35.4);
  const [vatprice, setVatPrice] = useState(29.5);
  const [isLoading, setIsLoading] = useState(false);
  const [quantity, setQuantity] = useState(1);
  useEffect(() => {
    const handleFloorUpdate = (payload) => {
      setPrice(payload.price);
      setVatPrice(payload.excludeVat);
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
    <div className="footer-container m-2 bg-white max-sm:text-xs grid grid-cols-3 max-sm:grid-cols-1 max-sm:z-[100]  max-sm:absolute max-sm:top-[68%] rounded-lg h-[80px] max-sm:h-auto max-sm:w-[95vw]  items-center border-2 shadow-lg">
      <div className="pl-6 max-sm:text-center items-center flex max-sm:justify-center">
        <img
          src="https://cdn.shopify.com/s/files/1/0251/5828/7434/files/storelogo.png?v=1709641056"
          alt="Store Logo"
          style={{ height: "50px" }}
        />
      </div>
      <div className="flex flex-row max-sm:flex-col items-center justify-center gap-6 max-sm:gap-0 max-sm:pl-12 ">
        <p className="text-center font-semibold">
          {" "}
          <p className=" right-8 relative">Quantity: {quantity}</p>
        </p>

        <div className="text-left right-6 relative">
          <p className="text-md max-sm:text-sm font-semibold text-green-500">
            &pound; {vatprice} GBP (exc VAT)
          </p>

          <p className="text-md font-bold max-sm:text-sm">
            &pound; {price} (inc VAT)
          </p>
          {tileType === "Vented mat" ? (
            <p className="text-xs">Price Per Metre² = 6.25 tiles</p>
          ) : (
            <p className="text-xs">Price Per Metre² = 4 tiles</p>
          )}
        </div>
      </div>

      <div className="w-full flex flex-row-reverse max-sm:pt-1">
        <button
          className="bg-[#C11D37] w-1/2 max-sm:w-full right-0 h-16 max-sm:h-8 rounded-lg px-4 text-xl font-semibold text-white hover:bg-[#cf4b4b]"
          onClick={(e) => {
            e.preventDefault();
            setIsLoading(true);
            checkoutItem();
          }}
        >
          Check Out
        </button>
      </div>
      {isLoading && (
        <div className="fixed z-150 top-0 left-0  bg-[#f9b1b15e] w-full h-full max-sm:h-[100vh] ">
          <div className="relative top-[40%] left-[50%] ">
            <div className="grid grid-cols-1 w-32">
              <div>
                <svg
                  aria-hidden="true"
                  class="inline w-32 h-32 text-gray-500 animate-spin  fill-red-600"
                  viewBox="0 0 100 101"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                    fill="currentColor"
                  />
                  <path
                    d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                    fill="currentFill"
                  />
                </svg>
              </div>
              <p class=" text-center text-xl pt-4 font-bold">Loading...</p>
            </div>
          </div>
        </div>
      )}

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
