/* eslint-disable react/prop-types */
import React, { PureComponent } from "react";

import Engine from "../core/Engine";
import ImageListMenu from "./imageList";
import PatternImageListMenu from "./patternImageList";
import ColorButton from "./colorList";
import Sidebar from "./Sidebar";
import Footer from "./Footer";
import ToggleButton from "./togglebutton";
import { IconButton, Menu, MenuItem } from "@mui/material";
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
const footerTitle = [
  "Floor Shapes",
  "Dimensions",
  "Select Tile And Color",
  "Pattern",
  "",
];
let SidebarRef = React.createRef();
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
      loadergif: "",
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
    this.initCanvas();
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
    // if (pattern === "Box") return;
    this.engine.updateFloorPattern({ pattern: pattern });
  };
  handleButtonClick = (index) => {
    if (this.state.showImageBoxes) return;
    this.setState({ selectedButtonIndex: index });

    console.log("Button clicked:", index);
  };
  handleColorClick(selectedColor) {
    this.engine.updateFloorColor(selectedColor);
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
      loadergif,
      logopng,
      backgroundPlaces,
      currentBack,
      selectedButtonIndex,
    } = this.state;
    const containerStyle = {
      position: "absolute",
      top: 0,
      left: 0,
    };
    const imageList = [
      {
        src: "../assets/newlayout.svg",
        label: "Rubber dotted",
      },
      {
        src: "../assets/customise.svg",
        label: "Diamond pattern",
      },
      {
        src: "../assets/choosetile.svg",
        label: "Vented mat",
      },
      {
        src: "../assets/choosepattern.svg",
        label: "Raised disc mat",
      },
      {
        src: "../assets/home.svg",
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
        <div className="flex-col flex font-sans  bg-[#fffdfd] font-[Open_Sans] ">
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
              {!this.state.showImageBoxes &&
                (this.state.selectedButtonIndex == 2 ||
                  this.state.selectedButtonIndex == 3) && (
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
                    <div
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
                  onClick={() =>
                    this.setState({
                      selectedButtonIndex: this.state.selectedButtonIndex - 1,
                    })
                  }
                >
                  {`<< Back`}{" "}
                </button>
              ) : (
                <button
                  className="bg-[#C11D37] h-16 px-2 text-white hover:bg-[#cf4b4b]"
                  onClick={() =>
                    this.setState({
                      selectedButtonIndex: this.state.selectedButtonIndex + 1,
                    })
                  }
                >
                  {`Next >>`}{" "}
                </button>
              )}
            </div>
          </div>
          {this.state.showImageBoxes && (
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                display: "flex",
                alignItems: "center",
              }}
            >
              <div
                style={{ width: "150px", height: "150px", marginRight: "10px" }}
              >
                <img
                  src="../assets/sq-layout.png"
                  alt="Square Image 1"
                  onClick={() => {
                    this.setState({
                      showImageBoxes: !this.state.showImageBoxes,
                      isCustomLayout: false,
                      selectedButtonIndex: 1,
                    });
                    this.engine.InitLayout(false);
                  }}
                />
              </div>
              <div style={{ width: "150px", height: "150px" }}>
                <img
                  src="../assets/custom-layout.png"
                  alt="Square Image 2"
                  onClick={() => {
                    this.setState({
                      showImageBoxes: !this.state.showImageBoxes,
                      isCustomLayout: true,
                    });
                    this.engine.InitLayout(true);
                  }}
                />
              </div>
            </div>
          )}
        </div>
        {!this.state.showImageBoxes && this.state.selectedButtonIndex === 3 && (
          <div
            style={{
              position: "absolute",
              top: "10%",
              left: "50%",
              transform: "translate(-50%, 0)",
              display: "flex",
              alignItems: "center",
            }}
          >
            <PatternImageListMenu onImageClick={this.handlePatternImageClick} />
          </div>
        )}
        {/* {!this.state.showImageBoxes && ( */}
        <>
          {this.state.selectedButtonIndex === 2 && (
            <ToggleButton
              leftText="Vented Tiles"
              rightText="Smooth PVC"
              onToggle={(toggled) => this.engine.changeSelectedTile(toggled)}
            />
          )}
          {this.state.selectedButtonIndex === 1 && (
            <ToggleButton
              leftText="Feet"
              rightText="Meter"
              onToggle={(toggled) => this.engine.changeMeasureUnit(toggled)}
            />
          )}

          <Footer title={footerTitle[this.state.selectedButtonIndex]} />
        </>
        {/* )} */}
      </>
    );
  }
}

export default Viewer2;
