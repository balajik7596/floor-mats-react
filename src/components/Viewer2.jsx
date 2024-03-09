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
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  FormHelperText,
  IconButton,
  InputAdornment,
  InputLabel,
  Menu,
  MenuItem,
  OutlinedInput,
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
  "Light Grey": "lightgray",
  "Dark Grey": "darkgray",
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
  Graphite: "#41424c",
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
      showEntryPage: false,
      tileType: "Vented mat",
      width: 10,
      height: 10,
      bottomwidth: 1,
      bottomheight: 1,
      garageData: props.data ? props.data : defaultData,
      currentProduct: props.data ? props.data.product1 : defaultData.product1,
      confrimPopup: false,
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
    this.UpdateLayout = this.UpdateLayout.bind(this);
    this.SidebarRef = React.createRef();
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
      this.engine = new Engine(
        this.props.CanvasID,
        this.props.filePath,
        this.props.data ? this.props.data.product1.id : defaultData.product1.id
      );
      this.setState({ loadergif: this.props.filePath + "image/loader.gif" });
      this.setState({ logopng: this.props.filePath + "image/logo.png" });
      // this.engine.initEngine();
      this.engine.onUpdateChange = this.UpdateStyle;
      this.engine.loadingComplete = this.LoadingCompleted;
      this.engine.onUpdateLayout = this.UpdateLayout;
      this.engine.PostForm = this.PostForm;
      this.SidebarRef.current.UpdateLayoutType(false);
    }

    return this.engine;
  }
  UpdateLayout() {
    if (this.engine) {
      this.SidebarRef.current?.UpdateLayout();
    }
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
  handleImageClick = (imgsrc, type) => {
    this.setState({ tileType: type });
    let prod = null;
    let primary,
      secondary = null;
    if (type === "Vented mat") {
      prod = this.state.garageData.product1;
      primary = prod.variants[1];
      secondary = prod.variants[1];
    } else {
      prod = this.state.garageData.product2;
      primary = prod.variants[0];
      secondary = prod.variants[2];
    }

    this.setState({ currentProduct: prod });
    this.engine.updateFloorMaterial(imgsrc, prod.id);
    this.SidebarRef.current.updateVariant(primary, secondary);
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
    this.engine.DraggingEnable(index !== 2);

    console.log("Button clicked:", index);
  };
  handleColorClick(selectedColor, variant) {
    this.engine.updateFloorColor(
      selectedColor,
      this.state.patternColor,
      variant
    );
  }
  async checkoutItem() {
    let squareFeet = this.engine.floorLength * this.engine.floorWidth;

    if (this.engine.isCustomLayout) {
      squareFeet +=
        this.engine.floorbottomHeight * this.engine.floorbottomWidth;
    }
    let meterval = squareFeet;
    meterval = Math.round(meterval);
    console.log(meterval, this.engine.selectedVariant.id);
    {
      //SecondaryVariant

      if (
        this.engine.selectedPattern === "Checked" ||
        this.engine.selectedPattern === "Box"
      ) {
        let primaryCount = Math.floor(meterval / 2);
        let secondaryCount = meterval - primaryCount;
        if (this.engine.selectedPattern === "Box") {
          secondaryCount = Math.floor(meterval / 4);
          primaryCount = meterval - secondaryCount;
        }
        let formData = {
          quantity: primaryCount,
          Color: this.engine.PrimaryVariant.title,
          form_type: "product",
          id: this.engine.PrimaryVariant.id.toString(),
          "product-id": "7352159535204",
        };
        await window.addToCartConfigurator(formData, false);
        let formDataSceondary = {
          quantity: secondaryCount,
          Color: this.engine.SecondaryVariant.title,
          form_type: "product",
          id: this.engine.SecondaryVariant.id.toString(),
          "product-id": "7352159535204",
        };
        await window.addToCartConfigurator(formDataSceondary, true);
      } else {
        let formData = {
          quantity: meterval,
          Color: this.engine.PrimaryVariant.title,
          form_type: "product",
          id: this.engine.PrimaryVariant.id.toString(),
          "product-id": "7352159535204",
        };
        await window.addToCartConfigurator(formData, true);
      }
      window.location.href = "/cart";
      // document.getElementById("quantity").value = meterval;
      // document.getElementsByName("id")[0].value =
      //   this.engine.selectedVariant.id.toString();
      // setTimeout(() => {
      //   document.querySelector("[data-add-to-cart]").click();
      // }, 1000);
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
      isCustomLayout,
      tileType,
      currentProduct,
      height,
      width,
      bottomwidth,
      bottomheight,
      confrimPopup,
    } = this.state;
    const containerStyle = {
      position: "absolute",
      top: 0,
      left: 0,
    };

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
        <Dialog
          open={confrimPopup}
          onClose={() => this.setState({ confrimPopup: false })}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle id="alert-dialog-title">
            {"Do You about to leave this configuration"}
          </DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-description">
              Are you sure you want to leave this page?
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={(e) => {
                e.preventDefault();
                this.setState({ confrimPopup: false });
              }}
            >
              Cancel
            </Button>

            <Button
              onClick={(e) => {
                e.preventDefault();
                this.setState({ confrimPopup: false });
                document.getElementById("root2").style.visibility = "hidden";
                // document.body.style.overflow = "auto";
                if (window.closeConfigurator) window.closeConfigurator();
                console.log("close");
              }}
              autoFocus
            >
              Ok
            </Button>
          </DialogActions>
        </Dialog>
        <div className="fixed w-screen h-screen  z-50 top-0 left-0 bg-white">
          <div className="flex-col flex font-sans  bg-[#fffdfd] font-[Open_Sans] ">
            <div className="absolute z-[100] right-4 top-6 max-sm:top-1">
              <button
                className=""
                onClick={(e) => {
                  e.preventDefault();
                  this.setState({ confrimPopup: true });

                  // document
                  //   .getElementById("root2")
                  //   .parentNode.removeChild(document.getElementById("root2"));
                }}
              >
                <CloseIcon sx={{ fontSize: "40px", color: "#ff0029" }} />{" "}
              </button>{" "}
            </div>

            <div className="flex flex-row max-sm:flex-col">
              <Sidebar
                handleImageClick={(val, type) =>
                  this.handleImageClick(val, type)
                }
                garageData={garageData}
                initCanvas={() => this.initCanvas()}
                ref={this.SidebarRef}
                engine={() => this.engine}
                currentProduct={currentProduct}
                colorList={colorList}
              />
              <div className="flex flex-col w-full">
                <div className="absolute z-50 w-full left-[5%] flex justify-center top-4 max-sm:top-14">
                  {" "}
                  <ToggleButton
                    leftText="Meter"
                    rightText="Feet"
                    onToggle={(toggled) =>
                      this.engine.changeMeasureUnit(toggled)
                    }
                  />
                </div>
                <div
                  className=" w-full  relative h-[88vh] max-sm:h-[70vh]"
                  id={this.props?.CanvasID}
                  style={{
                    width: "100%",
                    // height: "88vh",
                  }}
                  // onMouseMove={(e) => this.engine.mouseMove(e)}
                  onMouseDown={(e) => this.engine.onClick(e)}
                  // onMouseUp={(e) => this.engine.mouseUp(e)}
                  onContextMenu={(e) => this.OnContextMenu(e)}
                ></div>

                <Footer
                  checkoutItem={() => this.checkoutItem()}
                  title={footerTitle[this.state.selectedButtonIndex]}
                  isLast={this.state.selectedButtonIndex === 3}
                  tileType={tileType}
                />
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }
}
let defaultData = {
  product1: {
    id: 7352159535204,
    title: "Vented Garage Floor Tiles - Per M2",
    handle: "vented-garage-floor-tile",
    description:
      '<meta charset="UTF-8"><meta charset="utf-8">\n<p><strong><em>Price Per Metre² = 6.25 tiles</em></strong></p>\n<p><em>Ideal for garages and workshops our vented tiles offer a great new look to your premises and are very popular in garages, detailing centres, and vehicle workshops.</em></p>\n<p><em>When it comes to vented floor tiles Garage Style are the market leaders providing the best quality vented tile system on the market with unique interlocking joint system and premium finish.</em></p>\n<p><em>With 15 colour options our team can help to come up with a unique colour scheme to turn your floor space into a showroom to be proud of!&nbsp;<br></em></p>\n<p><em>Our tiles are capable of withstanding even the harshest environments including high vehicle traffic areas. Not to be confused with the cheap imitations that crush over time. We pride ourselves in 5 star products and 5 star service just check out our reviews!&nbsp;</em></p>\n<p><em>Each tile is 400mm x 400mm x 18mm and there is 6.25 tiles per m2<br><br>Ramp sections also available under the ramps &amp; accessories category &nbsp;</em></p>\n<p><em>Fast UK delivery and full installation service by our professional installation team also available nationwide.&nbsp;</em></p>\n<p><em>Please call our office on 01707 229800 for any advice or installation pricing.&nbsp;</em></p>\n<h4><span>KEY BENEFITS</span></h4>\n<ul>\n<li><span>10 Year Manufacturers&nbsp;Warranty</span></li>\n<li><span>Industry Best Interlocking Joint&nbsp;System</span></li>\n<li><span>Simple click&nbsp;and use installation</span></li>\n<li><span>25+ years anticipated lifespan</span></li>\n<li><span>Smart modern appearance</span></li>\n<li><span>Chemically resistant</span></li>\n<li><span>Anti-Slip</span></li>\n<li><span>Reduces dust and noise</span></li>\n<li>\n<span>Exceptional d</span>urability</li>\n<li><span>Warm – insulates the floor from cold and damp</span></li>\n<li><span>Reduces fatigue</span></li>\n<li><span>Lower life cycle cost</span></li>\n<li><span>Move and re-use</span></li>\n<li><span>Custom Colours &amp; Logos&nbsp;</span></li>\n</ul>',
    published_at: "2023-12-15T14:08:08-05:00",
    created_at: "2023-12-15T14:09:46-05:00",
    vendor: "Garage Style | Garage Floor TIles",
    type: "",
    tags: ["detailing tiles", "vented tiles"],
    price: 3540,
    price_min: 3540,
    price_max: 3540,
    available: true,
    price_varies: false,
    compare_at_price: 0,
    compare_at_price_min: 0,
    compare_at_price_max: 0,
    compare_at_price_varies: false,
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
    images: [
      "//floor-mat-app.myshopify.com/cdn/shop/products/VentedGarageFloorTile.jpg?v=1702667386",
      "//floor-mat-app.myshopify.com/cdn/shop/products/darkgreyventedgaragefloortileforcardetailingbay.png?v=1702667386",
      "//floor-mat-app.myshopify.com/cdn/shop/products/greenventedgaragefloortileforcardetailingbay.png?v=1702667386",
      "//floor-mat-app.myshopify.com/cdn/shop/products/greyventedgaragefloortileforcardetailingbay.jpg?v=1702667386",
      "//floor-mat-app.myshopify.com/cdn/shop/products/pinkventedgaragefloortileforcardetailingbay.png?v=1702667386",
      "//floor-mat-app.myshopify.com/cdn/shop/products/redventedgaragefloortileforcardetailingbay.png?v=1702667386",
      "//floor-mat-app.myshopify.com/cdn/shop/products/VentedGarageFloorTile2.jpg?v=1702667386",
      "//floor-mat-app.myshopify.com/cdn/shop/products/VentedGarageFloorTileBox.png?v=1702667386",
      "//floor-mat-app.myshopify.com/cdn/shop/products/blackventedgaragefloortile.png?v=1702667386",
      "//floor-mat-app.myshopify.com/cdn/shop/products/lightgreyventedgaragefloortile.png?v=1702667386",
      "//floor-mat-app.myshopify.com/cdn/shop/products/blueventedgaragefloortile.png?v=1702667386",
      "//floor-mat-app.myshopify.com/cdn/shop/products/redventedgaragefloortile.png?v=1702667386",
      "//floor-mat-app.myshopify.com/cdn/shop/products/greenventedgaragefloortile.png?v=1702667386",
      "//floor-mat-app.myshopify.com/cdn/shop/products/yellowventedgaragefloortile.png?v=1702667386",
      "//floor-mat-app.myshopify.com/cdn/shop/products/orangeventedgaragefloortile.png?v=1702667386",
      "//floor-mat-app.myshopify.com/cdn/shop/products/turquoiseventedgaragefloortile.png?v=1702667386",
      "//floor-mat-app.myshopify.com/cdn/shop/products/darkgreyventedgaragefloortile.png?v=1702667386",
      "//floor-mat-app.myshopify.com/cdn/shop/products/pinkventedgaragefloortile.png?v=1702667386",
      "//floor-mat-app.myshopify.com/cdn/shop/products/whiteventedgaragefloortile.png?v=1702667386",
      "//floor-mat-app.myshopify.com/cdn/shop/products/FluorescentYellowgaragefloortile.png?v=1702667386",
      "//floor-mat-app.myshopify.com/cdn/shop/products/darkblueventedgaragefloortile.png?v=1702667386",
      "//floor-mat-app.myshopify.com/cdn/shop/products/goldventedgaragefloortilecopy.png?v=1702667386",
      "//floor-mat-app.myshopify.com/cdn/shop/products/purpleventedgaragefloortilecopy.png?v=1702667386",
    ],
    featured_image:
      "//floor-mat-app.myshopify.com/cdn/shop/products/VentedGarageFloorTile.jpg?v=1702667386",
    options: ["Color"],
    media: [
      {
        alt: null,
        id: 24226667004004,
        position: 1,
        preview_image: {
          aspect_ratio: 1,
          height: 2240,
          width: 2240,
          src: "//floor-mat-app.myshopify.com/cdn/shop/products/VentedGarageFloorTile.jpg?v=1702667386",
        },
        aspect_ratio: 1,
        height: 2240,
        media_type: "image",
        src: "//floor-mat-app.myshopify.com/cdn/shop/products/VentedGarageFloorTile.jpg?v=1702667386",
        width: 2240,
      },
      {
        alt: null,
        id: 24226667036772,
        position: 2,
        preview_image: {
          aspect_ratio: 1,
          height: 768,
          width: 768,
          src: "//floor-mat-app.myshopify.com/cdn/shop/products/darkgreyventedgaragefloortileforcardetailingbay.png?v=1702667386",
        },
        aspect_ratio: 1,
        height: 768,
        media_type: "image",
        src: "//floor-mat-app.myshopify.com/cdn/shop/products/darkgreyventedgaragefloortileforcardetailingbay.png?v=1702667386",
        width: 768,
      },
      {
        alt: "vented garage floor tile for car detailing bay",
        id: 24226666512484,
        position: 3,
        preview_image: {
          aspect_ratio: 1,
          height: 768,
          width: 768,
          src: "//floor-mat-app.myshopify.com/cdn/shop/products/greenventedgaragefloortileforcardetailingbay.png?v=1702667386",
        },
        aspect_ratio: 1,
        height: 768,
        media_type: "image",
        src: "//floor-mat-app.myshopify.com/cdn/shop/products/greenventedgaragefloortileforcardetailingbay.png?v=1702667386",
        width: 768,
      },
      {
        alt: "vented garage floor tile for car detailing bay",
        id: 24226666545252,
        position: 4,
        preview_image: {
          aspect_ratio: 1.004,
          height: 1020,
          width: 1024,
          src: "//floor-mat-app.myshopify.com/cdn/shop/products/greyventedgaragefloortileforcardetailingbay.jpg?v=1702667386",
        },
        aspect_ratio: 1.004,
        height: 1020,
        media_type: "image",
        src: "//floor-mat-app.myshopify.com/cdn/shop/products/greyventedgaragefloortileforcardetailingbay.jpg?v=1702667386",
        width: 1024,
      },
      {
        alt: "vented garage floor tile for car detailing bay",
        id: 24226666578020,
        position: 5,
        preview_image: {
          aspect_ratio: 1,
          height: 768,
          width: 768,
          src: "//floor-mat-app.myshopify.com/cdn/shop/products/pinkventedgaragefloortileforcardetailingbay.png?v=1702667386",
        },
        aspect_ratio: 1,
        height: 768,
        media_type: "image",
        src: "//floor-mat-app.myshopify.com/cdn/shop/products/pinkventedgaragefloortileforcardetailingbay.png?v=1702667386",
        width: 768,
      },
      {
        alt: "vented garage floor tile for car detailing bay",
        id: 24226666610788,
        position: 6,
        preview_image: {
          aspect_ratio: 1,
          height: 768,
          width: 768,
          src: "//floor-mat-app.myshopify.com/cdn/shop/products/redventedgaragefloortileforcardetailingbay.png?v=1702667386",
        },
        aspect_ratio: 1,
        height: 768,
        media_type: "image",
        src: "//floor-mat-app.myshopify.com/cdn/shop/products/redventedgaragefloortileforcardetailingbay.png?v=1702667386",
        width: 768,
      },
      {
        alt: null,
        id: 24226667069540,
        position: 7,
        preview_image: {
          aspect_ratio: 1,
          height: 2240,
          width: 2240,
          src: "//floor-mat-app.myshopify.com/cdn/shop/products/VentedGarageFloorTile2.jpg?v=1702667386",
        },
        aspect_ratio: 1,
        height: 2240,
        media_type: "image",
        src: "//floor-mat-app.myshopify.com/cdn/shop/products/VentedGarageFloorTile2.jpg?v=1702667386",
        width: 2240,
      },
      {
        alt: null,
        id: 24226667102308,
        position: 8,
        preview_image: {
          aspect_ratio: 1,
          height: 2240,
          width: 2240,
          src: "//floor-mat-app.myshopify.com/cdn/shop/products/VentedGarageFloorTileBox.png?v=1702667386",
        },
        aspect_ratio: 1,
        height: 2240,
        media_type: "image",
        src: "//floor-mat-app.myshopify.com/cdn/shop/products/VentedGarageFloorTileBox.png?v=1702667386",
        width: 2240,
      },
      {
        alt: "black vented garage floor tile",
        id: 24226666643556,
        position: 9,
        preview_image: {
          aspect_ratio: 1,
          height: 2240,
          width: 2240,
          src: "//floor-mat-app.myshopify.com/cdn/shop/products/blackventedgaragefloortile.png?v=1702667386",
        },
        aspect_ratio: 1,
        height: 2240,
        media_type: "image",
        src: "//floor-mat-app.myshopify.com/cdn/shop/products/blackventedgaragefloortile.png?v=1702667386",
        width: 2240,
      },
      {
        alt: "light grey vented garage floor tile",
        id: 24226666676324,
        position: 10,
        preview_image: {
          aspect_ratio: 1,
          height: 2240,
          width: 2240,
          src: "//floor-mat-app.myshopify.com/cdn/shop/products/lightgreyventedgaragefloortile.png?v=1702667386",
        },
        aspect_ratio: 1,
        height: 2240,
        media_type: "image",
        src: "//floor-mat-app.myshopify.com/cdn/shop/products/lightgreyventedgaragefloortile.png?v=1702667386",
        width: 2240,
      },
      {
        alt: "blue vented garage floor tile",
        id: 24226666709092,
        position: 11,
        preview_image: {
          aspect_ratio: 1,
          height: 2240,
          width: 2240,
          src: "//floor-mat-app.myshopify.com/cdn/shop/products/blueventedgaragefloortile.png?v=1702667386",
        },
        aspect_ratio: 1,
        height: 2240,
        media_type: "image",
        src: "//floor-mat-app.myshopify.com/cdn/shop/products/blueventedgaragefloortile.png?v=1702667386",
        width: 2240,
      },
      {
        alt: "red vented garage floor tile",
        id: 24226666741860,
        position: 12,
        preview_image: {
          aspect_ratio: 1,
          height: 2240,
          width: 2240,
          src: "//floor-mat-app.myshopify.com/cdn/shop/products/redventedgaragefloortile.png?v=1702667386",
        },
        aspect_ratio: 1,
        height: 2240,
        media_type: "image",
        src: "//floor-mat-app.myshopify.com/cdn/shop/products/redventedgaragefloortile.png?v=1702667386",
        width: 2240,
      },
      {
        alt: "green vented garage floor tile",
        id: 24226666774628,
        position: 13,
        preview_image: {
          aspect_ratio: 1,
          height: 2240,
          width: 2240,
          src: "//floor-mat-app.myshopify.com/cdn/shop/products/greenventedgaragefloortile.png?v=1702667386",
        },
        aspect_ratio: 1,
        height: 2240,
        media_type: "image",
        src: "//floor-mat-app.myshopify.com/cdn/shop/products/greenventedgaragefloortile.png?v=1702667386",
        width: 2240,
      },
      {
        alt: "yellow vented garage floor tile",
        id: 24226666807396,
        position: 14,
        preview_image: {
          aspect_ratio: 1,
          height: 2240,
          width: 2240,
          src: "//floor-mat-app.myshopify.com/cdn/shop/products/yellowventedgaragefloortile.png?v=1702667386",
        },
        aspect_ratio: 1,
        height: 2240,
        media_type: "image",
        src: "//floor-mat-app.myshopify.com/cdn/shop/products/yellowventedgaragefloortile.png?v=1702667386",
        width: 2240,
      },
      {
        alt: "orange vented garage floor tile",
        id: 24226666840164,
        position: 15,
        preview_image: {
          aspect_ratio: 1,
          height: 2240,
          width: 2240,
          src: "//floor-mat-app.myshopify.com/cdn/shop/products/orangeventedgaragefloortile.png?v=1702667386",
        },
        aspect_ratio: 1,
        height: 2240,
        media_type: "image",
        src: "//floor-mat-app.myshopify.com/cdn/shop/products/orangeventedgaragefloortile.png?v=1702667386",
        width: 2240,
      },
      {
        alt: "turquoise vented garage floor tile",
        id: 24226666872932,
        position: 16,
        preview_image: {
          aspect_ratio: 1,
          height: 2240,
          width: 2240,
          src: "//floor-mat-app.myshopify.com/cdn/shop/products/turquoiseventedgaragefloortile.png?v=1702667386",
        },
        aspect_ratio: 1,
        height: 2240,
        media_type: "image",
        src: "//floor-mat-app.myshopify.com/cdn/shop/products/turquoiseventedgaragefloortile.png?v=1702667386",
        width: 2240,
      },
      {
        alt: "dark grey vented garage floor tile",
        id: 24226666905700,
        position: 17,
        preview_image: {
          aspect_ratio: 1,
          height: 2240,
          width: 2240,
          src: "//floor-mat-app.myshopify.com/cdn/shop/products/darkgreyventedgaragefloortile.png?v=1702667386",
        },
        aspect_ratio: 1,
        height: 2240,
        media_type: "image",
        src: "//floor-mat-app.myshopify.com/cdn/shop/products/darkgreyventedgaragefloortile.png?v=1702667386",
        width: 2240,
      },
      {
        alt: "pink vented garage floor tile",
        id: 24226666938468,
        position: 18,
        preview_image: {
          aspect_ratio: 1,
          height: 2240,
          width: 2240,
          src: "//floor-mat-app.myshopify.com/cdn/shop/products/pinkventedgaragefloortile.png?v=1702667386",
        },
        aspect_ratio: 1,
        height: 2240,
        media_type: "image",
        src: "//floor-mat-app.myshopify.com/cdn/shop/products/pinkventedgaragefloortile.png?v=1702667386",
        width: 2240,
      },
      {
        alt: "white vented garage floor tile",
        id: 24226666971236,
        position: 19,
        preview_image: {
          aspect_ratio: 1,
          height: 2240,
          width: 2240,
          src: "//floor-mat-app.myshopify.com/cdn/shop/products/whiteventedgaragefloortile.png?v=1702667386",
        },
        aspect_ratio: 1,
        height: 2240,
        media_type: "image",
        src: "//floor-mat-app.myshopify.com/cdn/shop/products/whiteventedgaragefloortile.png?v=1702667386",
        width: 2240,
      },
      {
        alt: null,
        id: 24226667135076,
        position: 20,
        preview_image: {
          aspect_ratio: 1,
          height: 2240,
          width: 2240,
          src: "//floor-mat-app.myshopify.com/cdn/shop/products/FluorescentYellowgaragefloortile.png?v=1702667386",
        },
        aspect_ratio: 1,
        height: 2240,
        media_type: "image",
        src: "//floor-mat-app.myshopify.com/cdn/shop/products/FluorescentYellowgaragefloortile.png?v=1702667386",
        width: 2240,
      },
      {
        alt: null,
        id: 24226667167844,
        position: 21,
        preview_image: {
          aspect_ratio: 1,
          height: 2240,
          width: 2240,
          src: "//floor-mat-app.myshopify.com/cdn/shop/products/darkblueventedgaragefloortile.png?v=1702667386",
        },
        aspect_ratio: 1,
        height: 2240,
        media_type: "image",
        src: "//floor-mat-app.myshopify.com/cdn/shop/products/darkblueventedgaragefloortile.png?v=1702667386",
        width: 2240,
      },
      {
        alt: null,
        id: 24226667200612,
        position: 22,
        preview_image: {
          aspect_ratio: 1,
          height: 2240,
          width: 2240,
          src: "//floor-mat-app.myshopify.com/cdn/shop/products/goldventedgaragefloortilecopy.png?v=1702667386",
        },
        aspect_ratio: 1,
        height: 2240,
        media_type: "image",
        src: "//floor-mat-app.myshopify.com/cdn/shop/products/goldventedgaragefloortilecopy.png?v=1702667386",
        width: 2240,
      },
      {
        alt: null,
        id: 24226667233380,
        position: 23,
        preview_image: {
          aspect_ratio: 1,
          height: 2240,
          width: 2240,
          src: "//floor-mat-app.myshopify.com/cdn/shop/products/purpleventedgaragefloortilecopy.png?v=1702667386",
        },
        aspect_ratio: 1,
        height: 2240,
        media_type: "image",
        src: "//floor-mat-app.myshopify.com/cdn/shop/products/purpleventedgaragefloortilecopy.png?v=1702667386",
        width: 2240,
      },
    ],
    content:
      '<meta charset="UTF-8"><meta charset="utf-8">\n<p><strong><em>Price Per Metre² = 6.25 tiles</em></strong></p>\n<p><em>Ideal for garages and workshops our vented tiles offer a great new look to your premises and are very popular in garages, detailing centres, and vehicle workshops.</em></p>\n<p><em>When it comes to vented floor tiles Garage Style are the market leaders providing the best quality vented tile system on the market with unique interlocking joint system and premium finish.</em></p>\n<p><em>With 15 colour options our team can help to come up with a unique colour scheme to turn your floor space into a showroom to be proud of!&nbsp;<br></em></p>\n<p><em>Our tiles are capable of withstanding even the harshest environments including high vehicle traffic areas. Not to be confused with the cheap imitations that crush over time. We pride ourselves in 5 star products and 5 star service just check out our reviews!&nbsp;</em></p>\n<p><em>Each tile is 400mm x 400mm x 18mm and there is 6.25 tiles per m2<br><br>Ramp sections also available under the ramps &amp; accessories category &nbsp;</em></p>\n<p><em>Fast UK delivery and full installation service by our professional installation team also available nationwide.&nbsp;</em></p>\n<p><em>Please call our office on 01707 229800 for any advice or installation pricing.&nbsp;</em></p>\n<h4><span>KEY BENEFITS</span></h4>\n<ul>\n<li><span>10 Year Manufacturers&nbsp;Warranty</span></li>\n<li><span>Industry Best Interlocking Joint&nbsp;System</span></li>\n<li><span>Simple click&nbsp;and use installation</span></li>\n<li><span>25+ years anticipated lifespan</span></li>\n<li><span>Smart modern appearance</span></li>\n<li><span>Chemically resistant</span></li>\n<li><span>Anti-Slip</span></li>\n<li><span>Reduces dust and noise</span></li>\n<li>\n<span>Exceptional d</span>urability</li>\n<li><span>Warm – insulates the floor from cold and damp</span></li>\n<li><span>Reduces fatigue</span></li>\n<li><span>Lower life cycle cost</span></li>\n<li><span>Move and re-use</span></li>\n<li><span>Custom Colours &amp; Logos&nbsp;</span></li>\n</ul>',
  },
  product2: {
    id: 7352159928420,
    title: "Garage Floor Tile (Premium Raised Disc)",
    handle: "garage-floor-tile-premium-raised-disc",
    description:
      '<meta charset="UTF-8">\n<p><strong><em>Price Per Metre² = 4 tiles</em></strong></p>\n<p>Premium UK made PVC Raised Disk&nbsp;Tiles</p>\n<p>Each tile is 500mm x 500mm x 7mm thick but they are priced per m2 - 4 Tiles&nbsp;</p>\n<p>Our Raised Disk&nbsp;tiles have been manufactured to the highest quality standards in the UK for the last 30 years and cannot be beaten when it comes to quality!&nbsp;<br>With a large range of colours available you can customise your garage floor into a showroom to be proud of!&nbsp;<br><br></p>\n<p><em>Our tiles are capable of withstanding even the harshest environments including high vehicle traffic areas and weights of up-to 10 tonnes. </em></p>\n<p><em>We pride ourselves in 5 star products and 5 star service just check out our reviews!&nbsp;</em><em><br><br>Ramp sections also available under the ramps &amp; accessories category &nbsp;</em></p>\n<p><em>Fast UK delivery and full installation service by our professional installation team also available nationwide.&nbsp;</em></p>\n<p><em>Please call our office on <a href="tel:01707%20229800">01707 229800</a> for any advice or installation pricing.&nbsp;</em></p>\n<h4><span>Key Benefits</span></h4>\n<ul>\n<li><span>10 year warranty</span></li>\n<li><span>Simple click&nbsp;and use installation</span></li>\n<li>ISO9001 certified manufacturer guarantee</li>\n<li><span>25+ years anticipated lifespan</span></li>\n<li><span>Smart modern appearance</span></li>\n<li><span>Chemically resistant</span></li>\n<li><span>Reduces dust and noise</span></li>\n<li>\n<span>Exceptional d</span>urability</li>\n<li><span>Safe – excellent slip-resistance</span></li>\n<li><span>Warm – insulates the floor from cold and damp</span></li>\n<li><span>Reduces fatigue</span></li>\n<li><span>Lower life cycle cost</span></li>\n<li><span>Move and re-use</span></li>\n</ul>\n<p><iframe title="YouTube video player" src="https://www.youtube.com/embed/9m3nnGOZ4Lk" height="315" width="560" allowfullscreen="" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" frameborder="0"></iframe></p>\n<p>&nbsp;</p>',
    published_at: "2023-12-15T14:10:47-05:00",
    created_at: "2023-12-15T14:11:30-05:00",
    vendor: "Garage Style | Garage Floor TIles",
    type: "",
    tags: [],
    price: 3840,
    price_min: 3840,
    price_max: 3840,
    available: true,
    price_varies: false,
    compare_at_price: null,
    compare_at_price_min: 0,
    compare_at_price_max: 0,
    compare_at_price_varies: false,
    variants: [
      {
        id: 42581544796260,
        title: "Light Grey",
        option1: "Light Grey",
        option2: null,
        option3: null,
        sku: "",
        requires_shipping: true,
        taxable: true,
        featured_image: {
          id: 31924855046244,
          product_id: 7352159928420,
          position: 10,
          created_at: "2023-12-15T14:11:31-05:00",
          updated_at: "2023-12-15T14:11:31-05:00",
          alt: "Light Grey Garage Floor Tile Premium Raised Disc",
          width: 1080,
          height: 1080,
          src: "//floor-mat-app.myshopify.com/cdn/shop/products/3f1da048-b3da-48f5-a643-6e03dfbfe063.jpg?v=1702667491",
          variant_ids: [42581544796260],
        },
        available: true,
        name: "Garage Floor Tile (Premium Raised Disc) - Light Grey",
        public_title: "Light Grey",
        options: ["Light Grey"],
        price: 3840,
        weight: 0,
        compare_at_price: null,
        inventory_management: "shopify",
        barcode: "",
        featured_media: {
          alt: "Light Grey Garage Floor Tile Premium Raised Disc",
          id: 24226668806244,
          position: 10,
          preview_image: {
            aspect_ratio: 1,
            height: 1080,
            width: 1080,
            src: "//floor-mat-app.myshopify.com/cdn/shop/products/3f1da048-b3da-48f5-a643-6e03dfbfe063.jpg?v=1702667491",
          },
        },
        quantity_rule: {
          min: 1,
          max: null,
          increment: 1,
        },
      },
      {
        id: 42581544829028,
        title: "Dark Grey",
        option1: "Dark Grey",
        option2: null,
        option3: null,
        sku: "",
        requires_shipping: true,
        taxable: true,
        featured_image: {
          id: 31924855079012,
          product_id: 7352159928420,
          position: 11,
          created_at: "2023-12-15T14:11:31-05:00",
          updated_at: "2023-12-15T14:11:31-05:00",
          alt: "Dark Grey Garage Floor Tile Premium Raised Disc",
          width: 1080,
          height: 1080,
          src: "//floor-mat-app.myshopify.com/cdn/shop/products/0b5e6fac-6ac6-46bf-ab6a-9484de000fba.jpg?v=1702667491",
          variant_ids: [42581544829028],
        },
        available: true,
        name: "Garage Floor Tile (Premium Raised Disc) - Dark Grey",
        public_title: "Dark Grey",
        options: ["Dark Grey"],
        price: 3840,
        weight: 0,
        compare_at_price: null,
        inventory_management: "shopify",
        barcode: "",
        featured_media: {
          alt: "Dark Grey Garage Floor Tile Premium Raised Disc",
          id: 24226668839012,
          position: 11,
          preview_image: {
            aspect_ratio: 1,
            height: 1080,
            width: 1080,
            src: "//floor-mat-app.myshopify.com/cdn/shop/products/0b5e6fac-6ac6-46bf-ab6a-9484de000fba.jpg?v=1702667491",
          },
        },
        quantity_rule: {
          min: 1,
          max: null,
          increment: 1,
        },
      },
      {
        id: 42581544861796,
        title: "Graphite",
        option1: "Graphite",
        option2: null,
        option3: null,
        sku: "",
        requires_shipping: true,
        taxable: true,
        featured_image: {
          id: 31924855111780,
          product_id: 7352159928420,
          position: 12,
          created_at: "2023-12-15T14:11:31-05:00",
          updated_at: "2023-12-15T14:11:31-05:00",
          alt: "Graphite Garage Floor Tile Premium Raised Disc",
          width: 1080,
          height: 1080,
          src: "//floor-mat-app.myshopify.com/cdn/shop/products/73186b59-2fed-4f5b-a554-6f0184582df8.jpg?v=1702667491",
          variant_ids: [42581544861796],
        },
        available: true,
        name: "Garage Floor Tile (Premium Raised Disc) - Graphite",
        public_title: "Graphite",
        options: ["Graphite"],
        price: 3840,
        weight: 0,
        compare_at_price: null,
        inventory_management: "shopify",
        barcode: "",
        featured_media: {
          alt: "Graphite Garage Floor Tile Premium Raised Disc",
          id: 24226668871780,
          position: 12,
          preview_image: {
            aspect_ratio: 1,
            height: 1080,
            width: 1080,
            src: "//floor-mat-app.myshopify.com/cdn/shop/products/73186b59-2fed-4f5b-a554-6f0184582df8.jpg?v=1702667491",
          },
        },
        quantity_rule: {
          min: 1,
          max: null,
          increment: 1,
        },
      },
      {
        id: 42581544894564,
        title: "Black",
        option1: "Black",
        option2: null,
        option3: null,
        sku: "",
        requires_shipping: true,
        taxable: true,
        featured_image: {
          id: 31924855144548,
          product_id: 7352159928420,
          position: 13,
          created_at: "2023-12-15T14:11:31-05:00",
          updated_at: "2023-12-15T14:11:31-05:00",
          alt: "Black Garage Floor Tile Premium Raised Disc",
          width: 1080,
          height: 1080,
          src: "//floor-mat-app.myshopify.com/cdn/shop/products/0c6f1b7b-ac49-4c6b-a47a-6a7664b85bcf.jpg?v=1702667491",
          variant_ids: [42581544894564],
        },
        available: true,
        name: "Garage Floor Tile (Premium Raised Disc) - Black",
        public_title: "Black",
        options: ["Black"],
        price: 3840,
        weight: 0,
        compare_at_price: null,
        inventory_management: "shopify",
        barcode: "",
        featured_media: {
          alt: "Black Garage Floor Tile Premium Raised Disc",
          id: 24226668904548,
          position: 13,
          preview_image: {
            aspect_ratio: 1,
            height: 1080,
            width: 1080,
            src: "//floor-mat-app.myshopify.com/cdn/shop/products/0c6f1b7b-ac49-4c6b-a47a-6a7664b85bcf.jpg?v=1702667491",
          },
        },
        quantity_rule: {
          min: 1,
          max: null,
          increment: 1,
        },
      },
    ],
    images: [
      "//floor-mat-app.myshopify.com/cdn/shop/products/lightgreyraisedgaragefloortilepov.jpg?v=1702667490",
      "//floor-mat-app.myshopify.com/cdn/shop/products/darkgreyraisedgaragefloortilepov.jpg?v=1702667490",
      "//floor-mat-app.myshopify.com/cdn/shop/products/graphiteraisedgaragefloortilepov.jpg?v=1702667490",
      "//floor-mat-app.myshopify.com/cdn/shop/products/blackraisedgaragefloortilepov.jpg?v=1702667491",
      "//floor-mat-app.myshopify.com/cdn/shop/products/b48f1cf6-8f26-47ed-9fc8-b5911fce9e65.jpg?v=1702667491",
      "//floor-mat-app.myshopify.com/cdn/shop/products/lightgreyraisedgaragefloortile.jpg?v=1702667491",
      "//floor-mat-app.myshopify.com/cdn/shop/products/darkgreyraisedgaragefloortile.png?v=1702667491",
      "//floor-mat-app.myshopify.com/cdn/shop/products/graphiteraisedgaragefloortile.jpg?v=1702667491",
      "//floor-mat-app.myshopify.com/cdn/shop/products/blackraisedgaragefloortile.png?v=1702667491",
      "//floor-mat-app.myshopify.com/cdn/shop/products/3f1da048-b3da-48f5-a643-6e03dfbfe063.jpg?v=1702667491",
      "//floor-mat-app.myshopify.com/cdn/shop/products/0b5e6fac-6ac6-46bf-ab6a-9484de000fba.jpg?v=1702667491",
      "//floor-mat-app.myshopify.com/cdn/shop/products/73186b59-2fed-4f5b-a554-6f0184582df8.jpg?v=1702667491",
      "//floor-mat-app.myshopify.com/cdn/shop/products/0c6f1b7b-ac49-4c6b-a47a-6a7664b85bcf.jpg?v=1702667491",
    ],
    featured_image:
      "//floor-mat-app.myshopify.com/cdn/shop/products/lightgreyraisedgaragefloortilepov.jpg?v=1702667490",
    options: ["Colour"],
    media: [
      {
        alt: "Light Grey Garage Floor Tile Premium Raised Disc",
        id: 24226668511332,
        position: 1,
        preview_image: {
          aspect_ratio: 1,
          height: 1700,
          width: 1700,
          src: "//floor-mat-app.myshopify.com/cdn/shop/products/lightgreyraisedgaragefloortilepov.jpg?v=1702667490",
        },
        aspect_ratio: 1,
        height: 1700,
        media_type: "image",
        src: "//floor-mat-app.myshopify.com/cdn/shop/products/lightgreyraisedgaragefloortilepov.jpg?v=1702667490",
        width: 1700,
      },
      {
        alt: "Dark Grey Garage Floor Tile Premium Raised Disc",
        id: 24226668544100,
        position: 2,
        preview_image: {
          aspect_ratio: 1,
          height: 1700,
          width: 1700,
          src: "//floor-mat-app.myshopify.com/cdn/shop/products/darkgreyraisedgaragefloortilepov.jpg?v=1702667490",
        },
        aspect_ratio: 1,
        height: 1700,
        media_type: "image",
        src: "//floor-mat-app.myshopify.com/cdn/shop/products/darkgreyraisedgaragefloortilepov.jpg?v=1702667490",
        width: 1700,
      },
      {
        alt: "Graphite Garage Floor Tile Premium Raised Disc",
        id: 24226668576868,
        position: 3,
        preview_image: {
          aspect_ratio: 1,
          height: 1700,
          width: 1700,
          src: "//floor-mat-app.myshopify.com/cdn/shop/products/graphiteraisedgaragefloortilepov.jpg?v=1702667490",
        },
        aspect_ratio: 1,
        height: 1700,
        media_type: "image",
        src: "//floor-mat-app.myshopify.com/cdn/shop/products/graphiteraisedgaragefloortilepov.jpg?v=1702667490",
        width: 1700,
      },
      {
        alt: "Black Garage Floor Tile Premium Raised Disc",
        id: 24226668609636,
        position: 4,
        preview_image: {
          aspect_ratio: 1,
          height: 1700,
          width: 1700,
          src: "//floor-mat-app.myshopify.com/cdn/shop/products/blackraisedgaragefloortilepov.jpg?v=1702667491",
        },
        aspect_ratio: 1,
        height: 1700,
        media_type: "image",
        src: "//floor-mat-app.myshopify.com/cdn/shop/products/blackraisedgaragefloortilepov.jpg?v=1702667491",
        width: 1700,
      },
      {
        alt: "Garage Floor Tile Premium Raised Disc",
        id: 24226668642404,
        position: 5,
        preview_image: {
          aspect_ratio: 1,
          height: 1080,
          width: 1080,
          src: "//floor-mat-app.myshopify.com/cdn/shop/products/b48f1cf6-8f26-47ed-9fc8-b5911fce9e65.jpg?v=1702667491",
        },
        aspect_ratio: 1,
        height: 1080,
        media_type: "image",
        src: "//floor-mat-app.myshopify.com/cdn/shop/products/b48f1cf6-8f26-47ed-9fc8-b5911fce9e65.jpg?v=1702667491",
        width: 1080,
      },
      {
        alt: "Light Grey Garage Floor Tile Premium Raised Disc",
        id: 24226668675172,
        position: 6,
        preview_image: {
          aspect_ratio: 1,
          height: 2240,
          width: 2240,
          src: "//floor-mat-app.myshopify.com/cdn/shop/products/lightgreyraisedgaragefloortile.jpg?v=1702667491",
        },
        aspect_ratio: 1,
        height: 2240,
        media_type: "image",
        src: "//floor-mat-app.myshopify.com/cdn/shop/products/lightgreyraisedgaragefloortile.jpg?v=1702667491",
        width: 2240,
      },
      {
        alt: "Dark Grey Garage Floor Tile Premium Raised Disc",
        id: 24226668707940,
        position: 7,
        preview_image: {
          aspect_ratio: 1,
          height: 2240,
          width: 2240,
          src: "//floor-mat-app.myshopify.com/cdn/shop/products/darkgreyraisedgaragefloortile.png?v=1702667491",
        },
        aspect_ratio: 1,
        height: 2240,
        media_type: "image",
        src: "//floor-mat-app.myshopify.com/cdn/shop/products/darkgreyraisedgaragefloortile.png?v=1702667491",
        width: 2240,
      },
      {
        alt: "Graphite Garage Floor Tile Premium Raised Disc",
        id: 24226668740708,
        position: 8,
        preview_image: {
          aspect_ratio: 1,
          height: 2240,
          width: 2240,
          src: "//floor-mat-app.myshopify.com/cdn/shop/products/graphiteraisedgaragefloortile.jpg?v=1702667491",
        },
        aspect_ratio: 1,
        height: 2240,
        media_type: "image",
        src: "//floor-mat-app.myshopify.com/cdn/shop/products/graphiteraisedgaragefloortile.jpg?v=1702667491",
        width: 2240,
      },
      {
        alt: "Black Garage Floor Tile Premium Raised Disc",
        id: 24226668773476,
        position: 9,
        preview_image: {
          aspect_ratio: 1,
          height: 2240,
          width: 2240,
          src: "//floor-mat-app.myshopify.com/cdn/shop/products/blackraisedgaragefloortile.png?v=1702667491",
        },
        aspect_ratio: 1,
        height: 2240,
        media_type: "image",
        src: "//floor-mat-app.myshopify.com/cdn/shop/products/blackraisedgaragefloortile.png?v=1702667491",
        width: 2240,
      },
      {
        alt: "Light Grey Garage Floor Tile Premium Raised Disc",
        id: 24226668806244,
        position: 10,
        preview_image: {
          aspect_ratio: 1,
          height: 1080,
          width: 1080,
          src: "//floor-mat-app.myshopify.com/cdn/shop/products/3f1da048-b3da-48f5-a643-6e03dfbfe063.jpg?v=1702667491",
        },
        aspect_ratio: 1,
        height: 1080,
        media_type: "image",
        src: "//floor-mat-app.myshopify.com/cdn/shop/products/3f1da048-b3da-48f5-a643-6e03dfbfe063.jpg?v=1702667491",
        width: 1080,
      },
      {
        alt: "Dark Grey Garage Floor Tile Premium Raised Disc",
        id: 24226668839012,
        position: 11,
        preview_image: {
          aspect_ratio: 1,
          height: 1080,
          width: 1080,
          src: "//floor-mat-app.myshopify.com/cdn/shop/products/0b5e6fac-6ac6-46bf-ab6a-9484de000fba.jpg?v=1702667491",
        },
        aspect_ratio: 1,
        height: 1080,
        media_type: "image",
        src: "//floor-mat-app.myshopify.com/cdn/shop/products/0b5e6fac-6ac6-46bf-ab6a-9484de000fba.jpg?v=1702667491",
        width: 1080,
      },
      {
        alt: "Graphite Garage Floor Tile Premium Raised Disc",
        id: 24226668871780,
        position: 12,
        preview_image: {
          aspect_ratio: 1,
          height: 1080,
          width: 1080,
          src: "//floor-mat-app.myshopify.com/cdn/shop/products/73186b59-2fed-4f5b-a554-6f0184582df8.jpg?v=1702667491",
        },
        aspect_ratio: 1,
        height: 1080,
        media_type: "image",
        src: "//floor-mat-app.myshopify.com/cdn/shop/products/73186b59-2fed-4f5b-a554-6f0184582df8.jpg?v=1702667491",
        width: 1080,
      },
      {
        alt: "Black Garage Floor Tile Premium Raised Disc",
        id: 24226668904548,
        position: 13,
        preview_image: {
          aspect_ratio: 1,
          height: 1080,
          width: 1080,
          src: "//floor-mat-app.myshopify.com/cdn/shop/products/0c6f1b7b-ac49-4c6b-a47a-6a7664b85bcf.jpg?v=1702667491",
        },
        aspect_ratio: 1,
        height: 1080,
        media_type: "image",
        src: "//floor-mat-app.myshopify.com/cdn/shop/products/0c6f1b7b-ac49-4c6b-a47a-6a7664b85bcf.jpg?v=1702667491",
        width: 1080,
      },
    ],
    content:
      '<meta charset="UTF-8">\n<p><strong><em>Price Per Metre² = 4 tiles</em></strong></p>\n<p>Premium UK made PVC Raised Disk&nbsp;Tiles</p>\n<p>Each tile is 500mm x 500mm x 7mm thick but they are priced per m2 - 4 Tiles&nbsp;</p>\n<p>Our Raised Disk&nbsp;tiles have been manufactured to the highest quality standards in the UK for the last 30 years and cannot be beaten when it comes to quality!&nbsp;<br>With a large range of colours available you can customise your garage floor into a showroom to be proud of!&nbsp;<br><br></p>\n<p><em>Our tiles are capable of withstanding even the harshest environments including high vehicle traffic areas and weights of up-to 10 tonnes. </em></p>\n<p><em>We pride ourselves in 5 star products and 5 star service just check out our reviews!&nbsp;</em><em><br><br>Ramp sections also available under the ramps &amp; accessories category &nbsp;</em></p>\n<p><em>Fast UK delivery and full installation service by our professional installation team also available nationwide.&nbsp;</em></p>\n<p><em>Please call our office on <a href="tel:01707%20229800">01707 229800</a> for any advice or installation pricing.&nbsp;</em></p>\n<h4><span>Key Benefits</span></h4>\n<ul>\n<li><span>10 year warranty</span></li>\n<li><span>Simple click&nbsp;and use installation</span></li>\n<li>ISO9001 certified manufacturer guarantee</li>\n<li><span>25+ years anticipated lifespan</span></li>\n<li><span>Smart modern appearance</span></li>\n<li><span>Chemically resistant</span></li>\n<li><span>Reduces dust and noise</span></li>\n<li>\n<span>Exceptional d</span>urability</li>\n<li><span>Safe – excellent slip-resistance</span></li>\n<li><span>Warm – insulates the floor from cold and damp</span></li>\n<li><span>Reduces fatigue</span></li>\n<li><span>Lower life cycle cost</span></li>\n<li><span>Move and re-use</span></li>\n</ul>\n<p><iframe title="YouTube video player" src="https://www.youtube.com/embed/9m3nnGOZ4Lk" height="315" width="560" allowfullscreen="" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" frameborder="0"></iframe></p>\n<p>&nbsp;</p>',
  },
};
export default Viewer2;
