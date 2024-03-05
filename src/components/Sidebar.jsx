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
import { convertCentiMeter, convertFeetInch } from "../Utils/MeshUtils";
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
      "https://cdn.shopify.com/s/files/1/0620/9817/8148/files/vented2.png?v=1709569132",
  },
  {
    src: "https://cdn.shopify.com/s/files/1/0620/9817/8148/files/pvcfloormat.svg?v=1702842587",
    label: "Raised disc",
    texture:
      "https://cdn.shopify.com/s/files/1/0620/9817/8148/files/Premiumpvc_58d6ad6b-e575-4862-a01b-ba8570bc9ace.png?v=1709608170",
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
      isMeter: true,
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
      width: engine.converToUnit(engine.floorWidth),
      height: engine.converToUnit(engine.floorLength),
      bottomwidth: engine.converToUnit(engine.floorbottomWidth),
      bottomheight: engine.converToUnit(engine.floorbottomHeight),
      isMeter: engine.isMeter,
    });
  }
  UpdateLayoutType(val) {
    let engine = this.props.engine();
    this.setState({ isCustomLayout: val });
    if (!engine) this.props.initCanvas();
    engine.InitLayout(val, this.props.garageData);
    this.initTileType();
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
  initTileType() {
    this.updateTileType(tileTypes[0].texture.toString(), tileTypes[0].label);
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
  UpdateSize() {
    let engine = this.props.engine();
    const { bottomheight, bottomwidth, height, width, isMeter } = this.state;
    if (isMeter)
      engine.UpdateWidthHeight(
        Number.parseFloat(width),
        Number.parseFloat(height),
        Number.parseFloat(bottomwidth),
        Number.parseFloat(bottomheight)
      );
    else {
      engine.UpdateWidthHeight(
        engine.convertToMeter(Number.parseFloat(width)),
        engine.convertToMeter(Number.parseFloat(height)),
        engine.convertToMeter(Number.parseFloat(bottomwidth)),
        engine.convertToMeter(Number.parseFloat(bottomheight))
      );
    }
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
      isMeter,
      isOpenSideBar,
    } = this.state;
    const { currentProduct, colorList } = this.props;
    return (
      <>
        {!isOpenSideBar && (
          <button
            data-drawer-target="default-sidebar"
            data-drawer-toggle="default-sidebar"
            aria-controls="default-sidebar"
            type="button"
            onClick={() => this.setState({ isOpenSideBar: true })}
            class="inline-flex items-center p-2 mt-2 ms-3 text-sm text-gray-500 rounded-lg  sm:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 "
          >
            <span class="sr-only">Open sidebar</span>
            <svg
              class="w-6 h-6"
              aria-hidden="true"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                clip-rule="evenodd"
                fill-rule="evenodd"
                d="M2 4.75A.75.75 0 012.75 4h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 4.75zm0 10.5a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5a.75.75 0 01-.75-.75zM2 10a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 10z"
              ></path>
            </svg>
          </button>
        )}

        <div
          id="sidebar"
          className={` bg-gray-200 transition-transform translate-x  ${
            isOpenSideBar
              ? "z-[150] absolute w-full bg-[#6d6f73b3]"
              : "max-sm:hidden max-w-96"
          }`}
          style={{
            height: "100vh",
          }}
          onClick={(e) => {
            if (e.target.id === "sidebar")
              this.setState({ isOpenSideBar: false });
          }}
        >
          <div className={`${isOpenSideBar ? "w-3/4 bg-gray-200" : ""}`}>
            <div className="grid grid-cols-1 overflow-y-auto h-[100vh]">
              <div>
                <p className="text-lg font-semibold text-center pl-2.5 bg-[#bf0e0e] text-white ">
                  Layouts
                </p>

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
                <p className="text-lg font-semibold text-center pl-2.5 bg-[#bf0e0e] text-white ">
                  Pattern
                </p>
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
                <p className="text-lg font-semibold text-center pl-2.5 bg-[#bf0e0e] text-white ">
                  Tile type
                </p>
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
                    <p className="text-xl font-semibold text-center bg-[#bf0e0e] text-white mt-1">
                      <p className="pl-6">Layout size</p>
                    </p>
                    <div className="flex flex-row items-center content-center gap-x-2 px-6">
                      <p className="w-1/2 text-right items-center content-center">
                        Width
                      </p>
                      <div className="w-1/2">
                        <OutlinedInput
                          size="small"
                          value={width}
                          onChange={(e) =>
                            this.setState({
                              width: parseFloat(e.target.value)
                                ? Math.abs(Number(e.target.value))
                                : e.target.value,
                            })
                          }
                          id="outlined-adornment-weight"
                          endAdornment={
                            <InputAdornment position="end">
                              {isMeter ? "m" : "ft"}
                            </InputAdornment>
                          }
                          type="number"
                          aria-describedby="outlined-weight-helper-text"
                          inputProps={{
                            "aria-label": "width",
                          }}
                        />
                      </div>
                    </div>
                    <div className="flex flex-row items-center content-center gap-x-2 px-6">
                      <p className="w-1/2 text-right items-center content-center">
                        Length
                      </p>
                      <div className="w-1/2">
                        <OutlinedInput
                          value={height}
                          size="small"
                          onChange={(e) =>
                            this.setState({
                              height: parseFloat(e.target.value)
                                ? Math.abs(Number(e.target.value))
                                : e.target.value,
                            })
                          }
                          id="outlined-adornment-weight"
                          endAdornment={
                            <InputAdornment position="end">
                              {isMeter ? "m" : "ft"}
                            </InputAdornment>
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
                      <p className="text-xl font-semibold text-center  bg-[#bf0e0e] text-white mt-1 pl-5">
                        Bottom Layout Size
                      </p>
                      <div className="flex flex-row items-center content-center gap-x-2 px-6">
                        <p className="w-1/2 text-right items-center content-center">
                          Width
                        </p>
                        <div className="w-1/2">
                          <OutlinedInput
                            value={bottomwidth}
                            size="small"
                            onChange={(e) =>
                              this.setState({
                                bottomwidth: parseFloat(e.target.value)
                                  ? Math.abs(Number(e.target.value))
                                  : e.target.value,
                              })
                            }
                            id="outlined-adornment-weight"
                            endAdornment={
                              <InputAdornment position="end">
                                {isMeter ? "m" : "ft"}
                              </InputAdornment>
                            }
                            type="number"
                            aria-describedby="outlined-weight-helper-text"
                            inputProps={{
                              "aria-label": "width",
                            }}
                          />
                        </div>
                      </div>
                      <div className="flex flex-row items-center content-center gap-x-2 px-6">
                        <p className="w-1/2 text-right items-center content-center">
                          Length
                        </p>
                        <div className="w-1/2">
                          <OutlinedInput
                            size="small"
                            value={bottomheight}
                            onChange={(e) =>
                              this.setState({
                                bottomheight: parseFloat(e.target.value)
                                  ? Math.abs(Number(e.target.value))
                                  : e.target.value,
                              })
                            }
                            id="outlined-adornment-weight"
                            endAdornment={
                              <InputAdornment position="end">
                                {isMeter ? "m" : "ft"}
                              </InputAdornment>
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
                  <div className="pr-4 pl-8 pb-2">
                    <button
                      className="bg-green-600 hover:bg-green-500 rounded-lg shadow-green-800 w-full text-white mt-1 py-1 shadow-lg"
                      onClick={(e) => {
                        e.preventDefault();
                        this.UpdateSize();
                      }}
                    >
                      {" "}
                      Update
                    </button>
                  </div>
                  <div className="">
                    <p className="text-xl font-semibold text-center bg-[#bf0e0e] text-white my-1 pl-2.5">
                      Colour
                    </p>
                    <div className="flex flex-row items-center content-center gap-x-2 px-6">
                      <p className="w-1/2 text-right items-center content-center">
                        Primary
                      </p>
                      <div className="w-1/2 ">
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
                      <div className="flex flex-row items-center content-center gap-x-2 py-1 px-6">
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
