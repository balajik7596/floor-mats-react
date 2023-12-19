/* eslint-disable react/prop-types */
import React, { PureComponent } from "react";

import Engine from "../core/Engine";
import ImageListMenu from "./imageList";
import PatternImageListMenu from "./patternImageList";
import ColorButton from "./colorList";
import Sidebar from "./Sidebar";
import Footer from "./Footer";
import ToggleButton from "./togglebutton";
import CloseIcon from "@mui/icons-material/Close";
import {
  FormControl,
  IconButton,
  InputLabel,
  Menu,
  MenuItem,
  Select,
} from "@mui/material";
import BottomPanel from "./BottomPanel";
import LockerProperty from "../core/LockerProperty";
import { withTranslation } from "react-i18next";
import DropDownMenu from "./DropDownMenu";
import DropDownMenuLang from "./DropDownMenuLang";
import {
  Add,
  CloseOutlined,
  HdrPlusOutlined,
  Refresh,
  Remove,
  ZoomIn,
  ZoomOut,
} from "@mui/icons-material";
import { t } from "i18next";
import { convertCentiMeter, convertToMeter } from "../Utils/MeshUtils";
import EntryPage from "./EntryPage";
const footerTitle = [
  "Floor Shapes",
  "Dimensions",
  "Select Tile And Color",
  "Pattern",
  "",
];

let SidebarRef = React.createRef();
let colorList = {
  Black: "black",
  "Light Gray": "lightgray",
  Red: "red",
  Blue: "blue",
  Green: "green",
  Yellow: "yellow",
  White: "white",
  Orange: "orange",
  "Dark Grey": "darkgray",
  Turquoise: "turquoise",
  Pink: "pink",
  "Fluorescent Yellow": "greenyellow",
  "Dark Blue": "darkblue",
  Gold: "gold",
  "Purple Yellow": "",
};
class Viewer2 extends PureComponent {
  constructor(props) {
    super(props);
    this.engine = null;
    this.EditProfile = null;
    this.state = {
      CameraAdded: false,
      isEditProfile: false,
      contextMenu: null,
      isELevationLayout: false,
      isAnnotations: false,
      DoorStyle: "AA",
      isGenerateImages: false,
      dataGenerated: false,
      menuOpen: true,
      loaded: false,
      patternColor: "Primary",
      loadergif: "",
      showEntryPage: true,
      garageData: props.data ? props.data : defaultData,
      backgroundPlaces: [
        "Office",
        "Loft Office",
        "Art Museum",
        "Exhibition Hall",
      ],
      showImageBoxes: true,
      isCustomLayout: false,
      currentBack: "Loft Office",
      selectedButtonIndex: 0,
    };
    // if (process.env.NODE_ENV !== "production") {
    //   import("../Assets/css/libary.css").then(() => {
    //     console.log("dev css Loaded");
    //   });
    // }

    this.messageEventLoaded = false;
    this.UpdateStyle = this.UpdateStyle.bind(this);
    this.LoadingCompleted = this.LoadingCompleted.bind(this);
    this.PostForm = this.PostForm.bind(this);
    this.handleColorClick = this.handleColorClick.bind(this);
    this.handleImageClick = this.handleImageClick.bind(this);
    this.handleButtonClick = this.handleButtonClick.bind(this);
  }
  componentDidMount() {
    // this.initCanvas();
    // this.submitClick();
    // // if (!this.messageEventLoaded)
    // {
    //   if (window.addEventListener) {
    //     window.addEventListener("message", (e) => this.onMessge(e), false);
    //   } else {
    //     window.attachEvent("onmessage", (e) => this.onMessge(e));
    //   }
    //   this.messageEventLoaded = true;
    // }
  }
  onMessge(e) {
    switch (e.data.type) {
      case "LoadByJson":
        {
          this.engine.LoadLocker(e.data.data);
          SidebarRef.UpdateJson(e.data.data);
        }
        break;
      case "GetUpdatedJson":
        {
          this.engine.SendUpdatedJson(
            SidebarRef.current.state.currentKeySystem,
            SidebarRef.current.state.currentAccess,
            SidebarRef.current.state.selectedExtras
          );
        }
        break;
    }
    // this.engine.loadColumns(2, 2);
    console.log(e);
  }
  initCanvas() {
    if (!this.engine) {
      this.engine = new Engine(this.props.CanvasID, this.props.filePath);
      this.setState({ loadergif: this.props.filePath + "image/loader.gif" });
      this.setState({ logopng: this.props.filePath + "image/logo.png" });
      // this.engine.initEngine();
      this.engine.onUpdateChange = this.UpdateStyle;
      this.engine.loadingComplete = this.LoadingCompleted;
      this.engine.PostForm = this.PostForm;
    }
    return this.engine;
  }
  PostForm(data) {
    SidebarRef.current?.postData(data);
  }
  LoadingCompleted() {
    this.setState({ loaded: true });
  }
  UpdateStyle() {
    console.log("updTE");
    SidebarRef.current?.updateRowscols();
  }
  submitClick() {
    // this.engine.loadFile();
  }
  resetView() {
    this.engine.resetView();
  }
  zoomInView() {
    this.engine.zoomInView();
  }
  zoomOutView() {
    this.engine.zoomOutView();
  }

  OnContextMenu(e) {
    e.preventDefault();
    // let selected = this.SidebarRef.current.state.selectedComponent;
    // if (selected !== "")
    //   this.setState({
    //     contextMenu: {
    //       mouseX: e.clientX + 2,
    //       mouseY: e.clientY - 6,
    //     },
    //   });
  }
  closeContext() {
    this.setState({ contextMenu: null });
  }
  handleImageClick = (imgsrc) => {
    this.engine.updateFloorMaterial(imgsrc);
  };
  handlePatternImageClick = (pattern) => {
    // if (pattern === "Box" && this.state.isCustomLayout) {
    //   console.log("hit");
    //   return;
    // }
    this.engine.updateFloorPattern({ pattern: pattern });
  };
  handleButtonClick = (index) => {
    // if (this.state.showImageBoxes) return;
    this.setState({ selectedButtonIndex: index });

    console.log("Button clicked:", index);
  };
  handleColorClick(selectedColor, variant) {
    this.engine.updateFloorColor(
      selectedColor,
      this.state.patternColor,
      variant
    );
  }
  checkoutItem() {
    let squareFeet = this.engine.floorLength * this.engine.floorWidth;

    if (this.engine.isCustomLayout) {
      squareFeet +=
        this.engine.floorbottomHeight * this.engine.floorbottomWidth;
    }
    let meterval = convertToMeter(squareFeet * 12);
    meterval = Math.round(meterval);
    console.log(meterval);
    if (document.getElementById("quantity")) {
      document.getElementById("quantity").value = meterval;

      document.querySelector("[data-add-to-cart]").click();
    }
  }
  contextComponent() {}
  render() {
    const {
      isEditProfile,
      contextMenu,
      isELevationLayout,
      isAnnotations,
      isGenerateImages,
      imageData,
      dataGenerated,
      menuOpen,
      loaded,
      patternColor,
      showEntryPage,
      loadergif,
      logopng,
      backgroundPlaces,
      currentBack,
      garageData,
      selectedButtonIndex,
    } = this.state;
    const containerStyle = {
      position: "absolute",
      top: 0,
      left: 0,
    };
    const imageList = [
      {
        src: "https://cdn.shopify.com/s/files/1/0620/9817/8148/files/newlayout.svg?v=1702842585",
        label: "Rubber dotted",
      },
      {
        src: "https://cdn.shopify.com/s/files/1/0620/9817/8148/files/customise.svg?v=1702842585",
        label: "Diamond pattern",
      },
      // {
      //   src: "../assets/choosetile.svg",
      //   label: "Vented mat",
      // },
      {
        src: "https://cdn.shopify.com/s/files/1/0620/9817/8148/files/choosepattern.svg?v=1702842585",
        label: "Raised disc mat",
      },
      {
        src: "https://cdn.shopify.com/s/files/1/0620/9817/8148/files/home.svg?v=1702842585",
        label: "Raised disc mat",
      },
    ];
    this.toggleImageBoxes = () => {
      this.setState({ showImageBoxes: !this.state.showImageBoxes });
    };
    const colors = [
      "#000000", // Black
      "#808080", // Grey
      "#404040", // Dark Grey
      "#FF0000", // Red
      "#0000FF", // Blue
      "#E0E0E0", // A bit darker Off White
      "#8A2BE2", // Violet
      "#FFC0CB", // Pink
      "#00FFFF", // Cyan
      "#00008B", // Dark Blue
      "#90EE90", // Light Green
      "#006400", // Dark Green
    ];
    return (
      <>
        <>
          <div className="flex-col flex font-sans  bg-[#fffdfd] font-[Open_Sans] ">
            <div className="absolute z-50 right-4 top-6 ">
              <button
                className=""
                onClick={(e) => {
                  e.preventDefault();
                  console.log("close");
                  document.getElementById("root2").style.visibility = "hidden";
                  // document
                  //   .getElementById("root2")
                  //   .parentNode.removeChild(document.getElementById("root2"));
                }}
              >
                <CloseIcon sx={{ fontSize: "40px", color: "#ff0029" }} />{" "}
              </button>{" "}
            </div>
            <div
              className=" w-full h-full relative"
              id={this.props?.CanvasID}
              style={{
                width: "100%",
                height: "85vh",
              }}
              // onMouseMove={(e) => this.engine.mouseMove(e)}
              onMouseDown={(e) => this.engine.onClick(e)}
              // onMouseUp={(e) => this.engine.mouseUp(e)}
              onContextMenu={(e) => this.OnContextMenu(e)}
            >
              <div
                className="menu-container"
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "10px", // Adjust the right distance as needed
                  transform: "translateY(-50%)",
                  display: "flex",
                  flexDirection: "column", // Display buttons in a column
                  alignItems: "center",
                }}
              >
                {this.state.selectedButtonIndex == 2 && (
                  <div className="grid grid-cols-1">
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <div style={{ marginRight: "50px" }}>
                        <ImageListMenu onImageClick={this.handleImageClick} />
                      </div>
                      <div className="grid grid-cols-2">
                        <div className="col-span-2">
                          <FormControl fullWidth>
                            <InputLabel id="demo-simple-select-label">
                              Color
                            </InputLabel>
                            <Select
                              labelId="demo-simple-select-label"
                              id="demo-simple-select"
                              value={patternColor}
                              label="Color"
                              onChange={(e) =>
                                this.setState({
                                  patternColor: e.target.value,
                                })
                              }
                            >
                              <MenuItem value="Primary">Primary</MenuItem>
                              <MenuItem value="Secondary">Secondary</MenuItem>
                            </Select>
                          </FormControl>
                        </div>
                        {garageData &&
                          garageData.variants.map((item) => (
                            <div>
                              <ColorButton
                                key={item.id}
                                color={colorList[item.title]}
                                onClick={() =>
                                  this.handleColorClick(
                                    colorList[item.title],
                                    item
                                  )
                                }
                              />
                            </div>
                          ))}
                      </div>
                      {/* <div
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        maxWidth: "100px",
                      }}
                    >
                      {colors.map((color, index) => (
                        <ColorButton
                          key={index}
                          color={color}
                          onClick={this.handleColorClick}
                        />
                      ))}
                    </div> */}
                    </div>
                  </div>
                )}
              </div>
              <div
                className="round-buttons"
                style={{
                  position: "absolute",
                  top: "50%",
                  right: "10px", // Adjust the right distance as needed
                  transform: "translateY(-50%)",
                  display: "flex",
                  flexDirection: "column", // Display buttons in a column
                  alignItems: "center",
                }}
              >
                {imageList.map((image, index) => (
                  <div
                    key={index}
                    className="round-button"
                    style={{
                      width: "50px",
                      height: "50px",
                      borderRadius: "50%",
                      backgroundColor:
                        index === selectedButtonIndex ? "#8c1f1f" : "#fff",
                      marginBottom: "10px",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                    onClick={() => this.handleButtonClick(index)}
                  >
                    <img
                      src={image.src}
                      alt={`Button ${index + 1}`}
                      style={{
                        width: "80%",
                        height: "auto",
                        display: "block",
                      }}
                    />
                  </div>
                ))}
                {this.state.selectedButtonIndex === 4 ? (
                  <button
                    className="bg-[#C11D37] h-16 px-2 text-white hover:bg-[#cf4b4b]"
                    onClick={(e) => {
                      e.preventDefault();
                      this.setState({
                        selectedButtonIndex: this.state.selectedButtonIndex - 1,
                      });
                    }}
                  >
                    {`<< Back`}{" "}
                  </button>
                ) : (
                  <button
                    className="bg-[#C11D37] h-16 px-2 text-white hover:bg-[#cf4b4b]"
                    onClick={(e) => {
                      e.preventDefault();
                      this.setState({
                        selectedButtonIndex: this.state.selectedButtonIndex + 1,
                      });
                    }}
                  >
                    {`Next >>`}{" "}
                  </button>
                )}
              </div>
            </div>
            {this.state.selectedButtonIndex === 0 && (
              <div
                className="w-[40%] h-[40%] bg-gray-50 rounded-lg shadow-lg flex flex-col  justify-center"
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",

                  transform: "translate(-50%, -50%)",

                  alignItems: "center",
                }}
              >
                <p className="text-2xl font-semibold text-gray-800 -mt-12 pb-4">
                  {" "}
                  Select Layout
                </p>
                <div className="flex flex-row">
                  <div
                    style={{
                      width: "150px",
                      height: "150px",
                      marginRight: "10px",
                    }}
                  >
                    <img
                      className="hover:scale-125 hover:cursor-pointer"
                      src="https://cdn.shopify.com/s/files/1/0620/9817/8148/files/sq-layout.png?v=1702842586"
                      alt="Square Image 1"
                      onClick={() => {
                        this.setState({
                          showImageBoxes: !this.state.showImageBoxes,
                          isCustomLayout: false,
                          selectedButtonIndex: 1,
                        });
                        if (!this.engine) this.initCanvas();
                        this.engine.InitLayout(false, garageData);
                      }}
                    />
                  </div>
                  <div style={{ width: "150px", height: "150px" }}>
                    <img
                      className="hover:scale-125 hover:cursor-pointer"
                      src="https://cdn.shopify.com/s/files/1/0620/9817/8148/files/custom-layout.png?v=1702842585"
                      alt="Square Image 2"
                      onClick={() => {
                        this.setState({
                          showImageBoxes: !this.state.showImageBoxes,
                          isCustomLayout: true,
                          selectedButtonIndex: 1,
                        });
                        if (!this.engine) this.initCanvas();
                        this.engine.InitLayout(true, garageData);
                      }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
          {this.state.selectedButtonIndex === 2 && (
            <div
              style={{
                position: "absolute",
                top: "2%",
                left: "50%",
                transform: "translate(-50%, 0)",
                display: "flex",
                alignItems: "center",
              }}
            >
              <PatternImageListMenu
                onImageClick={this.handlePatternImageClick}
              />
            </div>
          )}
          {/* {!this.state.showImageBoxes && ( */}
          <>
            {/* {this.state.selectedButtonIndex === 2 && (
            <ToggleButton
              leftText="Vented Tiles"
              rightText="Smooth PVC"
              onToggle={(toggled) => this.engine.changeSelectedTile(toggled)}
            />
          )} */}
            {this.state.selectedButtonIndex === 1 && (
              <ToggleButton
                leftText="Feet"
                rightText="Meter"
                onToggle={(toggled) => this.engine.changeMeasureUnit(toggled)}
              />
            )}

            <Footer
              title={footerTitle[this.state.selectedButtonIndex]}
              isLast={this.state.selectedButtonIndex === 3}
              checkout={() => {
                this.checkoutItem();
              }}
            />
          </>
          {/* )} */}
        </>
        {showEntryPage && (
          <div className="fixed z-50 top-0 left-0">
            <EntryPage
              onClick={() => this.setState({ showEntryPage: false })}
            />
          </div>
        )}
      </>
    );
  }
}
let defaultData = {
  variants: [
    {
      id: 42581543878756,
      title: "Black",
      option1: "Black",
      option2: null,
      option3: null,
      sku: "",
      requires_shipping: true,
      taxable: true,
      featured_image: {
        id: 31924853047396,
        product_id: 7352159535204,
        position: 9,
        created_at: "2023-12-15T14:09:46-05:00",
        updated_at: "2023-12-15T14:09:46-05:00",
        alt: "black vented garage floor tile",
        width: 2240,
        height: 2240,
        src: "//floor-mat-app.myshopify.com/cdn/shop/products/blackventedgaragefloortile.png?v=1702667386",
        variant_ids: [42581543878756],
      },
      available: true,
      name: "Vented Garage Floor Tiles - Per M2 - Black",
      public_title: "Black",
      options: ["Black"],
      price: 3540,
      weight: 0,
      compare_at_price: 0,
      inventory_management: "shopify",
      barcode: null,
      featured_media: {
        alt: "black vented garage floor tile",
        id: 24226666643556,
        position: 9,
        preview_image: {
          aspect_ratio: 1,
          height: 2240,
          width: 2240,
          src: "//floor-mat-app.myshopify.com/cdn/shop/products/blackventedgaragefloortile.png?v=1702667386",
        },
      },
      quantity_rule: {
        min: 1,
        max: null,
        increment: 1,
      },
    },
    {
      id: 42581543911524,
      title: "Light Grey",
      option1: "Light Grey",
      option2: null,
      option3: null,
      sku: "",
      requires_shipping: true,
      taxable: true,
      featured_image: {
        id: 31924853080164,
        product_id: 7352159535204,
        position: 10,
        created_at: "2023-12-15T14:09:46-05:00",
        updated_at: "2023-12-15T14:09:46-05:00",
        alt: "light grey vented garage floor tile",
        width: 2240,
        height: 2240,
        src: "//floor-mat-app.myshopify.com/cdn/shop/products/lightgreyventedgaragefloortile.png?v=1702667386",
        variant_ids: [42581543911524],
      },
      available: true,
      name: "Vented Garage Floor Tiles - Per M2 - Light Grey",
      public_title: "Light Grey",
      options: ["Light Grey"],
      price: 3540,
      weight: 0,
      compare_at_price: 0,
      inventory_management: "shopify",
      barcode: null,
      featured_media: {
        alt: "light grey vented garage floor tile",
        id: 24226666676324,
        position: 10,
        preview_image: {
          aspect_ratio: 1,
          height: 2240,
          width: 2240,
          src: "//floor-mat-app.myshopify.com/cdn/shop/products/lightgreyventedgaragefloortile.png?v=1702667386",
        },
      },
      quantity_rule: {
        min: 1,
        max: null,
        increment: 1,
      },
    },
    {
      id: 42581543944292,
      title: "Red",
      option1: "Red",
      option2: null,
      option3: null,
      sku: "",
      requires_shipping: true,
      taxable: true,
      featured_image: {
        id: 31924853145700,
        product_id: 7352159535204,
        position: 12,
        created_at: "2023-12-15T14:09:46-05:00",
        updated_at: "2023-12-15T14:09:46-05:00",
        alt: "red vented garage floor tile",
        width: 2240,
        height: 2240,
        src: "//floor-mat-app.myshopify.com/cdn/shop/products/redventedgaragefloortile.png?v=1702667386",
        variant_ids: [42581543944292],
      },
      available: true,
      name: "Vented Garage Floor Tiles - Per M2 - Red",
      public_title: "Red",
      options: ["Red"],
      price: 3540,
      weight: 0,
      compare_at_price: 0,
      inventory_management: "shopify",
      barcode: null,
      featured_media: {
        alt: "red vented garage floor tile",
        id: 24226666741860,
        position: 12,
        preview_image: {
          aspect_ratio: 1,
          height: 2240,
          width: 2240,
          src: "//floor-mat-app.myshopify.com/cdn/shop/products/redventedgaragefloortile.png?v=1702667386",
        },
      },
      quantity_rule: {
        min: 1,
        max: null,
        increment: 1,
      },
    },
    {
      id: 42581543977060,
      title: "Blue",
      option1: "Blue",
      option2: null,
      option3: null,
      sku: "",
      requires_shipping: true,
      taxable: true,
      featured_image: {
        id: 31924853112932,
        product_id: 7352159535204,
        position: 11,
        created_at: "2023-12-15T14:09:46-05:00",
        updated_at: "2023-12-15T14:09:46-05:00",
        alt: "blue vented garage floor tile",
        width: 2240,
        height: 2240,
        src: "//floor-mat-app.myshopify.com/cdn/shop/products/blueventedgaragefloortile.png?v=1702667386",
        variant_ids: [42581543977060],
      },
      available: true,
      name: "Vented Garage Floor Tiles - Per M2 - Blue",
      public_title: "Blue",
      options: ["Blue"],
      price: 3540,
      weight: 0,
      compare_at_price: 0,
      inventory_management: "shopify",
      barcode: null,
      featured_media: {
        alt: "blue vented garage floor tile",
        id: 24226666709092,
        position: 11,
        preview_image: {
          aspect_ratio: 1,
          height: 2240,
          width: 2240,
          src: "//floor-mat-app.myshopify.com/cdn/shop/products/blueventedgaragefloortile.png?v=1702667386",
        },
      },
      quantity_rule: {
        min: 1,
        max: null,
        increment: 1,
      },
    },
    {
      id: 42581544009828,
      title: "Green",
      option1: "Green",
      option2: null,
      option3: null,
      sku: "",
      requires_shipping: true,
      taxable: true,
      featured_image: {
        id: 31924853178468,
        product_id: 7352159535204,
        position: 13,
        created_at: "2023-12-15T14:09:46-05:00",
        updated_at: "2023-12-15T14:09:46-05:00",
        alt: "green vented garage floor tile",
        width: 2240,
        height: 2240,
        src: "//floor-mat-app.myshopify.com/cdn/shop/products/greenventedgaragefloortile.png?v=1702667386",
        variant_ids: [42581544009828],
      },
      available: true,
      name: "Vented Garage Floor Tiles - Per M2 - Green",
      public_title: "Green",
      options: ["Green"],
      price: 3540,
      weight: 0,
      compare_at_price: 0,
      inventory_management: "shopify",
      barcode: null,
      featured_media: {
        alt: "green vented garage floor tile",
        id: 24226666774628,
        position: 13,
        preview_image: {
          aspect_ratio: 1,
          height: 2240,
          width: 2240,
          src: "//floor-mat-app.myshopify.com/cdn/shop/products/greenventedgaragefloortile.png?v=1702667386",
        },
      },
      quantity_rule: {
        min: 1,
        max: null,
        increment: 1,
      },
    },
    {
      id: 42581544042596,
      title: "Yellow",
      option1: "Yellow",
      option2: null,
      option3: null,
      sku: "",
      requires_shipping: true,
      taxable: true,
      featured_image: {
        id: 31924853211236,
        product_id: 7352159535204,
        position: 14,
        created_at: "2023-12-15T14:09:46-05:00",
        updated_at: "2023-12-15T14:09:46-05:00",
        alt: "yellow vented garage floor tile",
        width: 2240,
        height: 2240,
        src: "//floor-mat-app.myshopify.com/cdn/shop/products/yellowventedgaragefloortile.png?v=1702667386",
        variant_ids: [42581544042596],
      },
      available: true,
      name: "Vented Garage Floor Tiles - Per M2 - Yellow",
      public_title: "Yellow",
      options: ["Yellow"],
      price: 3540,
      weight: 0,
      compare_at_price: 0,
      inventory_management: "shopify",
      barcode: null,
      featured_media: {
        alt: "yellow vented garage floor tile",
        id: 24226666807396,
        position: 14,
        preview_image: {
          aspect_ratio: 1,
          height: 2240,
          width: 2240,
          src: "//floor-mat-app.myshopify.com/cdn/shop/products/yellowventedgaragefloortile.png?v=1702667386",
        },
      },
      quantity_rule: {
        min: 1,
        max: null,
        increment: 1,
      },
    },
    {
      id: 42581544075364,
      title: "White",
      option1: "White",
      option2: null,
      option3: null,
      sku: "",
      requires_shipping: true,
      taxable: true,
      featured_image: {
        id: 31924853375076,
        product_id: 7352159535204,
        position: 19,
        created_at: "2023-12-15T14:09:46-05:00",
        updated_at: "2023-12-15T14:09:46-05:00",
        alt: "white vented garage floor tile",
        width: 2240,
        height: 2240,
        src: "//floor-mat-app.myshopify.com/cdn/shop/products/whiteventedgaragefloortile.png?v=1702667386",
        variant_ids: [42581544075364],
      },
      available: true,
      name: "Vented Garage Floor Tiles - Per M2 - White",
      public_title: "White",
      options: ["White"],
      price: 3540,
      weight: 0,
      compare_at_price: 0,
      inventory_management: "shopify",
      barcode: null,
      featured_media: {
        alt: "white vented garage floor tile",
        id: 24226666971236,
        position: 19,
        preview_image: {
          aspect_ratio: 1,
          height: 2240,
          width: 2240,
          src: "//floor-mat-app.myshopify.com/cdn/shop/products/whiteventedgaragefloortile.png?v=1702667386",
        },
      },
      quantity_rule: {
        min: 1,
        max: null,
        increment: 1,
      },
    },
    {
      id: 42581544108132,
      title: "Orange",
      option1: "Orange",
      option2: null,
      option3: null,
      sku: "",
      requires_shipping: true,
      taxable: true,
      featured_image: {
        id: 31924853244004,
        product_id: 7352159535204,
        position: 15,
        created_at: "2023-12-15T14:09:46-05:00",
        updated_at: "2023-12-15T14:09:46-05:00",
        alt: "orange vented garage floor tile",
        width: 2240,
        height: 2240,
        src: "//floor-mat-app.myshopify.com/cdn/shop/products/orangeventedgaragefloortile.png?v=1702667386",
        variant_ids: [42581544108132],
      },
      available: true,
      name: "Vented Garage Floor Tiles - Per M2 - Orange",
      public_title: "Orange",
      options: ["Orange"],
      price: 3540,
      weight: 0,
      compare_at_price: 0,
      inventory_management: "shopify",
      barcode: null,
      featured_media: {
        alt: "orange vented garage floor tile",
        id: 24226666840164,
        position: 15,
        preview_image: {
          aspect_ratio: 1,
          height: 2240,
          width: 2240,
          src: "//floor-mat-app.myshopify.com/cdn/shop/products/orangeventedgaragefloortile.png?v=1702667386",
        },
      },
      quantity_rule: {
        min: 1,
        max: null,
        increment: 1,
      },
    },
    {
      id: 42581544140900,
      title: "Dark Grey",
      option1: "Dark Grey",
      option2: null,
      option3: null,
      sku: "",
      requires_shipping: true,
      taxable: true,
      featured_image: {
        id: 31924853309540,
        product_id: 7352159535204,
        position: 17,
        created_at: "2023-12-15T14:09:46-05:00",
        updated_at: "2023-12-15T14:09:46-05:00",
        alt: "dark grey vented garage floor tile",
        width: 2240,
        height: 2240,
        src: "//floor-mat-app.myshopify.com/cdn/shop/products/darkgreyventedgaragefloortile.png?v=1702667386",
        variant_ids: [42581544140900],
      },
      available: true,
      name: "Vented Garage Floor Tiles - Per M2 - Dark Grey",
      public_title: "Dark Grey",
      options: ["Dark Grey"],
      price: 3540,
      weight: 0,
      compare_at_price: 0,
      inventory_management: "shopify",
      barcode: null,
      featured_media: {
        alt: "dark grey vented garage floor tile",
        id: 24226666905700,
        position: 17,
        preview_image: {
          aspect_ratio: 1,
          height: 2240,
          width: 2240,
          src: "//floor-mat-app.myshopify.com/cdn/shop/products/darkgreyventedgaragefloortile.png?v=1702667386",
        },
      },
      quantity_rule: {
        min: 1,
        max: null,
        increment: 1,
      },
    },
    {
      id: 42581544173668,
      title: "Turquoise",
      option1: "Turquoise",
      option2: null,
      option3: null,
      sku: "",
      requires_shipping: true,
      taxable: true,
      featured_image: {
        id: 31924853276772,
        product_id: 7352159535204,
        position: 16,
        created_at: "2023-12-15T14:09:46-05:00",
        updated_at: "2023-12-15T14:09:46-05:00",
        alt: "turquoise vented garage floor tile",
        width: 2240,
        height: 2240,
        src: "//floor-mat-app.myshopify.com/cdn/shop/products/turquoiseventedgaragefloortile.png?v=1702667386",
        variant_ids: [42581544173668],
      },
      available: true,
      name: "Vented Garage Floor Tiles - Per M2 - Turquoise",
      public_title: "Turquoise",
      options: ["Turquoise"],
      price: 3540,
      weight: 0,
      compare_at_price: 0,
      inventory_management: "shopify",
      barcode: null,
      featured_media: {
        alt: "turquoise vented garage floor tile",
        id: 24226666872932,
        position: 16,
        preview_image: {
          aspect_ratio: 1,
          height: 2240,
          width: 2240,
          src: "//floor-mat-app.myshopify.com/cdn/shop/products/turquoiseventedgaragefloortile.png?v=1702667386",
        },
      },
      quantity_rule: {
        min: 1,
        max: null,
        increment: 1,
      },
    },
    {
      id: 42581544206436,
      title: "Pink",
      option1: "Pink",
      option2: null,
      option3: null,
      sku: "",
      requires_shipping: true,
      taxable: true,
      featured_image: {
        id: 31924853342308,
        product_id: 7352159535204,
        position: 18,
        created_at: "2023-12-15T14:09:46-05:00",
        updated_at: "2023-12-15T14:09:46-05:00",
        alt: "pink vented garage floor tile",
        width: 2240,
        height: 2240,
        src: "//floor-mat-app.myshopify.com/cdn/shop/products/pinkventedgaragefloortile.png?v=1702667386",
        variant_ids: [42581544206436],
      },
      available: true,
      name: "Vented Garage Floor Tiles - Per M2 - Pink",
      public_title: "Pink",
      options: ["Pink"],
      price: 3540,
      weight: 0,
      compare_at_price: 0,
      inventory_management: "shopify",
      barcode: null,
      featured_media: {
        alt: "pink vented garage floor tile",
        id: 24226666938468,
        position: 18,
        preview_image: {
          aspect_ratio: 1,
          height: 2240,
          width: 2240,
          src: "//floor-mat-app.myshopify.com/cdn/shop/products/pinkventedgaragefloortile.png?v=1702667386",
        },
      },
      quantity_rule: {
        min: 1,
        max: null,
        increment: 1,
      },
    },
    {
      id: 42581544239204,
      title: "Fluorescent Yellow",
      option1: "Fluorescent Yellow",
      option2: null,
      option3: null,
      sku: "",
      requires_shipping: true,
      taxable: true,
      featured_image: {
        id: 31924853407844,
        product_id: 7352159535204,
        position: 20,
        created_at: "2023-12-15T14:09:46-05:00",
        updated_at: "2023-12-15T14:09:46-05:00",
        alt: null,
        width: 2240,
        height: 2240,
        src: "//floor-mat-app.myshopify.com/cdn/shop/products/FluorescentYellowgaragefloortile.png?v=1702667386",
        variant_ids: [42581544239204],
      },
      available: true,
      name: "Vented Garage Floor Tiles - Per M2 - Fluorescent Yellow",
      public_title: "Fluorescent Yellow",
      options: ["Fluorescent Yellow"],
      price: 3540,
      weight: 0,
      compare_at_price: 0,
      inventory_management: "shopify",
      barcode: "",
      featured_media: {
        alt: null,
        id: 24226667135076,
        position: 20,
        preview_image: {
          aspect_ratio: 1,
          height: 2240,
          width: 2240,
          src: "//floor-mat-app.myshopify.com/cdn/shop/products/FluorescentYellowgaragefloortile.png?v=1702667386",
        },
      },
      quantity_rule: {
        min: 1,
        max: null,
        increment: 1,
      },
    },
    {
      id: 42581544271972,
      title: "Dark Blue",
      option1: "Dark Blue",
      option2: null,
      option3: null,
      sku: "",
      requires_shipping: true,
      taxable: true,
      featured_image: {
        id: 31924853440612,
        product_id: 7352159535204,
        position: 21,
        created_at: "2023-12-15T14:09:46-05:00",
        updated_at: "2023-12-15T14:09:46-05:00",
        alt: null,
        width: 2240,
        height: 2240,
        src: "//floor-mat-app.myshopify.com/cdn/shop/products/darkblueventedgaragefloortile.png?v=1702667386",
        variant_ids: [42581544271972],
      },
      available: true,
      name: "Vented Garage Floor Tiles - Per M2 - Dark Blue",
      public_title: "Dark Blue",
      options: ["Dark Blue"],
      price: 3540,
      weight: 0,
      compare_at_price: 0,
      inventory_management: "shopify",
      barcode: "",
      featured_media: {
        alt: null,
        id: 24226667167844,
        position: 21,
        preview_image: {
          aspect_ratio: 1,
          height: 2240,
          width: 2240,
          src: "//floor-mat-app.myshopify.com/cdn/shop/products/darkblueventedgaragefloortile.png?v=1702667386",
        },
      },
      quantity_rule: {
        min: 1,
        max: null,
        increment: 1,
      },
    },
    {
      id: 42581544304740,
      title: "Gold",
      option1: "Gold",
      option2: null,
      option3: null,
      sku: "",
      requires_shipping: true,
      taxable: true,
      featured_image: {
        id: 31924853473380,
        product_id: 7352159535204,
        position: 22,
        created_at: "2023-12-15T14:09:46-05:00",
        updated_at: "2023-12-15T14:09:46-05:00",
        alt: null,
        width: 2240,
        height: 2240,
        src: "//floor-mat-app.myshopify.com/cdn/shop/products/goldventedgaragefloortilecopy.png?v=1702667386",
        variant_ids: [42581544304740],
      },
      available: true,
      name: "Vented Garage Floor Tiles - Per M2 - Gold",
      public_title: "Gold",
      options: ["Gold"],
      price: 3540,
      weight: 0,
      compare_at_price: 0,
      inventory_management: "shopify",
      barcode: "",
      featured_media: {
        alt: null,
        id: 24226667200612,
        position: 22,
        preview_image: {
          aspect_ratio: 1,
          height: 2240,
          width: 2240,
          src: "//floor-mat-app.myshopify.com/cdn/shop/products/goldventedgaragefloortilecopy.png?v=1702667386",
        },
      },
      quantity_rule: {
        min: 1,
        max: null,
        increment: 1,
      },
    },
    {
      id: 42581544337508,
      title: "Purple",
      option1: "Purple",
      option2: null,
      option3: null,
      sku: "",
      requires_shipping: true,
      taxable: true,
      featured_image: {
        id: 31924853506148,
        product_id: 7352159535204,
        position: 23,
        created_at: "2023-12-15T14:09:46-05:00",
        updated_at: "2023-12-15T14:09:46-05:00",
        alt: null,
        width: 2240,
        height: 2240,
        src: "//floor-mat-app.myshopify.com/cdn/shop/products/purpleventedgaragefloortilecopy.png?v=1702667386",
        variant_ids: [42581544337508],
      },
      available: true,
      name: "Vented Garage Floor Tiles - Per M2 - Purple",
      public_title: "Purple",
      options: ["Purple"],
      price: 3540,
      weight: 0,
      compare_at_price: 0,
      inventory_management: "shopify",
      barcode: "",
      featured_media: {
        alt: null,
        id: 24226667233380,
        position: 23,
        preview_image: {
          aspect_ratio: 1,
          height: 2240,
          width: 2240,
          src: "//floor-mat-app.myshopify.com/cdn/shop/products/purpleventedgaragefloortilecopy.png?v=1702667386",
        },
      },
      quantity_rule: {
        min: 1,
        max: null,
        increment: 1,
      },
    },
  ],
};
export default Viewer2;
