import * as TWEEN from "@tweenjs/tween.js";
// FileA.js
import { publish } from "../components/EventMediator";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { DragControls } from "three/examples/jsm/controls/DragControls";
import {
  CSS3DObject,
  CSS3DRenderer,
} from "three/examples/jsm/renderers/CSS3DRenderer";
import { TransformControls } from "three/examples/jsm/controls/TransformControls.js";

import { GUI } from "three/examples/jsm//libs/lil-gui.module.min.js";
import { TrackballControls } from "three/examples/jsm/controls/TrackballControls";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader.js";
import Box3Extension from "../Utils/Box3Extension";
import {
  COLOR_ALICE_BLUE,
  COLOR_GRAY,
  COLOR_WHITE,
  DOOR_STYLES,
  HANDING_RH_LH,
} from "../Utils/Common";
import { DebugEnvironment } from "three/examples/jsm/environments/DebugEnvironment";
import { RGBMLoader } from "three/examples/jsm/loaders/RGBMLoader";
import CameraControls from "camera-controls";
import LockerProperty from "./LockerProperty";
import {
  convertCentiMeter,
  convertFeetInch,
  convertToMeter,
  createDimension,
  createDimensionLine,
  createText,
  toRadians,
} from "../Utils/MeshUtils";
import { jsPDF } from "jspdf";
import { ThreeDRotation } from "@mui/icons-material";
import { logDOM } from "@testing-library/react";
CameraControls.install({
  THREE: THREE,
});

export const getIsRight = function (updateframe) {
  let worldpos = new THREE.Vector3();
  updateframe.getWorldPosition(worldpos);
  return worldpos.x > 0;
};
export const isNumber = function (n) {
  return /^-?[\d.]+(?:e-?\d+)?$/.test(n);
};
const clock = new THREE.Clock();
export default class Engine {
  constructor(canvasID, filePath, id) {
    this.productId = id;
    this.renderer = null;
    this.renderer2 = null;
    this.camera = null;
    this.light = null;
    this.scene = null;
    this.scene2 = null;
    this.controls = null;
    this.CanvasContainer = document.querySelector(`#${canvasID}`);
    this.render = this.render.bind(this);
    this.RotationIsForward = true;
    this.doors = null;
    this.remainingval = 0;
    this.Jsondata = null;
    this.selectedPanel = null;
    this.joints = null;
    this.measurements = true;
    this.identifiers = false;
    this.showType = "doorsFrames";
    this.isSecure = true;
    this.intersectPoint = null;
    this.locker = null;
    this.rows = 2;
    this.cols = 1;
    this.allLockers = null;
    this.rgbmCubeRenderTarget = null;
    this.Is30cm = true;
    this.mouseX = 0;
    this.rootPath = filePath;
    this.Isbackground1 = true;
    this.background1 = null;
    this.background2 = null;
    this.backgroundSelected = 3;
    this.terminalsData = [];
    this.floorWidth = 1;
    this.floorLength = 1;
    this.incrementValue = 0.1;
    this.isMeter = true;
    this.Dragging = true;
    this.lineWidth = 0.05;
    this.textSize = 4;
    //custom layout
    //  ________
    //  |     __|
    //  |    |
    //  |____|

    this.upperWidth = 10;
    this.lowerWidth = 5;
    this.upperLength = 5;
    this.lowerLength = 5;

    this.lg1 = new THREE.Group();
    this.lg2 = new THREE.Group();

    this.selectedLine = "";
    this.dragStart = [];
    this.dragEnd = [];
    const loader = new THREE.TextureLoader();
    this.PrimaryColor = "#808080";
    this.isCustomLayout = false;
    this.secondaryColor = "#FF0000";
    this.currentTexture = new THREE.TextureLoader().load(
      "https://cdn.shopify.com/s/files/1/0620/9817/8148/files/vented.jpg?v=1702842587"
    );
    this.floormaterial = new THREE.MeshBasicMaterial({
      map: this.currentTexture,
      color: this.PrimaryColor,
      opacity: 0.9,
      side: THREE.DoubleSide,
      transparent: true,
    });
    this.draicon = loader.load(
      "https://cdn.shopify.com/s/files/1/0620/9817/8148/files/dragicon.svg?v=1702842585"
    );
    this.dragPlaneMat = new THREE.MeshBasicMaterial({
      map: this.draicon,
      opacity: 0.9,
      side: THREE.DoubleSide,
      transparent: true,
    });
    this.stdWidth = 1;
    this.stdLength = 1;
    this.standardVTileDim = 0.4;
    this.standardSmoothTileDim = 0.5;
    this.conversionFactor = 3.28;
    this.selectedTileDimension = this.standardVTileDim;
    this.selectedTilePrice = 35.4;
    this.selectedUnit = " FT";
    this.lengthGrp = new THREE.Group();
    this.widthGrp = new THREE.Group();
    this.group = new THREE.Group();
    this.lineGroup = new THREE.Group();
    this.lineGrpSprited = new THREE.Group();
    this.geometry = new THREE.PlaneGeometry(1, 1);
    this.selectedPattern = "No Pattern";

    this.panel1 = new THREE.Mesh(this.geometry, this.floormaterial);
    this.panel2 = new THREE.Mesh(this.geometry, this.floormaterial.clone());
    this.panel = new THREE.Group();
    this.panel.add(this.panel1);
    this.panel.add(this.panel2);
    // this.panel.rotateX(Math.PI / 2);
    this.mouse = new THREE.Vector2();
    this.raycaster = new THREE.Raycaster();
    this.objects = [];
    this.dc, this.transformControl;
    this.initialMousePosition = new THREE.Vector3();
    this.initialDragPosition = new THREE.Vector3();

    // this.dragChange = this.dragChange.bind(this);
    // this.dragStart = this.dragStart.bind(this);
    // this.dragEnd = this.dragEnd.bind(this);
    // this.onDrag = this.onDrag.bind(this);

    //  this.geometry.rotateX(Math.PI/2)

    // immediately use the texture for material creation

    // const material = new THREE.MeshBasicMaterial({
    //   map: texture
    // });
  }

  Dispose() {
    this.renderer.dispose();

    this.scene.traverse((object) => {
      if (!object.isMesh) return;

      object.geometry.dispose();

      if (object.material.isMaterial) {
        this.cleanMaterial(object.material);
      } else {
        // an array of materials
        for (const material of object.material) cleanMaterial(material);
      }
    });
  }

  cleanMaterial(material) {
    material.dispose();

    // dispose textures
    for (const key of Object.keys(material)) {
      const value = material[key];
      if (value && typeof value === "object" && "minFilter" in value) {
        value.dispose();
      }
    }
  }

  async initEngine() {
    let width = this.CanvasContainer.offsetWidth;
    let height = this.CanvasContainer.offsetHeight;
    if (width === 0) width = 500;
    if (height === 0) height = 500;

    this.renderer = new THREE.WebGLRenderer({
      preserveDrawingBuffer: true,
      antialias: true,
      alpha: true,
    });
    // this.renderer2 = new CSS3DRenderer();
    // this.renderer2.setSize(width, height);
    // this.renderer2.domElement.style.position = 'absolute';
    // this.renderer2.domElement.style.top = 0;

    // controls = new TrackballControls( camera, renderer2.domElement );

    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(width, height);
    this.renderer.shadowMap.enabled = true;
    this.CanvasContainer.appendChild(this.renderer.domElement);
    // this.CanvasContainer.appendChild( this.renderer2.domElement );

    this.camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 1000);
    // this.camera = new THREE.OrthographicCamera(width / -2, width / 2, height / 2, height / -2, 1, 1000);
    // this.camera.lookAt(new THREE.Vector3(0, 10, -20));
    this.camera.position.set(0, 0, 10);

    this.scene = new THREE.Scene();
    this.scene2 = new THREE.Scene();

    this.scene.background = new THREE.Color(COLOR_ALICE_BLUE);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    // this.controls.target.set(0, 0, 0);
    this.controls.update();
    this.controls.enableRotate = false;
    this.controls.enablePan = false;
    // this.controls.enableZoom = false;

    // this.transformControl = new TransformControls(this.camera, this.renderer.domElement);
    // this.transformControl.addEventListener('change', this.render);
    // this.transformControl.setMode("translate");
    // this.scene.add(this.transformControl);
    this.light = new THREE.AmbientLight(COLOR_GRAY, 1);
    this.scene.add(this.light);
    // this.transformControl.addEventListener('dragging-changed', this.dragChange);

    this.light = new THREE.DirectionalLight(COLOR_WHITE);
    this.light.position.set(0, -40, 100);
    this.light.intensity = 0.5;
    this.scene.add(this.camera);
    this.terminals = [];
    const geometry = new THREE.PlaneGeometry(1, 1);
    const material = new THREE.MeshPhongMaterial({
      color: 0xffff00,
      opacity: 0.5,
      side: THREE.DoubleSide,
      transparent: true,
    });

    // this.addFloorMatsNew(this.floorLength, this.floorWidth);
    // this.addFloorMats(this.floorLength, this.floorWidth);
    // this.dc = new DragControls(
    //   [...this.objects],
    //   this.camera,
    //   this.renderer.domElement
    // );
    // this.dc.addEventListener('drag', this.render());

    // this.dc.addEventListener("dragstart", this.dragStartEvent.bind(this));

    // this.dc.addEventListener("drag", this.onDragEvent.bind(this));

    // this.dc.addEventListener("dragend", this.dragEndEvent.bind(this));
    // this.Hiddenplane.visible = true;
    this.render();
    if (this.isCustomLayout) {
      this.CreateLayout(3, 3, 2, 2);
    } else {
      this.CreateLayout(this.floorLength, this.floorWidth);
    }

    this.renderer.domElement.addEventListener("mousemove", (event) => {
      this.MouseMove(event);
    });
    this.renderer.domElement.addEventListener("mouseup", (event) => {
      this.MouseUp(event);
    });
    this.renderer.domElement.addEventListener("mousedown", (event) => {
      this.MouseDown(event);
    });
    this.renderer.domElement.addEventListener("resize", (event) => {});
    this.renderer.domElement.addEventListener("click", (event) => {
      this.onClick(event);
    });
    // document.addEventListener("dragend", this.dragChange);
  }

  async CreatePlane() {
    let texture = await this.CreateTexture(
      "pattern2White.png",
      "pattern2Red.png",
      "pattern2Border.png",
      "#00ff00",
      "#ff00ff"
    );
    // texture = await this.CreateTexture(
    //   "pattern1White.png",
    //   "pattern1Red.png",
    //   "patternBorder.png",
    //   "#00ff00",
    //   "#ff00ff"
    // );
    const geometry2 = new THREE.PlaneGeometry(10, 10);
    const material2 = new THREE.MeshBasicMaterial({
      map: texture,
      side: THREE.DoubleSide,
    });
    const plane = new THREE.Mesh(geometry2, material2);
    // this.scene.add(plane);
  }
  loadImage(src) {
    return new Promise((resolve, reject) => {
      let img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  }
  async CreateTexture(pattern1, pattern2, border, color1, color2) {
    var bitmap = document.createElement("canvas");
    var g = bitmap.getContext("2d");

    bitmap.width = 1024;
    bitmap.height = 1024;

    let imagePattern1 = await this.loadImage(pattern1);
    let imagePattern2 = await this.loadImage(pattern2);
    let imageBorder = await this.loadImage(border);

    g.fillStyle = color1;
    g.fillRect(0, 0, bitmap.width, bitmap.height);
    g.globalCompositeOperation = "destination-in";

    g.drawImage(
      imagePattern1,
      0,
      0,
      imagePattern1.width,
      imagePattern1.height,
      0,
      0,
      1024,
      1024
    );
    g.globalCompositeOperation = "destination-over";
    g.fillStyle = color2;
    g.fillRect(0, 0, bitmap.width, bitmap.height);
    // g.reset();
    g.drawImage(
      imagePattern2,
      0,
      0,
      imagePattern1.width,
      imagePattern1.height,
      0,
      0,
      1024,
      1024
    );
    g.globalCompositeOperation = "source-over";
    g.fillStyle = "transparent";
    g.drawImage(
      imageBorder,
      0,
      0,
      imagePattern1.width,
      imagePattern1.height,
      0,
      0,
      1024,
      1024
    );

    var texture = new THREE.Texture(bitmap);
    texture.needsUpdate = true;
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.offset.set(0, 0);
    // texture.repeat.set(2, 2);
    return texture;
  }

  async updateTileTexture(pattern1, pattern2, border, color1, color2) {
    var bitmap = document.createElement("canvas");
    var g = bitmap.getContext("2d");

    bitmap.width = 1024;
    bitmap.height = 1024;

    let imagePattern1 = await this.loadImage(pattern1);
    let imagePattern2 = await this.loadImage(pattern2);
    let imageBorder = await this.loadImage(border);

    g.fillStyle = color1;
    g.fillRect(0, 0, bitmap.width, bitmap.height);
    g.globalCompositeOperation = "destination-in";

    g.drawImage(
      imagePattern1,
      0,
      0,
      imagePattern1.width,
      imagePattern1.height,
      0,
      0,
      1024,
      1024
    );
    g.globalCompositeOperation = "destination-over";
    g.fillStyle = color2;
    g.fillRect(0, 0, bitmap.width, bitmap.height);
    // g.reset();
    g.drawImage(
      imagePattern2,
      0,
      0,
      imagePattern1.width,
      imagePattern1.height,
      0,
      0,
      1024,
      1024
    );
    g.globalCompositeOperation = "source-over";
    g.fillStyle = "transparent";
    g.drawImage(
      imageBorder,
      0,
      0,
      imagePattern1.width,
      imagePattern1.height,
      0,
      0,
      1024,
      1024
    );

    var texture = new THREE.Texture(bitmap);
    texture.needsUpdate = true;
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.offset.set(0, 0);
    // texture.repeat.set(2, 2);
    return texture;
  }

  InitLayout(isCustomLayout, garageData) {
    this.garageData = garageData;
    if (this.garageData && garageData.variants) {
      this.selectedVariant = garageData.variants[0];
    }
    this.isCustomLayout = isCustomLayout;

    if (!this.scene) this.initEngine();
    else this.CreateLayout(3, 3, 2, 2, false);
  }

  // createTextSprite(
  //   text,
  //   fontSize = 12,
  //   textColor = "#ffffff",
  //   backgroundColor = "transparent"
  // ) {
  //   // Create a canvas element
  //   const canvas = document.createElement("canvas");
  //   const context = canvas.getContext("2d");

  //   // Set font properties
  //   context.font = `${fontSize}px Arial`;

  //   // Measure text size
  //   const textMetrics = context.measureText(text);
  //   const width = 512;
  //   const height = fontSize;

  //   // Set canvas size
  //   canvas.width = width;
  //   canvas.height = 512;

  //   // Set text properties
  //   context.font = `${fontSize}px Arial`;
  //   context.fillStyle = textColor;
  //   context.textAlign = "center";
  //   context.textBaseline = "middle";

  //   // Draw text on the canvas
  //   context.fillText(text, width / 2, height / 2);

  //   // Create a texture from the canvas
  //   const texture = new THREE.CanvasTexture(canvas);
  //   texture.needsUpdate = true;

  //   // Create a material using the texture
  //   const material = new THREE.SpriteMaterial({
  //     map: texture,
  //     color: 0x000000, // Set to white to use texture color
  //     transparent: true,
  //   });

  //   // Create a sprite using the material
  //   const sprite = new THREE.Sprite(material);

  //   // Set sprite scale based on canvas size
  //   // sprite.scale.set(width / 2, height / 2, 1);
  //   sprite.scale.set(15, 15, 15);

  //   // Set sprite position, rotation, and other properties as needed
  //   // sprite.position.set(x, y, z);
  //   // sprite.rotation.set(rx, ry, rz);

  //   return sprite;
  // }

  //   createTextSprite(text, name) {
  //     const canvas = document.createElement("canvas");
  //     const context = canvas.getContext("2d");
  //     const fontSize = 24; // Adjust the font size as needed
  //     const padding = 6; // Adjust the padding as needed

  //     context.font = `Bold ${fontSize}px Arial`;

  //     // Measure the text size
  //     const textMetrics = context.measureText(text);
  //     const textWidth = textMetrics.width;

  //     // Set canvas size based on text size and padding
  //     canvas.width = textWidth + 2 * padding;
  //     canvas.height = fontSize + 2 * padding;

  //     // Clear the canvas
  //     context.clearRect(0, 0, canvas.width, canvas.height);

  //     // Draw background (white)
  //     context.fillStyle = "white";
  //     context.fillRect(0, 0, canvas.width, canvas.height);

  //     // Draw text (red)
  //     context.fillStyle = "red";
  //     context.fillText(text, padding, fontSize + padding);

  //     const texture = new THREE.CanvasTexture(canvas);
  //     texture.needsUpdate = true;

  //     const spriteMaterial = new THREE.SpriteMaterial({
  //         map: texture,
  //         color: 0xffffff
  //     });

  //     const sprite = new THREE.Sprite(spriteMaterial);
  //     sprite.scale.set(textWidth / fontSize, 1, 1); // Adjust scale based on text width

  //     let textMesh = new THREE.Mesh(
  //         new THREE.PlaneGeometry(textWidth, fontSize),
  //         new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0 })
  //     );

  //     textMesh.name = `${name}_text`;
  //     textMesh.position.set(0, 0, 0);

  //     const element = document.createElement( 'div' );
  //     element.style.width = '1000px';
  //     element.style.height = '1000px';
  //     element.style.opacity = 1;
  //     element.style.background = new THREE.Color( 0xff0000 ).getStyle();

  //     const object = new CSS3DObject( element );
  //     object.rotateX(Math.PI/2);
  //     // object.position.x = Math.random() * 200 - 100;
  //     // object.position.y = Math.random() * 200 - 100;
  //     // object.position.z = Math.random() * 200 - 100;
  //     // object.rotation.x = Math.random();
  //     // object.rotation.y = Math.random();
  //     // object.rotation.z = Math.random();
  //     // object.scale.x = Math.random() + 0.5;
  //     // object.scale.y = Math.random() + 0.5;
  //     this.scene2.add( object );

  //     // Set rotation based on name
  //     // if (name === 'left') {
  //     //     textMesh.rotation.set(0, -Math.PI / 2, 0);
  //     // } else if (name === 'right') {
  //     //     textMesh.rotation.set(0, Math.PI / 2, 0);
  //     // } else if (name === 'top') {
  //     //     textMesh.rotation.set(0, 0, 0);
  //     // } else {
  //     //     textMesh.rotation.set(0, Math.PI, 0);
  //     // }

  //     // sprite.position.copy(textMesh.position);
  //     // sprite.rotation.copy(textMesh.rotation);

  //     // Add both sprite and textMesh to the scene or group
  //     // this.scene.add(sprite);
  //     // this.scene.add(textMesh);
  //     return object;
  // }

  //  createTextSprite(text, name) {
  //   const element = document.createElement('div');
  //       element.style.width = '10px';
  //     element.style.height = '10px';
  //   element.className = 'label';
  //   element.textContent = text;

  //   const fontSize = 2; // Adjust the font size as needed
  //   const padding = 2; // Adjust the padding as needed

  //   // Apply styles to the div
  //   element.style.font = `Bold ${fontSize}px Arial`;
  //   element.style.padding = `${padding}px`;
  //   element.style.color = 'red'; // Text color
  //   element.style.backgroundColor = 'white'; // Background color

  //   const object = new CSS3DObject(element);
  //   object.scale.set(0.1, 0.1, 0.1); // Adjust the scale as needed

  //   // Set position and rotation based on name
  //   if (name === 'left') {
  //       object.position.set(0, 0, 0);
  //       // object.rotation.set(0, -Math.PI / 2, 0);
  //   } else if (name === 'right') {
  //       object.position.set(0, 0, 0);
  //       // object.rotation.set(0, Math.PI / 2, 0);
  //   } else if (name === 'top') {
  //       object.position.set(0, 0, 0);
  //       // object.rotation.set(0, 0, 0);
  //   } else {
  //       object.position.set(0, 0, 0);
  //       // object.rotation.set(0, Math.PI, 0);
  //   }

  //   // this.scene2.add(object);

  //   return object;
  // }

  createTextSprite(
    text,
    fontSize = 12,
    textColor = "#ffffff",
    backgroundColor = "transparent"
  ) {
    // Create a canvas element
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");

    // Set font properties
    context.font = `${fontSize}px Arial`;

    // Measure text size
    const textMetrics = context.measureText(text);
    const width = 512;
    const height = 512;

    // Set canvas size based on text size
    canvas.width = width;
    canvas.height = height;

    // Clear the canvas
    context.clearRect(0, 0, canvas.width, canvas.height);

    // Set text properties
    context.font = `${fontSize}px Arial`;
    context.fillStyle = textColor;
    context.textAlign = "left";
    context.textBaseline = "middle";

    // Draw text on the canvas
    context.fillText(text, width / 2, height / 2);

    // Create a texture from the canvas
    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;

    // Calculate scale based on font size
    const scale = width / height;

    // Create a material using the texture
    const material = new THREE.SpriteMaterial({
      map: texture,
      color: 0x000000, // Set to white to use texture color
      transparent: true,
    });

    // Create a sprite using the material
    const sprite = new THREE.Sprite(material);

    // Set sprite scale based on font size
    sprite.scale.set(1, 1, 1);

    // Set sprite position, rotation, and other properties as needed
    // sprite.position.set(x, y, z);
    // sprite.rotation.set(rx, ry, rz);

    return sprite;
  }

  createLine(length, width, position, name) {
    const linePGeo = new THREE.PlaneGeometry(length, width);
    const linePMat = new THREE.MeshBasicMaterial({
      color: 0xe65c72,
      opacity: 0.7,
      transparent: true,
    });
    const linePlane = new THREE.Mesh(linePGeo, linePMat);
    linePlane.name = name;
    // const dragM = new THREE.Mesh(new THREE.PlaneGeometry(0.1,0.1),this.dragPlaneMat);
    const spriteMaterial = new THREE.SpriteMaterial({
      map: this.draicon,
    });
    const sprite = new THREE.Sprite(spriteMaterial);
    sprite.scale.set(0.3, 0.3, 0.3);
    sprite.name = name;
    // dragM.position.copy(position);
    linePlane.position.copy(position);
    linePlane.add(sprite);

    // const dimensionT = (this.floorLength*this.selectedTileDimension).toString()+this.selectedUnit

    linePlane.geometry.computeBoundingBox();
    const bb = linePlane.geometry.boundingBox;
    const c = bb.getCenter(new THREE.Vector3());
    let spritePosition, spriteRotataion, textSprite, dimensionT;
    const textOffest = 0.25;
    if (name === "left") {
      dimensionT =
        (this.floorLength * this.selectedTileDimension * this.conversionFactor)
          .toFixed(2)
          .toString() + this.selectedUnit;
      textSprite = this.createTextSprite(dimensionT);

      textSprite.position.set(textSprite.scale.x / 2 + 0.05, 0, 0);
      textSprite.material.rotation = Math.PI / 2;
      spritePosition = new THREE.Vector3(position.x, 0, 0);
      spriteRotataion = new THREE.Euler(-Math.PI / 2, 0, 0);
    } else if (name === "right") {
      dimensionT =
        (this.floorLength * this.selectedTileDimension * this.conversionFactor)
          .toFixed(2)
          .toString() + this.selectedUnit;
      textSprite = this.createTextSprite(dimensionT);
      textSprite.position.set(textOffest, 0, 0);
      textSprite.position.set(textSprite.scale.x / 2 - 0.95, 0, 0);
      textSprite.material.rotation = Math.PI / 2;
      spritePosition = new THREE.Vector3(position.x, 0, 0);
      spriteRotataion = new THREE.Euler(Math.PI / 2, 0, 0);
    } else if (name === "top") {
      dimensionT =
        (this.floorWidth * this.selectedTileDimension * this.conversionFactor)
          .toFixed(2)
          .toString() + this.selectedUnit;
      textSprite = this.createTextSprite(dimensionT);
      textSprite.position.set(0, 0, 0);
      textSprite.position.set(0, -textSprite.scale.y / 2 - 0.25, 0);
      spritePosition = new THREE.Vector3(0, position.y + width, 0);
      spriteRotataion = new THREE.Euler(0, 0, 0);
    } else {
      dimensionT =
        (this.floorWidth * this.selectedTileDimension * this.conversionFactor)
          .toFixed(2)
          .toString() + this.selectedUnit;
      textSprite = this.createTextSprite(dimensionT);
      textSprite.position.set(0, -textOffest, 0);
      textSprite.position.set(0, -textSprite.scale.y / 2 + 0.65, 0);
      spritePosition = new THREE.Vector3(0, position.y - width, 0);
      spriteRotataion = new THREE.Euler(Math.PI, 0, 0);
    }
    linePlane.add(textSprite);
    linePlane.isDraggable = true;

    // textSprite.position.set(textOffest,0,0);
    // this.createLineSprite(spritePosition, spriteRotataion)

    // this.scene.add(linePlane);

    this.lineGroup.add(linePlane);
    this.objects.push(linePlane);
  }

  createLineCustomLayout(length, width, position, name) {
    const linePGeo = new THREE.PlaneGeometry(length, width);
    const linePMat = new THREE.MeshBasicMaterial({
      color: 0xe65c72,
      opacity: 0.7,
      transparent: true,
    });

    const linePlane = new THREE.Mesh(linePGeo, linePMat);
    linePlane.name = name;
    // const dragM = new THREE.Mesh(new THREE.PlaneGeometry(0.1,0.1),this.dragPlaneMat);
    const spriteMaterial = new THREE.SpriteMaterial({
      map: this.draicon,
    });
    const sprite = new THREE.Sprite(spriteMaterial);
    sprite.scale.set(0.1, 0.1, 1);
    sprite.name = name;
    // dragM.position.copy(position);
    linePlane.position.copy(position);
    linePlane.add(sprite);

    // const dimensionT = (this.floorLength*this.selectedTileDimension).toString()+this.selectedUnit
    linePlane.geometry.computeBoundingBox();
    const bb = linePlane.geometry.boundingBox;
    const c = bb.getCenter(new THREE.Vector3());
    let spritePosition, spriteRotataion, textSprite, dimensionT;
    const textOffest = 0.25;
    console.log(this.selectedUnit);
    if (name === "left") {
      dimensionT =
        (
          (this.upperLength + this.lowerLength) *
          this.selectedTileDimension *
          this.conversionFactor
        )
          .toFixed(2)
          .toString() + this.selectedUnit;
      textSprite = this.createTextSprite(dimensionT);
      textSprite.position.set(textSprite.scale.x / 2, 0, 0);
      textSprite.material.rotation = Math.PI / 2;
      // spritePosition = new THREE.Vector3(position.x, 0, 0);
      // spriteRotataion = new THREE.Euler(-Math.PI / 2, 0, 0);
    } else if (name === "rightU") {
      dimensionT =
        (this.upperLength * this.selectedTileDimension * this.conversionFactor)
          .toFixed(2)
          .toString() + this.selectedUnit;
      textSprite = this.createTextSprite(dimensionT);
      textSprite.position.set(textOffest, 0, 0);
      textSprite.position.set(textSprite.scale.x / 2 - 0.85, 0, 0);
      textSprite.material.rotation = Math.PI / 2;
      spritePosition = new THREE.Vector3(position.x, 0, 0);
      spriteRotataion = new THREE.Euler(Math.PI / 2, 0, 0);
    } else if (name === "top") {
      dimensionT =
        (this.upperWidth * this.selectedTileDimension * this.conversionFactor)
          .toFixed(2)
          .toString() + this.selectedUnit;
      textSprite = this.createTextSprite(dimensionT);
      textSprite.position.set(0, 0, 0);
      textSprite.position.set(0, -textSprite.scale.y / 2 - 0.2, 0);
      // spritePosition = new THREE.Vector3(0, position.y + width, 0);
      // spriteRotataion = new THREE.Euler(0, 0, 0);
    } else if (name === "bot") {
      dimensionT =
        (this.lowerWidth * this.selectedTileDimension * this.conversionFactor)
          .toFixed(2)
          .toString() + this.selectedUnit;
      textSprite = this.createTextSprite(dimensionT);
      textSprite.position.set(0, -textOffest, 0);
      textSprite.position.set(0, -textSprite.scale.y / 2 + 0.55, 0);
      // spritePosition = new THREE.Vector3(0, position.y - width, 0);
      // spriteRotataion = new THREE.Euler(Math.PI, 0, 0);
    } else if (name === "botMid") {
      dimensionT =
        (
          (this.upperWidth - this.lowerWidth) *
          this.selectedTileDimension *
          this.conversionFactor
        )
          .toFixed(2)
          .toString() + this.selectedUnit;
      textSprite = this.createTextSprite(dimensionT);
      textSprite.position.set(0, -textOffest, 0);
      textSprite.position.set(0, -textSprite.scale.y / 2 + 0.55, 0);
      spritePosition = new THREE.Vector3(0, position.y - width, 0);
      spriteRotataion = new THREE.Euler(Math.PI, 0, 0);
    } else if (name === "rightL") {
      dimensionT =
        (this.lowerLength * this.selectedTileDimension * this.conversionFactor)
          .toFixed(2)
          .toString() + this.selectedUnit;
      textSprite = this.createTextSprite(dimensionT);
      textSprite.position.set(textOffest, 0, 0);
      textSprite.position.set(textSprite.scale.x / 2 - 0.85, 0, 0);
      textSprite.material.rotation = Math.PI / 2;
      spritePosition = new THREE.Vector3(0, position.y - width, 0);
      spriteRotataion = new THREE.Euler(Math.PI, 0, 0);
    }

    linePlane.isDraggable = true;
    linePlane.add(textSprite);
    // textSprite.position.set(textOffest,0,0);
    // this.createLineSprite(spritePosition, spriteRotataion)

    // this.scene.add(linePlane);
    // this.lineGrpSprited.add(textSprite);
    this.lineGroup.add(linePlane);
    this.objects.push(linePlane);
  }

  changeMeasureUnit(isMeter) {
    console.log(isMeter);
    this.isMeter = !isMeter;
    this.UpdateDimensions(
      this.floorLength,
      this.floorWidth,
      this.floorbottomHeight,
      this.floorbottomWidth
    );
    // if (isMeter) {
    //   this.selectedUnit = " M";
    //   this.conversionFactor = 1;
    // } else {
    //   this.selectedUnit = " FT";
    //   this.conversionFactor = 3.28;
    // }
  }

  changeSelectedTile(isSmoothPvcSelected) {
    if (isSmoothPvcSelected) {
      this.selectedTileDimension = this.standardSmoothTileDim;
      this.selectedTilePrice = 38.4;
      this.updateFloorMaterial(
        "https://cdn.shopify.com/s/files/1/0620/9817/8148/files/Premium.png?v=1703159876"
      );
    } else {
      this.selectedTileDimension = this.standardVTileDim;
      this.selectedTilePrice = 35.4;
      this.updateFloorMaterial(
        "https://cdn.shopify.com/s/files/1/0620/9817/8148/files/vented.jpg?v=1702842587"
      );
    }
  }

  createLineSprite(position, rotation) {
    // Create a sprite for the text
    const text = "Center Text";
    const spriteCanvas = document.createElement("canvas");
    const spriteContext = spriteCanvas.getContext("2d");
    spriteContext.font = "Bold 12px Arial";
    spriteContext.fillStyle = "black";
    spriteContext.fillText(text, 10, 10); // Position the text in the center

    const spriteTexture = new THREE.CanvasTexture(spriteCanvas);
    const spriteMaterial = new THREE.SpriteMaterial({
      map: spriteTexture,
    });
    const textSprite = new THREE.Sprite(spriteMaterial);
    // console.log(line);
    // // Position the text sprite at the center of the line
    // const startPoint = line.vertices[0];
    // const endPoint = line.vertices[line.geometry.vertices.length - 1];

    // Calculate the center of the line
    // const center = new THREE.Vector3().copy(startPoint).add(endPoint).multiplyScalar(0.5); //    const lineCenter = new THREE.Vector3(1.5, 0, 0); // Assuming line starts at (0,0,0) and ends at (3,0,0)
    textSprite.rotation.set(rotation.x, rotation.y, rotation.z);
    textSprite.position.copy(position);

    // Add the text sprite to the scene
    this.lineGroup.add(textSprite);
    // this.scene.add(textSprite);
  }
  addFloorMatsNew(Length, Width) {
    this.scene.remove(this.widthGrp);
    this.lengthGrp = new THREE.Group();
    this.widthGrp = new THREE.Group();
    const n = Length / this.stdLength;

    const linemat = new THREE.LineBasicMaterial({
      color: 0xff0000,
      linewidth: 10,
      linecap: "round", //ignored by WebGLRenderer
      linejoin: "round",
    });
    // this.createLine([5, 5, 0], [5, -5, 0], 'right'); //v1
    // this.createLine([-5, 5, 0], [-5, -5, 0], 'left'); //v2
    // this.createLine([-5, 5, 0], [5, 5, 0], 'top'); //h1
    // this.createLine([-5, -5, 0], [5, -5, 0], 'bot'); //h2

    const panel = this.panel.clone();
    panel.name = "panel";

    this.camera.lookAt(this.panel.position);
    this.panel.geometry.computeBoundingBox();
    const floorBB = this.panel.geometry.boundingBox; //new THREE.Box3();
    // floorBB.setFromObject(this.widthGrp); //.computeBoundingBox();
    let floorBBMax = floorBB.max;
    let floorBBMin = floorBB.min;
    this.lineGroup = new THREE.Group();
    this.objects = [];
    this.createLine(
      0.5,
      this.floorWidth,
      new THREE.Vector3(floorBBMax.x, 0, 0),
      "right"
    ); //[floorBBMax.x, floorBBMax.y, 0], [floorBBMax.x, floorBBMin.y, 0], 'right'); //v1
    // this.createLine(0.2, this.floorWidth, new THREE.Vector3(-floorBBMax.x,0,0),'left');//([floorBBMin.x, floorBBMax.y, 0], [floorBBMin.x, floorBBMin.y, 0], 'left'); //v2
    // this.createLine(this.floorLength, 0.2, new THREE.Vector3(0,floorBBMax.y,0),'top');//([floorBBMin.x, floorBBMax.y, 0], [floorBBMax.x, floorBBMax.y, 0], 'top'); //h1
    // this.createLine(this.floorLength, 0.2, new THREE.Vector3(0,-floorBBMax.y,0),'bot');//([floorBBMin.x, floorBBMin.y, 0], [floorBBMax.x, floorBBMin.y, 0], 'bot');
    // this.scene.add(this.lineGroup);
    // this.controls.target.set(this.panel.position)
    // this.scene.add(this.panel);
  }
  createFloorPattern(scene, upperWidth, lowerWidth, upperLength, lowerLength) {
    this.lg1 = new THREE.Group();
    this.lg2 = new THREE.Group();
    for (let i = 0; i < upperWidth; i++) {
      const panel = this.panel1.clone();
      panel.position.set(i + this.stdWidth, 0, 0);
      this.lg1.add(panel);
      // this.objects.push(this.lengthGrp);
    }
    for (let i = 0; i < lowerWidth; i++) {
      const panel = this.panel1.clone();
      panel.position.set(i + this.stdWidth, 0, 0);
      this.lg2.add(panel);
      // this.objects.push(this.lengthGrp);
    }
    for (let i = 0; i < upperLength + lowerLength; i++) {
      if (i < upperLength) {
        const grp = this.lg1.clone();
        grp.position.set(0, -(i + this.stdLength), 0);
        this.widthGrp.add(grp);
      } else {
        const grp = this.lg2.clone();
        grp.position.set(0, -(i + this.stdLength), 0);
        this.widthGrp.add(grp);
      }
    }
  }

  // Add your renderer, camera, and other necessary components to view the scene.

  addFloorMats(Length, Width) {
    this.scene.remove(this.widthGrp);
    this.scene.remove(this.lineGroup);
    this.scene.remove(this.lineGrpSprited);

    this.lengthGrp = new THREE.Group();
    this.widthGrp = new THREE.Group();
    if (!this.isCustomLayout) {
      if (this.selectedPattern === "No Pattern") {
        const l = Length / this.stdLength;
        const w = Width / this.stdWidth;

        for (let i = 0; i < w; i++) {
          const panel = this.panel1.clone();
          panel.position.set(i + this.stdLength, 0, 0);
          this.lengthGrp.add(panel);
          // this.objects.push(this.lengthGrp);
        }
        this.lengthGrp.position.set(0, 0, 0);
        for (let i = 0; i < l; i++) {
          const grp = this.lengthGrp.clone();
          grp.position.set(0, i + this.stdWidth, 0);
          this.widthGrp.add(grp);
        }
        this.widthGrp.position.set(0, 0, 0);

        const groupCenter = new THREE.Vector3();
        const groupBox = new THREE.Box3().setFromObject(this.widthGrp);
        groupBox.getCenter(groupCenter);
        const translationVector = new THREE.Vector3(0, 0, 0).sub(groupCenter);
        this.widthGrp.position.add(translationVector);

        // Update the camera to fit the centered group within the view
        const boundingBox = new THREE.Box3().setFromObject(this.widthGrp);
        const center = boundingBox.getCenter(new THREE.Vector3());
        const size = boundingBox.getSize(new THREE.Vector3());

        const halfSize = size.clone().multiplyScalar(0.5);

        // Calculate the distance from the camera to the group based on the group's size
        // Adjust this value as needed for your scene
        const distance =
          halfSize.length() / Math.tan((this.camera.fov / 2) * (Math.PI / 180));

        this.camera.position.copy(
          center.clone().add(new THREE.Vector3(0, 0, distance))
        );

        // You may also want to look at the center of the group
        this.camera.lookAt(center);
        this.addResizeControls();
        // this.scene.add(this.widthGrp);
      } else if (this.selectedPattern === "Checked")
        this.addUpdateCheckedPattern(this.floorLength, this.floorWidth);
      else if (this.selectedPattern == "Box")
        this.addUpdateSquarePattern(this.floorLength, this.floorWidth);
    } else {
      if (this.selectedPattern === "No Pattern") {
        console.log(
          this.upperWidth,
          this.upperLength,
          this.lowerWidth,
          this.lowerLength
        );
        this.createFloorPattern(
          this.scene,
          this.upperWidth,
          this.lowerWidth,
          this.upperLength,
          this.lowerLength
        );
        this.widthGrp.position.set(0, 0, 0);

        const groupCenter = new THREE.Vector3();
        const groupBox = new THREE.Box3().setFromObject(this.widthGrp);
        groupBox.getCenter(groupCenter);
        const translationVector = new THREE.Vector3(0, 0, 0).sub(groupCenter);
        this.widthGrp.position.add(translationVector);

        // Update the camera to fit the centered group within the view
        const boundingBox = new THREE.Box3().setFromObject(this.widthGrp);
        const center = boundingBox.getCenter(new THREE.Vector3());
        const size = boundingBox.getSize(new THREE.Vector3());

        const halfSize = size.clone().multiplyScalar(0.5);

        // Calculate the distance from the camera to the group based on the group's size
        // Adjust this value as needed for your scene
        const distance =
          halfSize.length() / Math.tan((this.camera.fov / 2) * (Math.PI / 180));

        this.camera.position.copy(
          center.clone().add(new THREE.Vector3(0, 0, distance))
        );

        // You may also want to look at the center of the group
        this.camera.lookAt(center);
        this.addResizeControls();
        // this.scene.add(this.widthGrp);
        return;
      } else if (this.selectedPattern === "Checked") {
        this.upperWidth % 2 === 0
          ? (this.upperWidth = this.upperWidth)
          : (this.upperWidth -= 1);
        this.upperLength % 2 === 0
          ? (this.upperLength = this.upperLength)
          : (this.upperLength -= 1);
        this.lowerWidth % 2 === 0
          ? (this.lowerWidth = this.lowerWidth)
          : (this.lowerWidth -= 1);
        this.lowerLength % 2 === 0
          ? (this.lowerLength = this.lowerLength)
          : (this.lowerLength -= 1);
        this.addUpdateCheckedPatternLayout(this.floorLength, this.floorWidth);
      } else if (this.selectedPattern == "Box")
        this.addUpdateSquarePattern(this.floorLength, this.floorWidth);
    }
  }

  createPatch() {
    // const l = Length / this.stdLength;
    // const w = Width / this.stdWidth;
    let patch = new THREE.Group();
    let oM = new THREE.Group();
    let mat = new THREE.MeshBasicMaterial({
      map: this.currentTexture,
      opacity: 0.9,
      side: THREE.DoubleSide,
      transparent: true,
    });

    const panel = this.panel1.clone();
    panel.material = mat.clone();
    panel.material.color = new THREE.Color(this.PrimaryColor);
    panel.position.set(0, 0, 0);
    patch.add(panel.clone());

    panel.material = mat.clone();
    panel.material.color = new THREE.Color(this.secondaryColor);
    panel.position.set(1, 0, 0);
    patch.add(panel.clone());

    panel.material = mat.clone();
    panel.material.color = new THREE.Color(this.secondaryColor);
    panel.position.set(0, 1, 0);
    patch.add(panel.clone());

    panel.material = mat.clone();
    panel.material.color = new THREE.Color(this.PrimaryColor);
    panel.position.set(1, 1, 0);
    patch.add(panel.clone());
    patch.position.set(0, 0, 0);
    return patch;
  }
  addUpdateCheckedPattern(Length, Width) {
    const l = Length / this.stdLength;
    const w = Width / this.stdWidth;
    let mat = new THREE.MeshBasicMaterial({
      map: this.currentTexture,
      opacity: 0.9,
      side: THREE.DoubleSide,
      transparent: true,
    });
    for (let i = 0; i < Math.round(w); i += 2) {
      const panel = this.createPatch(); //patch.clone();
      if (i == 0) panel.position.set(0, 0, 0);
      else panel.position.set(i, 0, 0);
      this.lengthGrp.add(panel.clone());
    }
    // this.widthGrp.add(this.lengthGrp);
    for (let i = 0; i < l; i += 2) {
      const grp = this.lengthGrp.clone();
      grp.position.set(0, i, 0);
      this.widthGrp.add(grp);
    }
    this.widthGrp.position.set(0, 0, 0);
    this.widthGrp.rotateX(0);
    this.widthGrp.rotateY(0);
    this.widthGrp.rotateZ(0);

    const groupCenter = new THREE.Vector3();
    const groupBox = new THREE.Box3().setFromObject(this.widthGrp);
    groupBox.getCenter(groupCenter);
    const translationVector = new THREE.Vector3(0, 0, 0).sub(groupCenter);
    this.widthGrp.position.add(translationVector);

    // Update the camera to fit the centered group within the view
    const boundingBox = new THREE.Box3().setFromObject(this.widthGrp);
    const center = boundingBox.getCenter(new THREE.Vector3());
    const size = boundingBox.getSize(new THREE.Vector3());

    const halfSize = size.clone().multiplyScalar(0.5);

    // Calculate the distance from the camera to the group based on the group's size
    // Adjust this value as needed for your scene
    const distance =
      halfSize.length() / Math.tan((this.camera.fov / 2) * (Math.PI / 180));

    this.camera.position.copy(
      center.clone().add(new THREE.Vector3(0, 0, distance))
    );

    // You may also want to look at the center of the group
    this.camera.lookAt(center);
    const lOff = this.floorLength % 2 !== 0 ? 1 : 0;
    const wOff = this.floorWidth % 2 !== 0 ? 1 : 0;
    this.addResizeControls(lOff, wOff);
    // this.scene.add(this.widthGrp);
  }

  addUpdateCheckedPatternLayout(Length, Width) {
    const l = Length / this.stdLength;
    const w = Width / this.stdWidth;
    let mat = new THREE.MeshBasicMaterial({
      map: this.currentTexture,
      opacity: 0.9,
      side: THREE.DoubleSide,
      transparent: true,
    });
    // for (let i = 0; i < Math.round(w); i += 2) {
    //   const panel = this.createPatch(); //patch.clone();
    //   if (i == 0) panel.position.set(0, 0, 0);
    //   else panel.position.set(i, 0, 0);
    //   this.lengthGrp.add(panel.clone());
    // }
    this.lg1 = new THREE.Group();
    this.lg2 = new THREE.Group();
    for (let i = 0; i < this.upperWidth; i += 2) {
      const panel = this.createPatch(); //patch.clone();
      if (i == 0) panel.position.set(0, 0, 0);
      else panel.position.set(i, 0, 0);
      this.lg1.add(panel.clone());
    }
    for (let i = 0; i < this.lowerWidth; i += 2) {
      const panel = this.createPatch(); //patch.clone();
      if (i == 0) panel.position.set(0, 0, 0);
      else panel.position.set(i, 0, 0);
      this.lg2.add(panel.clone());
    }
    for (let i = 0; i < this.upperLength + this.lowerLength; i += 2) {
      if (i < this.upperLength) {
        const grp = this.lg1.clone();
        grp.position.set(0, -(i + this.stdLength), 0);
        this.widthGrp.add(grp);
      } else {
        const grp = this.lg2.clone();
        grp.position.set(0, -(i + this.stdLength), 0);
        this.widthGrp.add(grp);
      }
    }

    console.log(
      this.upperWidth,
      this.upperLength,
      this.lowerWidth,
      this.lowerLength
    );
    const groupCenter = new THREE.Vector3();
    const groupBox = new THREE.Box3().setFromObject(this.widthGrp);
    groupBox.getCenter(groupCenter);
    const translationVector = new THREE.Vector3(0, 0, 0).sub(groupCenter);
    this.widthGrp.position.add(translationVector);

    // Update the camera to fit the centered group within the view
    const boundingBox = new THREE.Box3().setFromObject(this.widthGrp);
    const center = boundingBox.getCenter(new THREE.Vector3());
    const size = boundingBox.getSize(new THREE.Vector3());

    const halfSize = size.clone().multiplyScalar(0.5);

    // Calculate the distance from the camera to the group based on the group's size
    // Adjust this value as needed for your scene
    const distance =
      halfSize.length() / Math.tan((this.camera.fov / 2) * (Math.PI / 180));

    this.camera.position.copy(
      center.clone().add(new THREE.Vector3(0, 0, distance))
    );

    // You may also want to look at the center of the group
    this.camera.lookAt(center);
    const lOff = this.upperWidth % 2 !== 0 ? 1 : 0;
    const wOff = this.upperLength % 2 !== 0 ? 1 : 0;
    this.addResizeControls(0, 0);
    // this.scene.add(this.widthGrp);
  }

  CreateAddSquare(l, w) {
    const squarePattern = new THREE.Group();
    let n = 5; // row or column count
    // defining an empty string
    let string = "";

    for (let j = 0; j < l; j++) {
      if (j == 0 || j == l - 1) {
        for (let i = 0; i < w; i++) {
          const panel = this.panel2.clone();
          panel.material.color = new THREE.Color(this.secondaryColor);
          panel.position.set(i + this.stdLength, j, 0);
          squarePattern.add(panel);
          // this.objects.push(this.lengthGrp);
        }
      } else {
        for (let i = 0; i < w; i++) {
          if (i == 0 || i == w - 1) {
            const panel = this.panel2.clone();
            panel.material.color = new THREE.Color(this.secondaryColor);
            panel.position.set(i + this.stdLength, j, 0);
            squarePattern.add(panel);
          }
          // this.objects.push(this.lengthGrp);
        }
      }
    }
    squarePattern.position.set(1, 2, 0);
    this.widthGrp.add(squarePattern);
    // this.scene.add(squarePattern)
  }
  // printing the string

  addUpdateSquarePattern(Length, Width) {
    for (let i = 0; i < Width; i++) {
      const panel = this.panel1.clone();
      panel.material.color = new THREE.Color(this.PrimaryColor);
      panel.position.set(i + this.stdLength, 0, 0);
      this.lengthGrp.add(panel);
      // this.objects.push(this.lengthGrp);
    }
    this.lengthGrp.position.set(0, 0, 0);
    for (let i = 0; i < Length; i++) {
      const grp = this.lengthGrp.clone();
      grp.position.set(0, i + this.stdWidth, 0);
      this.widthGrp.add(grp);
    }
    this.widthGrp.position.set(0, 0, 0);
    this.CreateAddSquare(Length - 2, Width - 2);

    const groupCenter = new THREE.Vector3();
    const groupBox = new THREE.Box3().setFromObject(this.widthGrp);
    groupBox.getCenter(groupCenter);
    const translationVector = new THREE.Vector3(0, 0, 0).sub(groupCenter);
    this.widthGrp.position.add(translationVector);

    // Update the camera to fit the centered group within the view
    const boundingBox = new THREE.Box3().setFromObject(this.widthGrp);
    const center = boundingBox.getCenter(new THREE.Vector3());
    const size = boundingBox.getSize(new THREE.Vector3());

    const halfSize = size.clone().multiplyScalar(0.5);

    // Calculate the distance from the camera to the group based on the group's size
    // Adjust this value as needed for your scene
    const distance =
      halfSize.length() / Math.tan((this.camera.fov / 2) * (Math.PI / 180));

    this.camera.position.copy(
      center.clone().add(new THREE.Vector3(0, 0, distance))
    );

    // You may also want to look at the center of the group
    this.camera.lookAt(center);
    this.addResizeControls();
    // this.scene.add(this.widthGrp);
    return;
  }
  addResizeControls(lOff = 0, wOff = 0) {
    if (!this.isCustomLayout) {
      const floorBB = new THREE.Box3();
      floorBB.setFromObject(this.widthGrp); //.computeBoundingBox();
      let floorBBMax = floorBB.max;
      let floorBBMin = floorBB.min;
      this.lineGroup = new THREE.Group();
      this.objects = [];
      this.createLine(
        0.15,
        this.floorLength + lOff + 0.1,
        new THREE.Vector3(floorBBMax.x, 0, 0),
        "right"
      ); //[floorBBMax.x, floorBBMax.y, 0], [floorBBMax.x, floorBBMin.y, 0], 'right'); //v1
      this.createLine(
        0.15,
        this.floorLength + lOff + 0.1,
        new THREE.Vector3(-floorBBMax.x, 0, 0),
        "left"
      ); //([floorBBMin.x, floorBBMax.y, 0], [floorBBMin.x, floorBBMin.y, 0], 'left'); //v2
      this.createLine(
        this.floorWidth + wOff + 0.1,
        0.15,
        new THREE.Vector3(0, floorBBMax.y, 0),
        "top"
      ); //([floorBBMin.x, floorBBMax.y, 0], [floorBBMax.x, floorBBMax.y, 0], 'top'); //h1
      this.createLine(
        this.floorWidth + wOff + 0.1,
        0.15,
        new THREE.Vector3(0, -floorBBMax.y, 0),
        "bot"
      ); //([floorBBMin.x, floorBBMin.y, 0], [floorBBMax.x, floorBBMin.y, 0], 'bot');
      // this.scene.add(this.lineGroup);
    } else {
      const floorBB = new THREE.Box3();
      floorBB.setFromObject(this.widthGrp); //.computeBoundingBox();
      let floorBBMax = floorBB.max;
      let floorBBMin = floorBB.min;
      this.lineGroup = new THREE.Group();
      this.lineGrpSprited = new THREE.Group();
      this.objects = [];
      this.createLineCustomLayout(
        this.upperWidth + wOff + 0.1,
        0.1,
        new THREE.Vector3(0, floorBBMax.y, 0),
        "top"
      ); //([floorBBMin.x, floorBBMax.y, 0], [floorBBMax.x, floorBBMax.y, 0], 'top'); //h1
      this.createLineCustomLayout(
        this.lowerWidth + wOff + 0.1,
        0.1,
        new THREE.Vector3(
          -floorBBMax.x + this.lowerWidth / 2,
          -floorBBMax.y,
          0
        ),
        "bot"
      ); //([floorBBMin.x, floorBBMin.y, 0], [floorBBMax.x, floorBBMin.y, 0], 'bot');
      this.createLineCustomLayout(
        0.1,
        this.upperLength + this.lowerLength + lOff + 0.1,
        new THREE.Vector3(-floorBBMax.x, 0, 0),
        "left"
      ); //left
      this.createLineCustomLayout(
        this.upperWidth - this.lowerWidth + wOff + 0.1,
        0.1,
        new THREE.Vector3(
          this.lowerWidth / 2,
          floorBBMax.y - this.upperLength,
          0
        ),
        "botMid"
      ); //botmid
      this.createLineCustomLayout(
        0.1,
        this.upperLength + lOff + 0.1,
        new THREE.Vector3(
          this.upperWidth / 2,
          floorBBMax.y - this.upperLength / 2,
          0
        ),
        "rightU"
      ); //[floorBBMax.x, floorBBMax.y, 0], [floorBBMax.x, floorBBMin.y, 0], 'right'); //v1

      this.createLineCustomLayout(
        0.1,
        this.lowerLength + lOff + 0.1,
        new THREE.Vector3(
          -floorBBMax.x + this.lowerWidth,
          -floorBBMax.y + this.lowerLength / 2,
          0
        ),
        "rightL"
      ); //lowrl

      // this.scene.add(this.lineGroup);
      this.lineGrpSprited.position.set(0, 0, 0);
      // this.scene.add(this.lineGrpSprited);
    }
  }
  createRectLayout(Layout, width, height) {
    // width = Math.round(width);
    // height = Math.round(height);
    console.log("rect layout");
    const geometry = new THREE.PlaneGeometry(0.5, 0.5);
    let mat2 = this.panel1.material.clone();
    if (this.selectedPattern === "Checked") mat2 = this.panel2.material.clone();
    let mat1 = this.panel1.material.clone();
    const plane = new THREE.Mesh(geometry, mat1);
    // mat1.map.offset.set()
    mat1.map.repeat.set(1, 1);
    mat1.map.wrapS = mat1.map.wrapT = THREE.MirroredRepeatWrapping;
    let singleRow = new THREE.Group();
    // singleRow.position.set(-0.25, 0.25, 0);
    let offsetX = 0;
    let paternswap = false;
    for (let w = 0; w < width - 0.5; w += 0.5) {
      const element = plane.clone();
      if (paternswap) element.material = mat2;
      paternswap = !paternswap;
      element.position.set(offsetX, 0, 0);
      singleRow.add(element);
      offsetX += 0.5;
    }
    if (offsetX < width) {
      let remwidth = width - offsetX;
      let geometry2 = new THREE.PlaneGeometry(remwidth, 0.5);
      const element = new THREE.Mesh(geometry2, mat1);
      if (paternswap) element.material = mat2;
      paternswap = !paternswap;
      element.position.set(offsetX - 0.25 + remwidth / 2, 0, 0);
      singleRow.add(element);
    }
    offsetX = 0;
    paternswap = true;
    for (let w = 0; w < width - 0.5; w += 0.5) {
      const element = plane.clone();
      if (paternswap) element.material = mat2;
      paternswap = !paternswap;
      element.position.set(offsetX, 0.5, 0);
      singleRow.add(element);
      offsetX += 0.5;
    }
    console.log("offsetX", offsetX, width);
    if (offsetX < width) {
      let remwidth = width - offsetX;
      let geometry2 = new THREE.PlaneGeometry(remwidth, 0.5);
      const element = new THREE.Mesh(geometry2, mat1);
      if (paternswap) element.material = mat2;
      paternswap = !paternswap;
      element.position.set(offsetX - 0.25 + remwidth / 2, 0.5, 0);
      singleRow.add(element);
    }
    let offsetY = 0.25;
    for (let h = 0; h < height - 0.99; h += 1) {
      const element = singleRow.clone();
      element.position.set(0.25, offsetY, 0);
      Layout.add(element);
      offsetY += 1;
    }
    if (height - Math.abs(offsetY - 1.25) > 0 && offsetY - 0.25 < height) {
      let remheight = height - (offsetY - 0.25);
      paternswap = false;
      for (let h = 0; h < remheight; h += 0.5) {
        let updateHeight = 0;
        if (h !== 0) paternswap = true;
        if (remheight > 0.5) {
          if (h === 0) updateHeight = 0.5;
          else updateHeight = remheight - 0.5;
        } else updateHeight = remheight;
        let geometry2 = new THREE.PlaneGeometry(0.5, updateHeight);
        offsetX = 0;

        for (let w = 0; w < width - 0.5; w += 0.5) {
          const element = new THREE.Mesh(geometry2, mat1);
          // if (h === 0)
          // if (w % 1 === 0 && w !== 0) element.material = mat2;
          // else
          if (paternswap) element.material = mat2;
          paternswap = !paternswap;
          element.position.set(
            offsetX + 0.25,
            offsetY - 0.25 + updateHeight / 2,
            0
          );
          Layout.add(element);
          offsetX += 0.5;
        }
        if (offsetX < width) {
          let remwidth = width - offsetX;
          let geometry2 = new THREE.PlaneGeometry(remwidth, updateHeight);
          const element = new THREE.Mesh(geometry2, mat1);
          if (paternswap) element.material = mat2;
          paternswap = !paternswap;
          element.position.set(
            offsetX + remwidth / 2,
            offsetY - 0.25 + updateHeight / 2,
            0
          );
          Layout.add(element);
        }
        offsetY += 0.5;
      }

      // if (offsetX < width) {
      //   const element = plane.clone();
      //   if ((width / 2) % 4 === 0) element.material = mat2;
      //   element.position.set(offsetX + 0.25, offsetY, 0);
      //   Layout.add(element);
      // }
    }
  }
  createSecondLayerCustom(Layout, width, height, bottomWidth, bottomHeight) {
    width = Math.round(width);
    height = Math.round(height);
    bottomWidth = Math.round(bottomWidth);
    bottomHeight = Math.round(bottomHeight);
    const geometry = new THREE.PlaneGeometry(0.25, 0.25);

    let mat1 = this.panel1.material.clone();
    const plane = new THREE.Mesh(geometry, mat1);
    plane.material = this.panel2.material.clone();
    plane.material.map = plane.material.map.clone();
    plane.material.map.repeat.set(0.5, 0.5);
    let SecondLayer = new THREE.Group();
    SecondLayer.position.set(0, 0, 0.01);
    Layout.add(SecondLayer);
    let offsetX = 0.25 + 0.25 / 2;
    for (let w = 0; w < width - 0.5; w += 0.25) {
      const element = plane.clone();

      element.position.set(offsetX, height - 0.25 - 0.25 / 2, 0);
      SecondLayer.add(element);
      offsetX += 0.25;
    }

    offsetX = 0.25 + 0.25 / 2;
    for (let w = 0; w < bottomWidth - 0.5; w += 0.25) {
      const element = plane.clone();

      element.position.set(offsetX, -bottomHeight + 0.25 + 0.25 / 2, 0);
      SecondLayer.add(element);
      offsetX += 0.25;
    }
    let remainingWidth = width - bottomWidth;
    offsetX = -0.25 / 2 + bottomWidth;
    for (let w = 0; w < remainingWidth; w += 0.25) {
      const element = plane.clone();

      element.position.set(offsetX, +0.25 + 0.25 / 2, 0);
      SecondLayer.add(element);
      offsetX += 0.25;
    }
    let offsetY = 0.75;
    for (let h = 0; h < height - 1; h += 0.25) {
      const element = plane.clone();
      element.position.set(
        width - 0.25 / 2 - 0.25,
        -0.25 + 0.25 / 2 + offsetY,
        0
      );
      SecondLayer.add(element);
      offsetY += 0.25;
    }
    offsetY = 0.75 - bottomHeight;
    console.log(width);
    for (let h = 0; h < bottomHeight; h += 0.25) {
      const element = plane.clone();
      element.position.set(
        bottomWidth - 0.25 / 2 - 0.25,
        -0.25 + 0.25 / 2 + offsetY,
        0
      );
      SecondLayer.add(element);
      offsetY += 0.25;
    }

    offsetY = 0.75 - bottomHeight;
    //  offsetY = 0.75;
    for (let h = 0; h < height + bottomHeight - 1; h += 0.25) {
      const element = plane.clone();
      element.position.set(0.25 + 0.25 / 2, -0.25 + 0.25 / 2 + offsetY, 0);
      SecondLayer.add(element);
      offsetY += 0.25;
    }
    offsetY = 0.75;
  }
  createSecondLayer(SecondLayer, width, height) {
    const geometry = new THREE.PlaneGeometry(0.25, 0.25);

    let mat1 = this.panel1.material.clone();
    const plane = new THREE.Mesh(geometry, mat1);
    plane.material = this.panel2.material.clone();
    plane.material.map = plane.material.map.clone();
    plane.material.map.repeat.set(0.5, 0.5);
    // let SecondLayer = new THREE.Group();
    // // SecondLayer.position.set(-width / 2 + 0.5, 0, 0.01);
    // Layout.add(SecondLayer);
    let offsetX = 0.25 + 0.25 / 2;
    for (let w = 0; w < width - 0.5; w += 0.25) {
      const element = plane.clone();

      element.position.set(offsetX, height - 0.25 - 0.25 / 2, 0);
      SecondLayer.add(element);
      offsetX += 0.25;
    }
    offsetX = 0.25 + 0.25 / 2;
    for (let w = 0; w < width - 0.5; w += 0.25) {
      const element = plane.clone();

      element.position.set(offsetX, 0.25 + 0.25 / 2, 0);
      SecondLayer.add(element);
      offsetX += 0.25;
    }
    let offsetY = 0.75;
    for (let h = 0; h < height - 1; h += 0.25) {
      const element = plane.clone();
      element.position.set(0.25 + 0.25 / 2, -0.25 + 0.25 / 2 + offsetY, 0);
      SecondLayer.add(element);
      offsetY += 0.25;
    }
    offsetY = 0.75;
    for (let h = 0; h < height - 1; h += 0.25) {
      const element = plane.clone();
      element.position.set(
        width - 0.25 / 2 - 0.25,
        -0.25 + 0.25 / 2 + offsetY,
        0
      );
      SecondLayer.add(element);
      offsetY += 0.25;
    }
  }
  DraggingEnable(isEnable) {
    this.Dragging = isEnable;
  }
  UpdateWidthHeight(width, height, bottomWidth, bottomHeight) {
    this.CreateLayout(height, width, bottomHeight, bottomWidth);
  }
  CreateLayout(height, width, bottomHeight, bottomWidth, isDraging) {
    console.log(height, width);
    height = Number(height.toFixed(2));
    width = Number(width.toFixed(2));
    if (bottomHeight) bottomHeight = Number(bottomHeight.toFixed(2));
    if (bottomWidth) bottomWidth = Number(bottomWidth.toFixed(2));
    this.floorLength = height;
    this.floorWidth = width;
    if (this.onUpdateLayout) this.onUpdateLayout();
    if (bottomWidth) {
      this.floorbottomWidth = bottomWidth;
      this.floorbottomHeight = bottomHeight;
    }

    if (this.Layout) this.scene.remove(this.Layout);
    if (this.LayoutBottom) this.scene.remove(this.LayoutBottom);
    if (this.LayoutSecond) this.scene.remove(this.LayoutSecond);
    this.Layout = new THREE.Group();
    this.LayoutBottom = new THREE.Group();
    this.LayoutSecond = new THREE.Group();
    this.Layout.position.set(-width / 2 + 0.25, -height / 2 - 0.25, 0);
    let { top, bottom, left, right, bottomRight, bottomTop } = this.getEdges();
    if (isDraging) {
      this.Layout.position.set(left.position.x, bottom.position.y, 0);
      if (bottomTop) {
        this.Layout.position.set(left.position.x, bottomTop.position.y, 0);
      }
      this.LayoutLeft = this.Layout.position.x;
      this.LayoutTop = this.Layout.position.y;
    } else {
      // if (this.LayoutLeft && this.LayoutTop) {
      //   this.Layout.position.set(this.LayoutLeft, this.LayoutTop, 0);
      // }
    }
    this.LayoutSecond.position.set(
      this.Layout.position.x,
      this.Layout.position.y,
      this.Layout.position.z
    );
    this.scene.add(this.Layout);
    this.scene.add(this.LayoutBottom);
    this.scene.add(this.LayoutSecond);
    if (this.isCustomLayout) {
      this.createRectLayout(this.Layout, width, height);
      let bottomGrp = new THREE.Group();
      if (!bottomTop || !isDraging)
        bottomGrp.position.set(
          -width / 2 + 0.25,
          -height / 2 - bottomHeight - 0.25,
          0
        );
      else
        bottomGrp.position.set(
          left.position.x,
          top.position.y - height - bottomHeight,
          0
        );
      this.LayoutBottom.add(bottomGrp);
      this.createRectLayout(bottomGrp, bottomWidth, bottomHeight);
      if (this.selectedPattern === "Box")
        this.createSecondLayerCustom(
          this.Layout,
          width,
          height,
          bottomWidth,
          bottomHeight
        );
    } else {
      this.createRectLayout(this.Layout, width, height);
      if (this.selectedPattern === "Box")
        this.createSecondLayer(this.LayoutSecond, width, height);
    }

    // console.log(offsetY * 2, height);
    if (!isDraging) {
      if (!this.isCustomLayout) {
        this.createEdgeLines(height, width);
      } else {
        this.createCustomEdgeLines(height, width, bottomHeight, bottomWidth);
      }
    } else this.UpdateDimensions(height, width, bottomHeight, bottomWidth);
    let price = 0;
    if (this.selectedVariant) {
      let squareFeet = this.floorLength * this.floorWidth;

      if (this.isCustomLayout) {
        squareFeet += this.floorbottomHeight * this.floorbottomWidth;
      }
      console.log("total meters", squareFeet * 10);
      let meterval = squareFeet;
      meterval = Math.ceil(meterval);
      price = Number(meterval * this.selectedVariant.price * 0.01).toFixed(2);
      publish("floorUpdated", {
        price: price,
        quantity: meterval,
      });
    }
  }
  createCustomEdgeLines(height, width, bottomHeight, bottomWidth) {
    if (this.Edges) this.scene.remove(this.Edges);
    this.Edges = new THREE.Group();
    // this.Edges.position.set(-width / 4, -height / 4, 0);
    this.scene.add(this.Edges);
    const geometry = new THREE.PlaneGeometry(this.lineWidth, height);
    const material = new THREE.MeshBasicMaterial({
      color: 0xff0000,
      side: THREE.DoubleSide,
    });

    const right = new THREE.Mesh(geometry, material);
    right.position.set(width / 2 + 0.25, -0.25, 0);
    // right.position.set(width / 2 - 0.5, height / 4 - 0.5, 0);
    const geometryLeft = new THREE.PlaneGeometry(
      this.lineWidth,
      height + bottomHeight
    );
    const left = new THREE.Mesh(geometryLeft, material);
    left.position.set(-width / 2 + 0.25, -0.25 - bottomHeight / 2, 0);

    const geometryHorz = new THREE.PlaneGeometry(
      width + this.lineWidth,
      this.lineWidth
    );
    const top = new THREE.Mesh(geometryHorz, material);
    top.position.set(0.25, height / 2 - 0.25, 0);

    // const bottom = top.clone();
    // bottom.position.set(width / 4 - 0.5, -0.5, 0);

    right.isDragLine = true;
    left.isDragLine = true;
    top.isDragLine = true;

    right.name = "right";
    left.name = "left";
    top.name = "top";

    this.Edges.add(left);
    this.Edges.add(right);
    this.Edges.add(top);
    // this.Edges.add(bottom);
    const geometryHorzb = new THREE.PlaneGeometry(
      bottomWidth + this.lineWidth,
      this.lineWidth
    );
    const bottom = new THREE.Mesh(geometryHorzb, material);
    bottom.position.set(
      -width / 2 + bottomWidth / 2 + 0.25,
      -height / 2 - bottomHeight - 0.25,
      0
    );

    const geometryBr = new THREE.PlaneGeometry(this.lineWidth, bottomHeight);
    const bottomRight = new THREE.Mesh(geometryBr, material);
    bottomRight.position.set(
      -width / 2 + bottomWidth + 0.25,
      -height / 2 - bottomHeight / 2 - 0.25,
      0
    );

    let widthDiff = width - bottomWidth;
    console.log("diff", widthDiff);
    const geometryHorzT = new THREE.PlaneGeometry(
      widthDiff + this.lineWidth,
      this.lineWidth
    );
    const bottomTop = new THREE.Mesh(geometryHorzT, material);
    bottomTop.position.set(
      -width / 2 + bottomWidth + widthDiff / 2 + 0.25,
      -height / 2 - 0.25,
      0
    );

    bottom.name = "bottom";
    bottom.isDragLine = true;
    this.Edges.add(bottom);

    bottomRight.name = "bottomright";
    bottomRight.isDragLine = true;
    this.Edges.add(bottomRight);

    bottomTop.name = "bottomtop";
    bottomTop.isDragLine = true;
    this.Edges.add(bottomTop);
    this.UpdateDimensions(height, width, bottomHeight, bottomWidth);
  }
  createEdgeLines(_height, _width) {
    let width = _width * 1;
    let height = _height * 1;
    let offset = 0.05;
    if (this.Edges) this.scene.remove(this.Edges);
    this.Edges = new THREE.Group();
    // this.Edges.position.set(width / 2, height / 2, 0);
    this.scene.add(this.Edges);
    const geometry = new THREE.PlaneGeometry(this.lineWidth, height);
    const material = new THREE.MeshBasicMaterial({
      color: 0xff0000,
      side: THREE.DoubleSide,
    });

    const right = new THREE.Mesh(geometry, material);
    right.position.set(width / 2 + 0.25, -0.25, 0);

    const left = right.clone();
    left.position.set(-width / 2 + 0.25, -0.25, 0);

    const geometryHorz = new THREE.PlaneGeometry(
      width + this.lineWidth,
      this.lineWidth
    );
    const top = new THREE.Mesh(geometryHorz, material);
    top.position.set(0.25, height / 2 - 0.25, 0);

    const bottom = top.clone();
    bottom.position.set(0.25, -height / 2 - 0.25, 0);

    right.isDragLine = true;
    left.isDragLine = true;
    top.isDragLine = true;
    bottom.isDragLine = true;
    right.name = "right";
    left.name = "left";
    top.name = "top";
    bottom.name = "bottom";
    this.Edges.add(left);
    this.Edges.add(right);
    this.Edges.add(top);
    this.Edges.add(bottom);
    this.UpdateDimensions(height, width, 0, 0);
  }
  UpdateDimensions(height, width, bottomHeight, bottomWidth) {
    let { top, bottom, left, right, bottomRight, bottomTop } = this.getEdges();

    let allLines = [top, bottom, left, right, bottomRight, bottomTop];
    for (let i = 0; i < allLines.length; i++) {
      const element = allLines[i];
      if (element) {
        for (let j = 0; j < element.children.length; j++) {
          const element2 = element.children[j];
          element.remove(element2);
        }
      }
    }
    let heightL = this.converToDisplayUnit(height.toFixed(2) * 10);
    let heightR = heightL;
    let widthT = this.converToDisplayUnit(width.toFixed(2) * 10);
    let widthB = widthT;
    let widthTop = 0;
    let heightRight = 0;
    if (this.isCustomLayout) {
      heightL = this.converToDisplayUnit((height + bottomHeight) * 10);
      widthB = this.converToDisplayUnit(bottomWidth * 10);
      heightRight = this.converToDisplayUnit(bottomHeight * 10);
      widthTop = this.converToDisplayUnit(Math.abs(width - bottomWidth) * 10);
      let textRightB = createText(heightRight, "black", this.textSize);
      textRightB.position.set(0.3, -0.25, 0.3);
      // textRightB.material.rotation = Math.PI / 2;
      bottomRight.add(textRightB);

      let textTopB = createText(widthTop, "black", this.textSize);
      textTopB.position.set(0, -0.2, 0.3);
      bottomTop.add(textTopB);
    }
    let textSprite = createText(heightR, "black", this.textSize);
    textSprite.position.set(0.3, -0.05, 0.25);
    // textSprite.material.rotation = Math.PI / 2;
    right.add(textSprite);
    let textLeft = createText(heightL, "black", this.textSize);
    // textLeft.material.rotation = Math.PI / 2;
    textLeft.position.set(-0.3, -0.05, 0.3);
    left.add(textLeft);

    let textTop = createText(widthT, "black", this.textSize);
    textTop.position.set(0, 0.1, 0.3);
    top.add(textTop);
    let textbottom = createText(widthB, "black", this.textSize);
    textbottom.position.set(0, -0.3, 0.3);
    bottom.add(textbottom);
  }
  converToDisplayUnit(val) {
    if (this.isMeter) return Number((val * 0.1).toFixed(2)) + "m";
    else return convertFeetInch(val);
  }
  updateFloorMats(length, width) {
    this.CreateLayout(length, width, null, null, true);

    return;

    this.floorLength = length;
    this.floorWidth = width;
    this.addFloorMats(length, width);
    let price = 0;
    if (!this.isCustomLayout) {
      price = (
        this.floorLength *
        this.selectedTileDimension *
        (this.floorWidth * this.selectedTileDimension) *
        this.selectedTilePrice
      ).toFixed(2);
    } else {
      console.log(
        "dimension",
        this.upperWidth * this.selectedTileDimension,
        this.upperLength * this.selectedTileDimension,
        this.lowerWidth * this.selectedTileDimension,
        this.lowerLength * this.selectedTileDimension
      );
      let upperPart =
        this.upperWidth *
        this.selectedTileDimension *
        (this.upperLength * this.selectedTileDimension) *
        this.selectedTilePrice;
      let lowerPart =
        this.lowerWidth *
        this.selectedTileDimension *
        (this.lowerLength * this.selectedTileDimension) *
        this.selectedTilePrice;
      console.log("price", upperPart, lowerPart);
      price = (lowerPart + upperPart).toFixed(2);
    }
    publish("floorUpdated", {
      price: price,
    });
  }

  changeFloorLength(val) {
    this.floorLength = val;
    this.Hiddenplane.scale.set(this.floorLength, this.floorWidth, 1);
  }

  changeFloorWidth(val) {
    this.floorWidth = val;
    this.Hiddenplane.scale.set(this.floorLength, this.floorWidth, 1);
  }
  MouseUp(event) {
    this.IsMouseDown = false;
    this.prevIntersect = null;
  }
  MouseDown(event) {
    this.IsMouseDown = true;
    if (this.hoveredEdge) {
    }
  }
  getEdges() {
    if (!this.Edges)
      return {
        top: null,
        bottom: null,
        left: null,
        right: null,
        bottomRight: null,
        bottomTop: null,
      };
    let top = this.Edges.children.filter((item) =>
      item.name.includes("top")
    )[0];
    let bottom = this.Edges.children.filter((item) =>
      item.name.includes("bottom")
    )[0];
    let left = this.Edges.children.filter((item) =>
      item.name.includes("left")
    )[0];
    let right = this.Edges.children.filter((item) =>
      item.name.includes("right")
    )[0];
    let bottomRight = this.Edges.children.filter((item) =>
      item.name.includes("bottomright")
    )[0];
    let bottomTop = this.Edges.children.filter((item) =>
      item.name.includes("bottomtop")
    )[0];
    return { top, bottom, left, right, bottomRight, bottomTop };
  }
  DragEdge(edge, mouse) {
    // console.log("drag", edge);
    if (!edge) return;
    let isXaxis = edge.name.includes("left") || edge.name.includes("right");
    let diffx = this.getIncrementValue(mouse, isXaxis);
    if (Math.abs(diffx) > 0) {
      console.log(diffx, "dragged");
      let widthBottom = this.floorbottomWidth / 2;
      let heightBottom = this.floorbottomHeight / 2;
      console.log(diffx);
      // if (isXaxis) {
      if (this.isCustomLayout) {
        if (edge.name.includes("bottomright")) {
          if (this.floorbottomWidth - diffx <= 0) return;
        } else if (edge.name.includes("left") || edge.name.includes("right")) {
          if (this.floorWidth - diffx <= 0) return;
        } else if (edge.name.includes("bottomtop")) {
          if (this.floorLength - diffx <= 0) return;
        } else if (edge.name.includes("top")) {
          if (this.floorLength + diffx <= 0) return;
        } else if (edge.name.includes("bottom")) {
          if (this.floorbottomHeight - diffx <= 0) return;
        }
      } else {
        if (edge.name.includes("left") || edge.name.includes("right")) {
          if (this.floorWidth - diffx <= 0) return;
        } else if (edge.name.includes("bottom")) {
          if (this.floorLength - diffx <= 0) return;
        } else if (edge.name.includes("top")) {
          if (this.floorLength + diffx <= 0) return;
        }
      }

      // }
      let { top, bottom, left, right, bottomRight, bottomTop } =
        this.getEdges();
      if (edge.name.includes("left") || edge.name.includes("right")) {
        edge.position.set(
          edge.position.x - diffx,
          edge.position.y,
          edge.position.z
        );
        let width = -left.position.x + right.position.x;
        if (bottomRight)
          widthBottom = -left.position.x + bottomRight.position.x;
        if (edge.name.includes("bottomright")) {
          console.log("bottom width", widthBottom);
          bottomTop.geometry = new THREE.PlaneGeometry(
            width - widthBottom + this.lineWidth,
            this.lineWidth
          );
          bottomTop.position.set(
            bottomTop.position.x - diffx / 2,
            bottomTop.position.y,
            bottomTop.position.z
          );
          bottom.geometry = new THREE.PlaneGeometry(
            widthBottom + this.lineWidth,
            this.lineWidth
          );
          bottom.position.set(
            bottom.position.x - diffx / 2,
            bottom.position.y,
            bottom.position.z
          );
        } else {
          top.geometry = new THREE.PlaneGeometry(
            width + this.lineWidth,
            this.lineWidth
          );
          top.position.set(
            top.position.x - diffx / 2,
            top.position.y,
            top.position.z
          );
          if (bottomTop) {
            if (edge.name.includes("left")) {
              bottom.geometry = new THREE.PlaneGeometry(
                widthBottom + this.lineWidth,
                this.lineWidth
              );
              bottom.position.set(
                bottom.position.x - diffx / 2,
                bottom.position.y,
                bottom.position.z
              );
            } else {
              let diffwidth = width - this.floorbottomWidth;
              bottomTop.geometry = new THREE.PlaneGeometry(
                diffwidth + this.lineWidth,
                this.lineWidth
              );
              bottomTop.position.set(
                bottomTop.position.x - diffx / 2,
                bottomTop.position.y,
                bottomTop.position.z
              );
            }
          } else {
            bottom.geometry = new THREE.PlaneGeometry(
              width + this.lineWidth,
              this.lineWidth
            );
            bottom.position.set(
              bottom.position.x - diffx / 2,
              bottom.position.y,
              bottom.position.z
            );
          }
        }
      } else {
        edge.position.set(
          edge.position.x,
          edge.position.y + diffx,
          edge.position.z
        );
        console.log(top.position.y, bottom.position.y);
        let height = top.position.y - bottom.position.y;

        if (bottomTop) {
          height = top.position.y - bottomTop.position.y;
          heightBottom = bottomTop.position.y - bottom.position.y;
          if (edge.name === "bottomright") {
          } else if (edge.name === "bottom") {
            left.geometry = new THREE.PlaneGeometry(
              this.lineWidth,
              height + heightBottom
            );
            left.position.set(
              left.position.x,
              left.position.y + diffx / 2,
              left.position.z
            );
            bottomRight.geometry = new THREE.PlaneGeometry(
              this.lineWidth,
              heightBottom
            );
            bottomRight.position.set(
              bottomRight.position.x,
              bottomRight.position.y + diffx / 2,
              bottomRight.position.z
            );
          } else {
            if (edge.name === "bottomtop") {
              bottomRight.geometry = new THREE.PlaneGeometry(
                this.lineWidth,
                heightBottom
              );
              bottomRight.position.set(
                bottomRight.position.x,
                bottomRight.position.y + diffx / 2,
                bottomRight.position.z
              );
            } else {
              left.geometry = new THREE.PlaneGeometry(
                this.lineWidth,
                height + heightBottom
              );
              left.position.set(
                left.position.x,
                left.position.y + diffx / 2,
                left.position.z
              );
            }

            right.geometry = new THREE.PlaneGeometry(this.lineWidth, height);
            right.position.set(
              right.position.x,
              right.position.y + diffx / 2,
              right.position.z
            );
          }
        } else {
          left.geometry = new THREE.PlaneGeometry(this.lineWidth, height);
          left.position.set(
            left.position.x,
            left.position.y + diffx / 2,
            left.position.z
          );
          right.geometry = new THREE.PlaneGeometry(this.lineWidth, height);
          right.position.set(
            right.position.x,
            right.position.y + diffx / 2,
            right.position.z
          );
        }
      }
      if (bottomRight) {
        widthBottom = -left.position.x + bottomRight.position.x;
        heightBottom = bottomTop.position.y - bottom.position.y;
      }
      let Owidth = -left.position.x + right.position.x;
      let Oheight = top.position.y - bottom.position.y;
      if (bottomTop) Oheight = top.position.y - bottomTop.position.y;
      let _height = parseInt(Oheight / 0.5);
      _height *= 4;
      let _width = parseInt(Owidth / 0.5);
      _width *= 4;

      if (!(_height === this.floorLength && _width === this.floorWidth)) {
        //  return;
        if (!this.isCustomLayout) {
          this.CreateLayout(Oheight, Owidth, null, null, true);
        } else {
          this.CreateLayout(Oheight, Owidth, heightBottom, widthBottom, true);
        }
      }
    }
    if (this.onUpdateLayout) this.onUpdateLayout();
  }
  getIncrementValue(mouse, isVertical) {
    const ray = new THREE.Raycaster();
    ray.setFromCamera(mouse, this.camera);
    const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
    const raycaster = new THREE.Raycaster();
    const intersect2 = new THREE.Vector3();
    raycaster.setFromCamera(mouse, this.camera);
    raycaster.ray.intersectPlane(plane, intersect2);
    const movedPosition = intersect2;
    let inc = 0;
    if (!this.prevIntersect) {
      this.prevIntersect = movedPosition;
      return 0;
    }
    let incValue = 0;
    if (!isVertical) {
      incValue = movedPosition.y - this.prevIntersect.y;

      incValue += this.remainingval;
      const divident =
        parseInt(incValue / this.incrementValue) * this.incrementValue;
      this.remainingval = incValue - divident;
      incValue = divident;
      this.prevIntersect = movedPosition;
    } else {
      incValue = this.prevIntersect.x - movedPosition.x;
      // if (
      //   !(
      //     (this.remainingval > 0 && incValue > 0) ||
      //     (this.remainingval < 0 && incValue < 0)
      //   )
      // ) {
      //   this.remainingval = 0;
      // }
      incValue += this.remainingval;
      const divident =
        parseInt(incValue / this.incrementValue) * this.incrementValue;
      this.remainingval = incValue - divident;
      incValue = divident;
      this.prevIntersect = movedPosition;
    }
    return incValue;
  }
  MouseMove(event) {
    if (!this.Dragging) return;
    event.preventDefault();
    var mouse = new THREE.Vector2();
    let rect = this.CanvasContainer.getBoundingClientRect(); //this.canvas.getBoundingClientRect();
    this.mouse.x =
      ((event.clientX - rect.left) / (rect.right - rect.left)) * 2 - 1;
    this.mouse.y =
      -((event.clientY - rect.top) / (rect.bottom - rect.top)) * 2 + 1;
    this.raycaster.setFromCamera(this.mouse, this.camera);
    if (this.IsMouseDown) {
      this.DragEdge(this.hoveredEdge, this.mouse);
    } else {
      let intersections = this.raycaster.intersectObjects(
        this.scene.children,
        true
      );
      // this.objects = [];
      intersections = intersections.filter((item) => item.object.isDragLine);
      if (intersections.length > 0) {
        console.log("hit", intersections);
        this.hoveredEdge = intersections[0].object;
      } else {
        this.hoveredEdge = null;
      }
      if (this.hoveredEdge) {
        if (
          this.hoveredEdge.name.toLowerCase().includes("left") ||
          this.hoveredEdge.name.toLowerCase().includes("right")
        ) {
          this.CanvasContainer.style.cursor = "ew-resize";
        } else this.CanvasContainer.style.cursor = "ns-resize";
      } else {
        this.CanvasContainer.style.cursor = "default";
      }
    }
    this.prevMouse = this.mouse;
  }
  onClick(event) {
    event.preventDefault();
    // if (!this.dc) return;
    if (true) {
      // const draggableObjects = this.dc.getObjects();
      // draggableObjects.length = 0;

      var mouse = new THREE.Vector2();
      let rect = this.CanvasContainer.getBoundingClientRect(); //this.canvas.getBoundingClientRect();
      this.mouse.x =
        ((event.clientX - rect.left) / (rect.right - rect.left)) * 2 - 1;
      this.mouse.y =
        -((event.clientY - rect.top) / (rect.bottom - rect.top)) * 2 + 1;

      this.raycaster.setFromCamera(this.mouse, this.camera);

      const intersections = this.raycaster.intersectObjects(this.objects, true);
      // this.objects = [];
      console.log("hit", intersections);
      // if (intersections.length > 0) {
      //   // const object = intersections[0].object.parent;
      //   console.log(intersections[0].object.parent);
      //   const meshes = intersections.filter((h) => h.object.isDraggable);
      //   // this.objects.push(...meshes);
      //   console.log("hited", meshes);
      //   // if (object.type === "Sprite")
      //   //   return;
      //   if (meshes.length > 0) {
      //     this.selectedLine = meshes[0].object;
      //     this.dragStart = meshes[0].object.position.clone();
      //   } else {
      //     this.selectedLine = null;
      //   }
      // } else {
      // }

      // if (this.group.children.length === 0) {
      //   this.group.transformGroup = false;
      //   draggableObjects.push(...this.objects);
      // }
    }

    this.render();
  }

  dragStartEvent(event) {
    if (event.object.type !== "Sprite" && this.selectedLine !== null) {
      this.initialDragPosition.copy(event.object.position);
      this.dragStart = event.object.position.clone();
      this.initialMousePosition.set(
        event.object.position.x,
        event.object.position.y
      );
      this.selectedLine = event.object.clone();
      event.object.material.color.set(0xff0000);
    }
  }

  dragEndEvent(event) {
    if (
      !event.value &&
      event.object.type !== "Sprite" &&
      this.selectedLine !== null
    ) {
      event.object.material.color.set(0xffffff);
      if (!this.isCustomLayout) {
        const bbox = new THREE.Box3().setFromObject(this.widthGrp);
        const size = bbox.getSize(new THREE.Vector3());
        this.dragEnd = event.object.position.clone();
        let offsetx = 0,
          offsety = 0;
        const prevW = this.floorWidth;
        const prevh = this.floorLength;
        let diffwidth = this.dragEnd.x - this.dragStart.x;
        let diffHeight = this.dragEnd.y - this.dragStart.y;
        if (this.selectedLine.name.includes("right")) {
          offsetx = size.x;
        } else if (this.selectedLine.name.includes("left")) {
          offsetx = size.x;
          diffwidth = this.dragStart.x - this.dragEnd.x;
        } else if (this.selectedLine.name.includes("top")) {
          offsety = size.y;
        } else {
          offsety = size.y;
          diffHeight = this.dragStart.y - this.dragEnd.y;
        }

        const width = Math.round(diffwidth + offsetx);
        const length = Math.round(diffHeight + offsety); //this.dragEnd.y - this.dragStart.y;
        // this.currentTexture.repeat.set(length,width)
        this.updateFloorMats(
          length > 0 ? length : prevh,
          width > 0 ? width : prevW
        );
      } else {
        console.log(this.selectedLine);
        const bbox = new THREE.Box3().setFromObject(this.widthGrp);
        const size = bbox.getSize(new THREE.Vector3());
        this.dragEnd = event.object.position.clone();
        let offsetx = 0,
          offsety = 0;
        const prevUW = this.upperWidth;
        const prevLW = this.lowerWidth;
        const preUL = this.upperLength;
        const preLL = this.lowerLength;

        let diffwidth = this.dragEnd.x - this.dragStart.x;
        let diffHeight = this.dragEnd.y - this.dragStart.y;
        if (this.selectedLine.name.includes("rightU")) {
          offsetx = size.x;
        } else if (this.selectedLine.name === "rightL") {
          offsetx = this.lowerWidth;
        } else if (this.selectedLine.name.includes("left")) {
          offsetx = size.x;
          diffwidth = this.dragStart.x - this.dragEnd.x;
        } else if (this.selectedLine.name.includes("top")) {
          offsety = this.upperLength;
        } else {
          offsety = this.lowerLength;
          diffHeight = this.dragStart.y - this.dragEnd.y;
        }
        const width = Math.round(diffwidth + offsetx);
        const length = Math.round(diffHeight + offsety);
        console.log(diffwidth, length);

        if (
          this.selectedLine.name.includes("top") ||
          this.selectedLine.name === "botMid"
        ) {
          this.upperLength = length > 0 ? length : preUL;
        } else if (this.selectedLine.name === "bot") {
          this.lowerLength = length > 0 ? length : preLL;
        } else if (this.selectedLine.name === "left") {
          this.upperWidth = width > 0 ? width : prevUW;
          this.lowerWidth = this.lowerWidth + Math.round(diffwidth);
        } else if (this.selectedLine.name === "rightU") {
          this.upperWidth = width > 0 ? width : prevUW;
        } else if (this.selectedLine.name === "rightL") {
          this.lowerWidth = width > 0 ? width : prevLW;
        }
        this.updateFloorMats(0, 0);
      }
    }
    //   this.panel.geometry = new THREE.PlaneGeometry((width > 0) ? width : prevW, (length > 0) ? length : prevh);
    //   if (this.selectedLine.name === 'left')
    //     this.panel.position.set(this.panel.position.x - diffwidth / 2, this.panel.position.y, 0);
    //   else if (this.selectedLine.name === 'right')
    //     this.panel.position.set(this.panel.position.x + diffwidth / 2, this.panel.position.y, 0);
    //   if (this.selectedLine.name === 'top')
    //     this.panel.position.set(this.panel.position.x, this.panel.position.y + diffHeight / 2, 0);
    //   else
    //     this.panel.position.set(this.panel.position.x, this.panel.position.y - diffHeight / 2, 0);
    // }
    // // else{
    // //   this.dragEnd= this.selectedLine.position;
    // //   // this.selectedLine='';
    // // }
    // console.log(this.dragStart, this.dragEnd);

    // if (event.object.name == 'left' || event.object.name == 'right')
    //   this.updateFloorMats(this.floorLength, this.floorWidth + Math.abs(event.object.position.x));
    // else
    //   this.updateFloorMats(this.floorLength + Math.abs(event.object.position.y), this.floorWidth);
  }

  onDragEvent(event) {
    if (event.object.type !== "Sprite" && this.selectedLine !== null) {
      const object = event.object;

      // Calculate the change in mouse position
      const deltaMouseX = event.object.position.x - this.initialMousePosition.x;
      const deltaMouseY = event.object.position.y - this.initialMousePosition.y;

      // Update the object's position along the X-axis
      if (
        event.object.name.includes("left") ||
        event.object.name.includes("right")
      ) {
        event.object.position.x = Math.round(
          this.initialDragPosition.x + deltaMouseX
        );
        event.object.position.y = this.initialDragPosition.y;
      } else {
        event.object.position.y = Math.round(
          this.initialDragPosition.y + deltaMouseY
        );
        event.object.position.x = this.initialDragPosition.x;
      }
    }
  }

  dragChange(event) {
    if (!this.panel.geometry.boundingBox)
      this.panel.geometry.computeBoundingBox();
    const size = this.panel.geometry.boundingBox.getSize(new THREE.Vector3());

    if (!event.value) {
      this.dragEnd = this.selectedLine.position.clone();
      let offsetx = 0,
        offsety = 0;
      const prevW = this.panel.geometry.parameters.width;
      const prevh = this.panel.geometry.parameters.height;
      let diffwidth = this.dragEnd.x - this.dragStart.x;
      let diffHeight = this.dragEnd.y - this.dragStart.y;
      if (this.selectedLine.name === "right") {
        offsetx = size.x;
      } else if (this.selectedLine.name === "left") {
        offsetx = size.x;
        diffwidth = this.dragStart.x - this.dragEnd.x;
      } else if (this.selectedLine.name === "top") {
        offsety = size.y;
      } else {
        offsety = size.y;
        diffHeight = this.dragStart.y - this.dragEnd.y;
      }

      const width = diffwidth + offsetx;
      const length = diffHeight + offsety; //this.dragEnd.y - this.dragStart.y;
      // this.currentTexture.repeat.set(length,width)
      this.panel.geometry = new THREE.PlaneGeometry(
        width > 0 ? width : prevW,
        length > 0 ? length : prevh
      );
      if (this.selectedLine.name === "left")
        this.panel.position.set(
          this.panel.position.x - diffwidth / 2,
          this.panel.position.y,
          0
        );
      else if (this.selectedLine.name === "right")
        this.panel.position.set(
          this.panel.position.x + diffwidth / 2,
          this.panel.position.y,
          0
        );
      if (this.selectedLine.name === "top")
        this.panel.position.set(
          this.panel.position.x,
          this.panel.position.y + diffHeight / 2,
          0
        );
      else
        this.panel.position.set(
          this.panel.position.x,
          this.panel.position.y - diffHeight / 2,
          0
        );
    }
    // else{
    //   this.dragEnd= this.selectedLine.position;
    //   // this.selectedLine='';
    // }
    // this.controls.enabled = !event.value;
  }

  onWindowResize() {
    let width = this.CanvasContainer.offsetWidth;
    let height = this.CanvasContainer.offsetHeight;
    if (width === 0) width = 500;
    if (height === 0) height = 500;
    this.renderer.setSize(width, height);

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
  }

  updateFloorPattern(patternDetails) {
    console.log(patternDetails);
    this.selectedPattern = patternDetails.pattern;
    this.PrimaryColor = "white";
    this.panel1.material.color = new THREE.Color("white");
    if (this.selectedPattern === "Checked" || this.selectedPattern === "Box") {
      this.secondaryColor = "red";
      this.panel2.material.color = new THREE.Color("red");
    }
    this.CreateLayout(
      this.floorLength,
      this.floorWidth,
      this.floorbottomHeight,
      this.floorbottomWidth,
      true
    );
  }

  async updatePatternImage(imgsrc) {
    const loader = new THREE.TextureLoader();
    const bakedTexture = await loader.loadAsync(
      "https://cdn.shopify.com/s/files/1/0620/9817/8148/files/pattern1White.png?v=1702842587"
    );
    const bakedTexture2 = await loader.loadAsync(
      "https://cdn.shopify.com/s/files/1/0620/9817/8148/files/pattern1Red.png?v=1702842588"
    );
    const geometry2 = new THREE.PlaneGeometry(
      this.floorWidth,
      this.floorLength
    );
    const material2 = new THREE.MeshBasicMaterial({
      map: bakedTexture,
      side: THREE.DoubleSide,
      opacity: 1,
      transparent: true,
      color: new THREE.Color("blue"),
    });
    this.panel1.material = material2;

    // const plane = new THREE.Mesh(geometry2, material2);
    // this.scene.add(plane);

    const material3 = new THREE.MeshBasicMaterial({
      map: bakedTexture2,
      side: THREE.DoubleSide,
      opacity: 1,
      transparent: true,
      color: new THREE.Color("red"),
    });
    this.panel2.material = material3;
    // const plane2 = new THREE.Mesh(geometry2, material3);
    // this.scene.add(plane2);
    if (this.panel.parent) this.panel.parent.remove(this.panel);
    this.panel = new THREE.Group();
    this.panel.add(this.panel1);
    this.panel.add(this.panel2);
    // this.updateFloorMats(this.floorLength, this.floorWidth);
    this.CreateLayout(
      this.floorLength,
      this.floorWidth,
      this.floorbottomHeight,
      this.floorbottomWidth,
      true
    );
    return;
    let texture = await this.CreateTexture(
      "../assets/pattern1White.png",
      "../assets/pattern1Red.png",
      "../assets/patternBorder.png",
      this.PrimaryColor,
      this.secondaryColor
    );

    // this.currentTexture = new THREE.TextureLoader().load("/" + imgsrc, (texture) => {
    // this.currentTexture.wrapS = this.currentTexture.wrapT = THREE.MirroredRepeatWrapping;
    // this.currentTexture.repeat.set(this.panel.scale.x, this.panel.scale.y);

    this.panel.material.map = texture;
    this.panel.material.needsUpdate = true;
    // });
  }

  async updateFloorMaterial(imgsrc, id) {
    // let texture = await this.CreateTexture(
    //   "../assets/pattern1White.png",
    //   "../assets/pattern1Red.png",
    //   "../assets/patternBorder.png",
    //   this.PrimaryColor,
    //   this.secondaryColor
    // );
    this.productId = id;
    this.currentTexture = new THREE.TextureLoader().load(imgsrc, (texture) => {
      //   this.currentTexture.wrapS = this.currentTexture.wrapT = THREE.MirroredRepeatWrapping;
      //   this.currentTexture.repeat.set(this.panel.scale.x, this.panel.scale.y);

      this.panel1.material.map = texture;
      this.panel1.material.needsUpdate = true;
      this.panel2.material.map = texture;
      this.panel2.material.needsUpdate = true;
      this.CreateLayout(
        this.floorLength,
        this.floorWidth,
        this.floorbottomHeight,
        this.floorbottomWidth,
        true
      );
    });
  }

  updateFloorColor(color, type, variant) {
    console.log(color, type, variant);
    this.selectedVariant = variant;
    if (this.selectedPattern === "Checked" || this.selectedPattern === "Box") {
      if (type === "Primary") {
        this.PrimaryColor = color;
        this.panel1.material.color = new THREE.Color(color);
      } else {
        this.secondaryColor = color;
        this.panel2.material.color = new THREE.Color(color);
      }
    } else {
      this.PrimaryColor = color;
      this.panel1.material.color = new THREE.Color(color);
      this.secondaryColor = color;
      this.panel2.material.color = new THREE.Color(color);
    }

    this.CreateLayout(
      this.floorLength,
      this.floorWidth,
      this.floorbottomHeight,
      this.floorbottomWidth,
      true
    );
    // this.updateFloorMaterial("");
    // console.log(color);
    // // return;
    // // this.currentTexture = new THREE.TextureLoader().load("/" + imgsrc, (texture) => {
    //   // this.currentTexture.wrapS = this.currentTexture.wrapT = THREE.MirroredRepeatWrapping;
    //   // this.currentTexture.repeat.set(this.panel.scale.x, this.panel.scale.y);

    //   this.panel.material.color =new THREE.Color(color);
    //   this.panel.material.needsUpdate = true;
  }

  render() {
    TWEEN.update();
    this.renderer.render(this.scene, this.camera);
    // this.renderer2.render(this.scene,this.camera);
    // if (this.controls?.enabled) this.controls.update();
    if (this.controls) {
      const delta = clock.getDelta();
      const hasControlsUpdated = this.controls.update(delta);
    }

    // this.camera.position.set(
    //   this.camera.position.x + (this.mouseX - this.camera.position.x) * 0.5,
    //   this.camera.position.y,
    //   this.camera.position.z
    // );

    requestAnimationFrame(this.render);
  }
}
