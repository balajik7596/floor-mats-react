/* eslint-disable react/prop-types */
import React, { PureComponent } from "react";

import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import DropDownMenu, { StyledMenu } from "./DropDownMenu";
import EditIcon from "@mui/icons-material/Edit";
import {
  Button,
  FormControl,
  FormHelperText,
  IconButton,
  InputAdornment,
  InputLabel,
  ListItemText,
  MenuItem,
  OutlinedInput,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { BaseUnits } from "../Utils/BaseUnits";
import { convertFeetInch } from "../Utils/MeshUtils";
import {
  Add,
  HdrPlus,
  Remove,
  TableRows,
  ViewColumn,
} from "@mui/icons-material";
import ImageListMenu from "./imageList";
const imageList = [
  {
    src: "https://cdn.shopify.com/s/files/1/0620/9817/8148/files/nopattern.svg?v=1702842586",
    label: "No Pattern",
  },
  {
    src: "https://cdn.shopify.com/s/files/1/0620/9817/8148/files/checkedpattern.svg?v=1702842585",
    label: "Checked",
  },
  {
    src: "https://cdn.shopify.com/s/files/1/0620/9817/8148/files/boxpattern.svg?v=1702842586",
    label: "Box",
  },
];
const tileTypes = [
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
      "https://cdn.shopify.com/s/files/1/0620/9817/8148/files/Premiumpvc_5e5fbe5b-6b88-4d35-9333-a776f5daae6a.png?v=1703160296",
  },
];
class Sidebar extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      currentMaterialType: "Steel",
      currentSkinColor: { name: "White", color: "white" },
      currentDoorMaterialType: "Steel",
      currentDoorSkinColor: { name: "Black", color: "black" },
      bottomheight: "",
      bottomwidth: "",
      height: "",
      width: "",
      primary: null,
      secondary: null,
      isCustomLayout: false,
      currentPattern: "No Pattern",
      currentTile: "Vented mat",
    };
  }
  updateRowscols() {
    const engine = this.props.engine();
    console.log(engine);
    this.setState({ row: engine.rows, cols: engine.cols });
  }
  componentDidMount() {}
  UpdateLayout() {
    let engine = this.props.engine();
    console.log("eid", engine);
    this.setState({
      width: engine.floorWidth,
      height: engine.floorLength,
      bottomwidth: engine.floorbottomWidth,
      bottomheight: engine.floorbottomHeight,
    });
  }
  UpdateLayoutType(val) {
    let engine = this.props.engine();
    this.setState({ isCustomLayout: val });
    if (!engine) this.props.initCanvas();
    engine.InitLayout(val, this.props.garageData);
  }
  UpdatePattern(val) {
    this.setState({ currentPattern: val });
    this.props.engine().updateFloorPattern({ pattern: val });
    // if (val !== "No Pattern") {
    if (this.state.currentTile === "Vented mat") {
      this.updateVariant(
        this.props.currentProduct.variants[6],
        this.props.currentProduct.variants[2]
      );
    } else {
      this.updateVariant(
        this.props.currentProduct.variants[0],
        this.props.currentProduct.variants[2]
      );
    }
    // }
  }
  updateTileType(imgsrc, type) {
    this.setState({ currentTile: type });
    this.props.handleImageClick(imgsrc, type);
  }
  updateVariant(primary, secondary) {
    console.log(primary, secondary);
    this.setState({ primary: primary, secondary: secondary });
    this.props
      .engine()
      .updateFloorColor(
        this.props.colorList[secondary.title],
        "Secondary",
        secondary
      );
    this.props
      .engine()
      .updateFloorColor(
        this.props.colorList[primary.title],
        "Primary",
        primary
      );
  }
  render() {
    const textBoxStyle = `
    form-control
    block
    text-center
    w-3/4
    text-sm
    px-4
    text-base
    font-semibold
    text-gray-700
    bg-white bg-clip-padding
    border border-solid border-gray-300
    rounded
    transition
    ease-in-out
    m-0
    focus:text-gray-700 focus:bg-white focus:border-blue-600 focus:outline-none `;
    const {
      bottomheight,
      bottomwidth,
      height,
      width,
      isCustomLayout,
      primary,
      secondary,
      currentTile,
      currentPattern,
    } = this.state;
    const { currentProduct, colorList } = this.props;
    return (
      <>
        <div
          className="w-96 bg-gray-200 "
          style={{
            height: "100vh",
          }}
        >
          <div>
            <div className="grid grid-cols-1 overflow-y-auto h-[100vh]">
              <div>
                <h6 className="text-lg font-semibold text-center bg-[#bf0e0e] text-white ">
                  Layouts
                </h6>

                <div className="flex flex-row items-center justify-center gap-2 py-1">
                  <img
                    className={`hover:scale-125 hover:cursor-pointer h-16 ${
                      isCustomLayout
                        ? "border-gray-500 border-2"
                        : "border-green-600 border-4"
                    }`}
                    src="https://cdn.shopify.com/s/files/1/0620/9817/8148/files/sq-layout.png?v=1702842586"
                    alt="Square Image 1"
                    onClick={() => {
                      this.UpdateLayoutType(false);
                    }}
                  />

                  <img
                    className={`hover:scale-125 hover:cursor-pointer h-16 ${
                      isCustomLayout
                        ? "border-green-600 border-4"
                        : "border-gray-500 border-2"
                    }`}
                    src="https://cdn.shopify.com/s/files/1/0620/9817/8148/files/custom-layout.png?v=1702842585"
                    alt="Square Image 2"
                    onClick={() => {
                      this.UpdateLayoutType(true);
                    }}
                  />
                </div>
                <h2 className="text-lg font-semibold text-center bg-[#bf0e0e] text-white ">
                  Pattern
                </h2>
                <div className=" flex flex-row items-center justify-center gap-2 py-1">
                  {imageList.map((item) => (
                    <img
                      className={`hover:scale-110 hover:cursor-pointer h-16  ${
                        currentPattern === item.label
                          ? "border-green-600 border-4"
                          : "border-gray-500 border-2"
                      }`}
                      src={item.src}
                      alt={item.label}
                      onClick={() => {
                        this.UpdatePattern(item.label);
                      }}
                    />
                  ))}
                </div>
                <h2 className="text-lg font-semibold text-center bg-[#bf0e0e] text-white ">
                  Tile Type
                </h2>
                <div className=" flex flex-row items-center justify-center gap-2 pt-2">
                  {tileTypes.map((item) => (
                    <img
                      className={`hover:scale-110 hover:cursor-pointer h-16  ${
                        currentTile === item.label
                          ? "border-green-600 border-4"
                          : "border-gray-500 border-2"
                      }`}
                      // style={{ height: "80px" }}
                      src={item.texture}
                      alt={item.label}
                      onClick={() =>
                        this.updateTileType(item.texture.toString(), item.label)
                      }
                    />
                  ))}
                </div>

                {/* <ImageListMenu onImageClick={this.handleImageClick} /> */}
                <div>
                  <div className="grid grid-cols-1 gap-1">
                    <h2 className="text-xl font-semibold text-center bg-[#bf0e0e] text-white mt-1">
                      Layout Size
                    </h2>
                    <div className="flex flex-row items-center content-center gap-x-2">
                      <p className="w-1/2 text-right items-center content-center">
                        Width
                      </p>
                      <div className="w-1/2">
                        <OutlinedInput
                          size="small"
                          value={width}
                          onChange={(e) =>
                            this.setState({ width: e.target.value })
                          }
                          id="outlined-adornment-weight"
                          endAdornment={
                            <InputAdornment position="end">M</InputAdornment>
                          }
                          type="number"
                          aria-describedby="outlined-weight-helper-text"
                          inputProps={{
                            "aria-label": "width",
                          }}
                        />
                      </div>
                    </div>
                    <div className="flex flex-row items-center content-center gap-x-2">
                      <p className="w-1/2 text-right items-center content-center">
                        Height
                      </p>
                      <div className="w-1/2">
                        <OutlinedInput
                          value={height}
                          size="small"
                          onChange={(e) =>
                            this.setState({ height: e.target.value })
                          }
                          id="outlined-adornment-weight"
                          endAdornment={
                            <InputAdornment position="end">M</InputAdornment>
                          }
                          type="number"
                          aria-describedby="outlined-weight-helper-text"
                          inputProps={{
                            "aria-label": "height",
                          }}
                        />
                      </div>
                    </div>
                  </div>
                  {isCustomLayout && (
                    <div className="grid grid-cols-1 gap-1">
                      <h2 className="text-xl font-semibold text-center bg-[#bf0e0e] text-white mt-1">
                        Bottom Layout Size
                      </h2>
                      <div className="flex flex-row items-center content-center gap-x-2">
                        <p className="w-1/2 text-right items-center content-center">
                          Width
                        </p>
                        <div className="w-1/2">
                          <OutlinedInput
                            value={bottomwidth}
                            size="small"
                            onChange={(e) =>
                              this.setState({ bottomwidth: e.target.value })
                            }
                            id="outlined-adornment-weight"
                            endAdornment={
                              <InputAdornment position="end">M</InputAdornment>
                            }
                            type="number"
                            aria-describedby="outlined-weight-helper-text"
                            inputProps={{
                              "aria-label": "width",
                            }}
                          />
                        </div>
                      </div>
                      <div className="flex flex-row items-center content-center gap-x-2">
                        <p className="w-1/2 text-right items-center content-center">
                          Height
                        </p>
                        <div className="w-1/2">
                          <OutlinedInput
                            size="small"
                            value={bottomheight}
                            onChange={(e) =>
                              this.setState({ bottomheight: e.target.value })
                            }
                            id="outlined-adornment-weight"
                            endAdornment={
                              <InputAdornment position="end">M</InputAdornment>
                            }
                            type="number"
                            aria-describedby="outlined-weight-helper-text"
                            inputProps={{
                              "aria-label": "height",
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                  <div className="pr-4 pl-8">
                    <button
                      className="bg-green-600 hover:bg-green-500 rounded-lg shadow-green-800 w-full text-white mt-1 py-1 shadow-lg"
                      onClick={(e) => {
                        e.preventDefault();
                        this.props
                          .engine()
                          .UpdateWidthHeight(
                            Number.parseFloat(width),
                            Number.parseFloat(height),
                            Number.parseFloat(bottomwidth),
                            Number.parseFloat(bottomheight)
                          );
                      }}
                    >
                      {" "}
                      Update
                    </button>
                  </div>
                  <div className="">
                    <h2 className="text-xl font-semibold text-center bg-[#bf0e0e] text-white my-1">
                      Color
                    </h2>
                    <div className="flex flex-row items-center content-center gap-x-2">
                      <p className="w-1/2 text-right items-center content-center">
                        Primary
                      </p>
                      <div className="w-1/2">
                        <FormControl fullWidth sx={{ m: 0, p: 0 }} size="small">
                          <Select
                            style={{ padding: "0px" }}
                            labelId="demo-simple-select-label"
                            id="demo-simple-select"
                            value={primary}
                            sx={{ m: 0, p: 0 }}
                            onChange={(e) => {
                              this.setState({ primary: e.target.value });
                              this.props
                                .engine()
                                .updateFloorColor(
                                  colorList[e.target.value.title],
                                  "Primary",
                                  e.target.value
                                );
                            }}
                          >
                            {currentProduct &&
                              currentProduct.variants.map((item) => (
                                <MenuItem value={item}>
                                  <div
                                    className="h-6 w-full border-2 border-black"
                                    style={{
                                      background: colorList[item.title],
                                    }}
                                  ></div>
                                </MenuItem>
                              ))}

                            {/* <MenuItem value={10}>
                            <div
                              className="h-6 w-full"
                              style={{ background: "green" }}
                            ></div>
                          </MenuItem> */}
                          </Select>
                        </FormControl>
                      </div>
                    </div>
                    {currentPattern !== "No Pattern" && (
                      <div className="flex flex-row items-center content-center gap-x-2 py-1">
                        <p className="w-1/2 text-right items-center content-center">
                          Secondary
                        </p>
                        <div className="w-1/2">
                          <FormControl
                            fullWidth
                            sx={{ m: 0, p: 0 }}
                            size="small"
                          >
                            <Select
                              style={{ padding: "0px" }}
                              labelId="demo-simple-select-label"
                              id="demo-simple-select"
                              value={secondary}
                              sx={{ m: 0, p: 0 }}
                              onChange={(e) => {
                                this.setState({ secondary: e.target.value });
                                this.props
                                  .engine()
                                  .updateFloorColor(
                                    colorList[e.target.value.title],
                                    "Secondary",
                                    e.target.value
                                  );
                              }}
                            >
                              {currentProduct &&
                                currentProduct.variants.map((item) => (
                                  <MenuItem value={item}>
                                    <div
                                      className="h-6 w-full border-2 border-black"
                                      style={{
                                        background: colorList[item.title],
                                      }}
                                    ></div>
                                  </MenuItem>
                                ))}

                              {/* <MenuItem value={10}>
                            <div
                              className="h-6 w-full"
                              style={{ background: "green" }}
                            ></div>
                          </MenuItem> */}
                            </Select>
                          </FormControl>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }
}
export default Sidebar;
