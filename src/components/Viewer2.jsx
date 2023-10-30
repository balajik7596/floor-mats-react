/* eslint-disable react/prop-types */
import React, { PureComponent } from "react";

import Engine from "../core/Engine";
import ImageListMenu from "./imageList";
import Sidebar from "./Sidebar";
import Footer from "./Footer";
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
      currentBack: "Loft Office",
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
  }
  componentDidMount() {
    // this.initCanvas("IMPERIAL");
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
      this.engine.initEngine();
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
    // Your function logic here
    this.engine.updateFloorMaterial(imgsrc);
    console.log(imgsrc);
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
    } = this.state;
    const containerStyle = {
      position: "absolute",
      top: 0,
      left: 0,
    };
    return (
      <>
        {/* {!loaded && (
          <div className=" w-full h-full overflow-hidden items-center place-content-center flex justify-center absolute z-50 bg-sky-300">
            <div className=" content-center text-center flex flex-col justify-center relative w-full">
              <div className="flex flex-col justify-center items-center w-1/4 relative left-1/3">
                <img className=" relative" src={logopng}></img>
                <img className=" relative" src={loadergif}></img>
                <p className="text-lg w-full -top-20 relative">
                  {t("loading")}
                </p>
              </div>

              <div className="w-full "></div>
            </div>
          </div>
        )} */}

        <div className="flex-col flex font-sans  bg-[#fffdfd] font-[Open_Sans] ">
          <div
            className=" w-full h-full relative"
            id={this.props?.CanvasID}
            style={{
              width: "100%",
              height: menuOpen ? "60vh" : "100vh",
            }}
            // onMouseMove={(e) => this.engine.mouseMove(e)}
            onMouseDown={(e) => this.engine.onClick(e)}
            onMouseUp={(e) => this.engine.mouseUp(e)}
            onContextMenu={(e) => this.OnContextMenu(e)}
          >
            <div style={containerStyle} className="menu-container">
              <ImageListMenu onImageClick={this.handleImageClick} />
            </div>
          </div>
        </div>
      </>
    );
  }
}

export default Viewer2;
