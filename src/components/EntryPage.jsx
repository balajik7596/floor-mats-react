/* eslint-disable react/prop-types */
import React, { PureComponent } from "react";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
class EntryPage extends PureComponent {
  constructor(props) {
    super(props);
  }
  // "text-white bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 shadow-lg shadow-blue-500/50 dark:shadow-lg dark:shadow-blue-800/80 font-medium rounded-lg text-sm px-6 py-1 text-center mr-2 mb-2 "
  render() {
    return (
      <div className="w-screen h-full bg-white" style={{ height: "100vh" }}>
        {/* <div className="w-full h-12  pt-2">
          <button className="text-bold font-bold">
            <ExitToAppIcon sx={{ height: "30px", width: "30px" }} /> Sign In
          </button>
        </div> */}
        <div className="grid grid-cols-2 relative" style={{ top: "15%" }}>
          <div className="relative left-[15%] top-[15%]">
            <img
              className=""
              src="https://cdn.shopify.com/s/files/1/0620/9817/8148/files/storelogo.svg?v=1702842586"
            ></img>
            <p className="premiumGarage text-5xl" style={{}}>
              PREMIUM GARAGE{" "}
            </p>
            <p
              className="floorTile italic text-6xl -top-4 relative"
              style={{ fontStyle: "italic" }}
            >
              Floor Tile
            </p>

            <button
              className="bg-[#C21F39] w-1/2 py-2 text-white hover:bg-red-500"
              onClick={() => this.props.onClick()}
            >
              Create Now
            </button>
          </div>
          <img
            className=" h-[500px]"
            src="https://cdn.shopify.com/s/files/1/0620/9817/8148/files/front.png?v=1702842587"
          ></img>
        </div>
      </div>
    );
  }
}
export default EntryPage;
