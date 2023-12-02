import * as TWEEN from "@tweenjs/tween.js";
import * as THREE from "three";
import {
  OrbitControls
} from "three/examples/jsm/controls/OrbitControls";
import {
  DragControls
} from "three/examples/jsm/controls/DragControls";
import {
  CSS3DObject,
  CSS3DRenderer
} from "three/examples/jsm/renderers/CSS3DRenderer";
import {
  TransformControls
} from 'three/examples/jsm/controls/TransformControls.js';

import {
  GUI
} from 'three/examples/jsm//libs/lil-gui.module.min.js';
import {
  TrackballControls
} from "three/examples/jsm/controls/TrackballControls";
import {
  GLTFLoader
} from "three/examples/jsm/loaders/GLTFLoader";
import {
  RGBELoader
} from "three/examples/jsm/loaders/RGBELoader.js";
import Box3Extension from "../Utils/Box3Extension";
import {
  COLOR_ALICE_BLUE,
  COLOR_GRAY,
  COLOR_WHITE,
  DOOR_STYLES,
  HANDING_RH_LH,
} from "../Utils/Common";
import {
  DebugEnvironment
} from "three/examples/jsm/environments/DebugEnvironment";
import {
  RGBMLoader
} from "three/examples/jsm/loaders/RGBMLoader";
import CameraControls from "camera-controls";
import LockerProperty from "./LockerProperty";
import {
  createDimension,
  createDimensionLine,
  toRadians,
} from "../Utils/MeshUtils";
import {
  jsPDF
} from "jspdf";
import {
  ThreeDRotation
} from "@mui/icons-material";
import {
  logDOM
} from "@testing-library/react";
CameraControls.install({
  THREE: THREE
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
  constructor(canvasID, filePath) {
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
    this.floorWidth = 10;
    this.floorLength = 10;

    //custom layout
    //  ________
    //  |     __|
    //  |    |
    //  |____|
    this.topW = 10;
    this.botW = 5;
    this.leftL = 10;
    this.rightUL = 5;

    this.topWidth = 10;
    this.bottomWidth = 5;
    this.leftLength = 10;
    this.topRLength = 5;
    this.topMid = 5;
    this.botRLength = 5; //___

    this.selectedLine = "";
    this.dragStart = [];
    this.dragEnd = [];
    const loader = new THREE.TextureLoader();
    this.PrimaryColor = '#808080';
    this.isCustomLayout = false;
    this.secondaryColor = '#FF0000';
    this.currentTexture = new THREE.TextureLoader().load('../assets/vented.jpg');
    this.floormaterial = new THREE.MeshBasicMaterial({
      map: this.currentTexture,
      color: this.PrimaryColor,
      opacity: 0.9,
      side: THREE.DoubleSide,
      transparent: true,
    });
    this.draicon = loader.load('../assets/dragicon.svg');
    this.dragPlaneMat = new THREE.MeshBasicMaterial({
      map: this.draicon,
      opacity: 0.9,
      side: THREE.DoubleSide,
      transparent: true,
    });
    this.stdWidth = 1;
    this.stdLength = 1;
    this.standardVTileDim = 0.40;
    this.standardSmoothTileDim = 0.50;
    this.conversionFactor = 3.280;
    this.selectedTileDimension = this.standardVTileDim;
    this.selectedUnit = 'ft';
    this.lengthGrp = new THREE.Group();
    this.widthGrp = new THREE.Group();
    this.group = new THREE.Group();
    this.lineGroup = new THREE.Group();
    this.geometry = new THREE.PlaneGeometry(1, 1);
    this.selectedPattern = 'No Pattern';

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
    console.log("dispose renderer!");
    this.renderer.dispose();

    this.scene.traverse((object) => {
      if (!object.isMesh) return;

      console.log("dispose geometry!");
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
    console.log("dispose material!");
    material.dispose();

    // dispose textures
    for (const key of Object.keys(material)) {
      const value = material[key];
      if (value && typeof value === "object" && "minFilter" in value) {
        console.log("dispose texture!");
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
    this.camera.position.set(0, 0, 50);

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
    this.light.intensity = 0.1;
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
    this.addFloorMats(this.floorLength, this.floorWidth);
    this.dc = new DragControls([...this.objects], this.camera, this.renderer.domElement);
    // this.dc.addEventListener('drag', this.render());

    this.dc.addEventListener('dragstart', this.dragStartEvent.bind(this));

    this.dc.addEventListener('drag', this.onDragEvent.bind(this));

    this.dc.addEventListener('dragend', this.dragEndEvent.bind(this));
    // this.Hiddenplane.visible = true;
    this.render();

    this.renderer.domElement.addEventListener("mousemove", (event) => {});
    this.renderer.domElement.addEventListener("resize", (event) => {});
    document.addEventListener("click", this.onClick());
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
    this.scene.add(plane);
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

  InitLayout(isCustomLayout) {
    console.log(isCustomLayout);
    this.isCustomLayout = isCustomLayout;
    this.initEngine();
  }

  createTextSprite(text, fontSize = 12, textColor = "#ffffff", backgroundColor = "transparent") {
    // Create a canvas element
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");

    // Set font properties
    context.font = `${fontSize}px Arial`;

    // Measure text size
    const textMetrics = context.measureText(text);
    const width = textMetrics.width;
    const height = fontSize;

    // Set canvas size
    canvas.width = width;
    canvas.height = height;

    // Set text properties
    context.font = `${fontSize}px Arial`;
    context.fillStyle = textColor;
    context.textAlign = "center";
    context.textBaseline = "middle";

    // Draw text on the canvas
    context.fillText(text, width / 2, height / 2);

    // Create a texture from the canvas
    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;

    // Create a material using the texture
    const material = new THREE.SpriteMaterial({
      map: texture,
      color: 0x000000, // Set to white to use texture color
      transparent: true,
    });

    // Create a sprite using the material
    const sprite = new THREE.Sprite(material);

    // Set sprite scale based on canvas size
    // sprite.scale.set(width / 2, height / 2, 1);
    sprite.scale.set(0.25, 0.25, 1);

    // Set sprite position, rotation, and other properties as needed
    // sprite.position.set(x, y, z);
    // sprite.rotation.set(rx, ry, rz);

    return sprite;
  }

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


  createLine(length, width, position, name) {
    const linePGeo = new THREE.PlaneGeometry(length, width);
    const linePMat = new THREE.MeshBasicMaterial({
      color: 0x404040,
      opacity: 0.7,
      transparent: true
    });
    const linePlane = new THREE.Mesh(linePGeo, linePMat);
    linePlane.name = name;
    // const dragM = new THREE.Mesh(new THREE.PlaneGeometry(0.1,0.1),this.dragPlaneMat);
    const spriteMaterial = new THREE.SpriteMaterial({
      map: this.draicon
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
    if (name === 'left') {
      dimensionT = ((this.floorLength * this.selectedTileDimension * this.conversionFactor).toFixed(2)).toString() + this.selectedUnit
      textSprite = this.createTextSprite(dimensionT);
      textSprite.position.set(-textOffest, 0, 0);
      spritePosition = new THREE.Vector3(position.x, 0, 0);
      spriteRotataion = new THREE.Euler(-Math.PI / 2, 0, 0);
    } else if (name === 'right') {
      dimensionT = ((this.floorLength * this.selectedTileDimension * this.conversionFactor).toFixed(2)).toString() + this.selectedUnit
      textSprite = this.createTextSprite(dimensionT);
      textSprite.position.set(textOffest, 0, 0);

      spritePosition = new THREE.Vector3(position.x, 0, 0);
      spriteRotataion = new THREE.Euler(Math.PI / 2, 0, 0);
    } else if (name === 'top') {
      dimensionT = ((this.floorWidth * this.selectedTileDimension * this.conversionFactor).toFixed(2)).toString() + this.selectedUnit
      textSprite = this.createTextSprite(dimensionT);
      textSprite.position.set(0, textOffest, 0);

      spritePosition = new THREE.Vector3(0, position.y + width, 0);
      spriteRotataion = new THREE.Euler(0, 0, 0);
    } else {
      dimensionT = ((this.floorWidth * this.selectedTileDimension * this.conversionFactor).toFixed(2)).toString() + this.selectedUnit
      textSprite = this.createTextSprite(dimensionT);
      textSprite.position.set(0, -textOffest, 0);


      spritePosition = new THREE.Vector3(0, position.y - width, 0);
      spriteRotataion = new THREE.Euler(Math.PI, 0, 0);
    }
    linePlane.add(textSprite);
    // textSprite.position.set(textOffest,0,0);
    // this.createLineSprite(spritePosition, spriteRotataion)

    // this.scene.add(linePlane);

    this.lineGroup.add(linePlane);
    this.objects.push(linePlane);
  }

  createLineCustomLayout(length, width, position, name) {
    const linePGeo = new THREE.PlaneGeometry(length, width);
    const linePMat = new THREE.MeshBasicMaterial({
      color: 0x404040,
      opacity: 0.7,
      transparent: true
    });
    const linePlane = new THREE.Mesh(linePGeo, linePMat);
    linePlane.name = name;
    // const dragM = new THREE.Mesh(new THREE.PlaneGeometry(0.1,0.1),this.dragPlaneMat);
    const spriteMaterial = new THREE.SpriteMaterial({
      map: this.draicon
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
    if (name === 'left') {
      dimensionT = ((this.leftL * this.selectedTileDimension * this.conversionFactor).toFixed(2)).toString() + this.selectedUnit
      textSprite = this.createTextSprite(dimensionT);
      textSprite.position.set(-textOffest, 0, 0);
      spritePosition = new THREE.Vector3(position.x, 0, 0);
      spriteRotataion = new THREE.Euler(-Math.PI / 2, 0, 0);
    } else if (name === 'rightU') {
      dimensionT = ((this.topRLength * this.selectedTileDimension * this.conversionFactor).toFixed(2)).toString() + this.selectedUnit
      textSprite = this.createTextSprite(dimensionT);
      textSprite.position.set(textOffest, 0, 0);

      spritePosition = new THREE.Vector3(position.x, 0, 0);
      spriteRotataion = new THREE.Euler(Math.PI / 2, 0, 0);
    } else if (name === 'top') {
      dimensionT = ((this.topW * this.selectedTileDimension * this.conversionFactor).toFixed(2)).toString() + this.selectedUnit
      textSprite = this.createTextSprite(dimensionT);
      textSprite.position.set(0, textOffest, 0);

      spritePosition = new THREE.Vector3(0, position.y + width, 0);
      spriteRotataion = new THREE.Euler(0, 0, 0);
    } else if(name === 'bot') {
      dimensionT = ((this.botW * this.selectedTileDimension * this.conversionFactor).toFixed(2)).toString() + this.selectedUnit
      textSprite = this.createTextSprite(dimensionT);
      textSprite.position.set(0, -textOffest, 0);


      spritePosition = new THREE.Vector3(0, position.y - width, 0);
      spriteRotataion = new THREE.Euler(Math.PI, 0, 0);
    }else if(name === 'botMid') {
      dimensionT = (((this.topW- this.botW) * this.selectedTileDimension * this.conversionFactor).toFixed(2)).toString() + this.selectedUnit
      textSprite = this.createTextSprite(dimensionT);
      textSprite.position.set(0, -textOffest, 0);


      spritePosition = new THREE.Vector3(0, position.y - width, 0);
      spriteRotataion = new THREE.Euler(Math.PI, 0, 0);
    }else if(name === 'lowRL') {
      dimensionT = (((this.leftL-this.rightUL) * this.selectedTileDimension * this.conversionFactor).toFixed(2)).toString() + this.selectedUnit
      textSprite = this.createTextSprite(dimensionT);
      textSprite.position.set(0, -textOffest, 0);


      spritePosition = new THREE.Vector3(0, position.y - width, 0);
      spriteRotataion = new THREE.Euler(Math.PI, 0, 0);
    }
    linePlane.add(textSprite);
    // textSprite.position.set(textOffest,0,0);
    // this.createLineSprite(spritePosition, spriteRotataion)

    // this.scene.add(linePlane);

    this.lineGroup.add(linePlane);
    this.objects.push(linePlane);
  }

  changeMeasureUnit(isMeter) {
    console.log(isMeter, "njkdasbkjbkjdafbjk");
    if (isMeter) {
      this.selectedUnit = 'm';
      this.conversionFactor = 1;
    } else {
      this.selectedUnit = 'ft';
      this.conversionFactor = 3.28;
    }
  }

  changeSelectedTile(isSmoothPvcSelected) {
    if (isSmoothPvcSelected) {
      this.selectedTileDimension = this.standardSmoothTileDim;
      this.updateFloorMaterial("../assets/premiumpvc.png");
    } else {
      this.selectedTileDimension = this.standardVTileDim;
      this.updateFloorMaterial("../assets/vented.jpg");
    }
  }

  createLineSprite(position, rotation) {
    // Create a sprite for the text
    const text = "Center Text";
    const spriteCanvas = document.createElement('canvas');
    const spriteContext = spriteCanvas.getContext('2d');
    spriteContext.font = 'Bold 12px Arial';
    spriteContext.fillStyle = 'black';
    spriteContext.fillText(text, 10, 10); // Position the text in the center

    const spriteTexture = new THREE.CanvasTexture(spriteCanvas);
    const spriteMaterial = new THREE.SpriteMaterial({
      map: spriteTexture
    });
    const textSprite = new THREE.Sprite(spriteMaterial);
    // console.log(line);
    // // Position the text sprite at the center of the line
    // const startPoint = line.vertices[0];
    // const endPoint = line.vertices[line.geometry.vertices.length - 1];

    // Calculate the center of the line
    // const center = new THREE.Vector3().copy(startPoint).add(endPoint).multiplyScalar(0.5); //    const lineCenter = new THREE.Vector3(1.5, 0, 0); // Assuming line starts at (0,0,0) and ends at (3,0,0)
    textSprite.rotation.set(rotation.x, rotation.y, rotation.z)
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
      linecap: 'round', //ignored by WebGLRenderer
      linejoin: 'round'
    });
    // this.createLine([5, 5, 0], [5, -5, 0], 'right'); //v1
    // this.createLine([-5, 5, 0], [-5, -5, 0], 'left'); //v2
    // this.createLine([-5, 5, 0], [5, 5, 0], 'top'); //h1
    // this.createLine([-5, -5, 0], [5, -5, 0], 'bot'); //h2

    const panel = this.panel.clone();
    panel.name = "panel";

    this.camera.lookAt(this.panel.position)
    this.panel.geometry.computeBoundingBox();
    const floorBB = this.panel.geometry.boundingBox; //new THREE.Box3();
    // floorBB.setFromObject(this.widthGrp); //.computeBoundingBox();
    let floorBBMax = floorBB.max;
    let floorBBMin = floorBB.min;
    this.lineGroup = new THREE.Group();
    this.objects = [];
    this.createLine(0.5, this.floorWidth, new THREE.Vector3(floorBBMax.x, 0, 0), 'right'); //[floorBBMax.x, floorBBMax.y, 0], [floorBBMax.x, floorBBMin.y, 0], 'right'); //v1
    // this.createLine(0.2, this.floorWidth, new THREE.Vector3(-floorBBMax.x,0,0),'left');//([floorBBMin.x, floorBBMax.y, 0], [floorBBMin.x, floorBBMin.y, 0], 'left'); //v2
    // this.createLine(this.floorLength, 0.2, new THREE.Vector3(0,floorBBMax.y,0),'top');//([floorBBMin.x, floorBBMax.y, 0], [floorBBMax.x, floorBBMax.y, 0], 'top'); //h1
    // this.createLine(this.floorLength, 0.2, new THREE.Vector3(0,-floorBBMax.y,0),'bot');//([floorBBMin.x, floorBBMin.y, 0], [floorBBMax.x, floorBBMin.y, 0], 'bot');
    this.scene.add(this.lineGroup);
    // this.controls.target.set(this.panel.position)
    this.scene.add(this.panel);
  }

  addFloorMats(Length, Width) {
    this.scene.remove(this.widthGrp);
    this.scene.remove(this.lineGroup);

    this.lengthGrp = new THREE.Group();
    this.widthGrp = new THREE.Group();
    if (!this.isCustomLayout) {
      if (this.selectedPattern === 'No Pattern') {
        const l = Length / this.stdLength;
        const w = Width / this.stdWidth;

        console.log(Length, Width);
        for (let i = 0; i < w; i++) {
          const panel = this.panel1.clone();
          panel.position.set(i + this.stdLength, 0, 0)
          this.lengthGrp.add(panel);
          // this.objects.push(this.lengthGrp);

        }
        this.lengthGrp.position.set(0, 0, 0)
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
        const distance = halfSize.length() / Math.tan((this.camera.fov / 2) * (Math.PI / 180));

        this.camera.position.copy(center.clone().add(new THREE.Vector3(0, 0, distance)));

        // You may also want to look at the center of the group
        this.camera.lookAt(center);
        this.addResizeControls();
        this.scene.add(this.widthGrp);
      } else if (this.selectedPattern === 'Checked')
        this.addUpdateCheckedPattern(this.floorLength, this.floorWidth);
      else if (this.selectedPattern == 'Box')
        this.addUpdateSquarePattern(this.floorLength, this.floorWidth);
    } else {
      if (this.selectedPattern === 'No Pattern') {
        this.topW = 15;
        this.botW = 11;
        this.leftL = 10;
        this.rightUL = 5;

        const topL = this.rightUL / this.stdLength;
        const fullL = this.leftL / this.stdLength;


        const w = this.topW / this.stdWidth;
        const botW = this.botW / this.stdWidth;
        console.log("hit");
        let lg1 = new THREE.Group();
        let lg2 = new THREE.Group();
        for (let i = 0; i < w; i++) {
          const panel = this.panel1.clone();
          panel.position.set(i + this.stdWidth, 0, 0)
          lg1.add(panel);
          // this.objects.push(this.lengthGrp);

        }
        for (let i = 0; i < botW; i++) {
          const panel = this.panel1.clone();
          panel.position.set(i + this.stdWidth, 0, 0)
          lg2.add(panel);
          // this.objects.push(this.lengthGrp);

        }
        for (let i = 0; i < fullL; i++) {
          if(i<topL){
            const grp = lg1.clone();
            grp.position.set(0, -(i + this.stdLength), 0);
            this.widthGrp.add(grp);
          }else{
            const grp = lg2.clone();
            grp.position.set(0, -(i + this.stdLength) , 0);
            this.widthGrp.add(grp);
          }

 
        }



        // for (let i = 0; i < w; i++) {
        //   const panel = this.panel1.clone();
        //   panel.position.set(i + this.stdLength, 0, 0)
        //   this.lengthGrp.add(panel);
        //   // this.objects.push(this.lengthGrp);

        // }
        // this.lengthGrp.position.set(0, 0, 0)
        // for (let i = 0; i < topL; i++) {
        //   const grp = this.lengthGrp.clone();
        //   grp.position.set(0, i + this.stdWidth, 0);
        //   this.widthGrp.add(grp);
        // }
        // this.lengthGrp = new THREE.Group();

        // for (let i = 0; i < botW; i++) {
        //   const panel = this.panel1.clone();
        //   panel.position.set(i + this.stdLength, topL, 0)
        //   this.lengthGrp.add(panel);
        //   // this.objects.push(this.lengthGrp);

        // }
        // for (let i = 0; i < fullL - topL; i++) {
        //   const grp = this.lengthGrp.clone();
        //   grp.position.set(0, (i + this.stdWidth + topL), 0);
        //   this.widthGrp.add(grp);
        // }
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
        const distance = halfSize.length() / Math.tan((this.camera.fov / 2) * (Math.PI / 180));

        this.camera.position.copy(center.clone().add(new THREE.Vector3(0, 0, distance)));

        // You may also want to look at the center of the group
        this.camera.lookAt(center);
        this.addResizeControls();
        this.scene.add(this.widthGrp);
      } else if (this.selectedPattern === 'Checked')
        this.addUpdateCheckedPattern(this.floorLength, this.floorWidth);
      else if (this.selectedPattern == 'Box')
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
    patch.position.set(0, 0, 0)
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
      if (i == 0)
        panel.position.set(0, 0, 0)
      else
        panel.position.set(i, 0, 0)
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
    const distance = halfSize.length() / Math.tan((this.camera.fov / 2) * (Math.PI / 180));

    this.camera.position.copy(center.clone().add(new THREE.Vector3(0, 0, distance)));

    // You may also want to look at the center of the group
    this.camera.lookAt(center);
    const lOff = this.floorLength % 2 !== 0 ? 1 : 0;
    const wOff = this.floorWidth % 2 !== 0 ? 1 : 0;
    this.addResizeControls(lOff, wOff);
    this.scene.add(this.widthGrp);
  }

  CreateAddSquare(l, w) {

    const squarePattern = new THREE.Group();
    let n = 5; // row or column count
    // defining an empty string
    let string = "";

    for (let j = 0; j < l; j++) {
      if (j == 0 || j == l - 1) {
        for (let i = 0; i < w; i++) {
          console.log("square pattern");
          const panel = this.panel2.clone();
          panel.material.color = new THREE.Color(this.secondaryColor);
          panel.position.set(i + this.stdLength, j, 0)
          squarePattern.add(panel);
          // this.objects.push(this.lengthGrp);

        }
      } else {

        for (let i = 0; i < w; i++) {
          if (i == 0 || i == w - 1) {
            const panel = this.panel2.clone();
            panel.material.color = new THREE.Color(this.secondaryColor);
            panel.position.set(i + this.stdLength, j, 0)
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
      panel.position.set(i + this.stdLength, 0, 0)
      this.lengthGrp.add(panel);
      // this.objects.push(this.lengthGrp);

    }
    this.lengthGrp.position.set(0, 0, 0)
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
    const distance = halfSize.length() / Math.tan((this.camera.fov / 2) * (Math.PI / 180));

    this.camera.position.copy(center.clone().add(new THREE.Vector3(0, 0, distance)));

    // You may also want to look at the center of the group
    this.camera.lookAt(center);
    this.addResizeControls();
    this.scene.add(this.widthGrp);
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
      this.createLine(0.1, this.floorLength + lOff + 0.1, new THREE.Vector3(floorBBMax.x, 0, 0), 'right'); //[floorBBMax.x, floorBBMax.y, 0], [floorBBMax.x, floorBBMin.y, 0], 'right'); //v1
      this.createLine(0.1, this.floorLength + lOff + 0.1, new THREE.Vector3(-floorBBMax.x, 0, 0), 'left'); //([floorBBMin.x, floorBBMax.y, 0], [floorBBMin.x, floorBBMin.y, 0], 'left'); //v2
      this.createLine(this.floorWidth + wOff + 0.1, 0.1, new THREE.Vector3(0, floorBBMax.y, 0), 'top'); //([floorBBMin.x, floorBBMax.y, 0], [floorBBMax.x, floorBBMax.y, 0], 'top'); //h1
      this.createLine(this.floorWidth + wOff + 0.1, 0.1, new THREE.Vector3(0, -floorBBMax.y, 0), 'bot'); //([floorBBMin.x, floorBBMin.y, 0], [floorBBMax.x, floorBBMin.y, 0], 'bot');
      this.scene.add(this.lineGroup);
    }else{
      const floorBB = new THREE.Box3();
      floorBB.setFromObject(this.widthGrp); //.computeBoundingBox();
      let floorBBMax = floorBB.max;
      let floorBBMin = floorBB.min;
      this.lineGroup = new THREE.Group();
      this.objects = [];
      this.createLineCustomLayout(0.1, this.topRLength + lOff + 0.1, new THREE.Vector3(floorBBMax.x, this.rightUL, 0), 'rightU'); //[floorBBMax.x, floorBBMax.y, 0], [floorBBMax.x, floorBBMin.y, 0], 'right'); //v1
      this.createLineCustomLayout(0.1, this.leftL + lOff + 0.1, new THREE.Vector3(-floorBBMax.x, 0, 0), 'left'); //left
      this.createLineCustomLayout(this.topW + wOff + 0.1, 0.1, new THREE.Vector3(0, floorBBMax.y, 0), 'top'); //([floorBBMin.x, floorBBMax.y, 0], [floorBBMax.x, floorBBMax.y, 0], 'top'); //h1
      this.createLineCustomLayout(this.botW + wOff + 0.1, 0.1, new THREE.Vector3(-floorBBMax.x +this.botW/2, -floorBBMax.y, 0), 'bot'); //([floorBBMin.x, floorBBMin.y, 0], [floorBBMax.x, floorBBMin.y, 0], 'bot');
      this.createLineCustomLayout((this.topW - this.botW) + wOff + 0.1, 0.1, new THREE.Vector3(this.botW/2, -(floorBBMin.y+this.rightUL), 0), 'botMid'); //botmid
      this.createLineCustomLayout(0.1, this.leftL - this.rightUL + lOff + 0.1, new THREE.Vector3(-floorBBMax.x+this.botW,  (-floorBBMax.y+this.rightUL), 0), 'lowRL'); //botmid

      this.scene.add(this.lineGroup);
    }
  }

  updateFloorMats(length, width) {
    this.floorLength = length;
    this.floorWidth = width;
    this.addFloorMats(length, width);
  }

  changeFloorLength(val) {

    this.floorLength = val;
    this.Hiddenplane.scale.set(this.floorLength, this.floorWidth, 1);
  }

  changeFloorWidth(val) {
    this.floorWidth = val;
    this.Hiddenplane.scale.set(this.floorLength, this.floorWidth, 1);
  }

  onClick(event) {
    console.log("hit");
    event.preventDefault();

    if (true) {

      const draggableObjects = this.dc.getObjects();
      draggableObjects.length = 0;

      this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

      this.raycaster.setFromCamera(this.mouse, this.camera);

      const intersections = this.raycaster.intersectObjects(this.objects, true);
      console.log(intersections);
      if (intersections.length > 0) {

        const object = intersections[0].object;
        this.selectedLine = object;
        this.dragStart = object.position.clone();
        console.log(object.position);

        // if (this.selectedLine.name.includes('left') || this.selectedLine.name.includes('right')) {
        //   this.transformControl.showX = true;
        //   this.transformControl.showY = false;
        // } else {
        //   this.transformControl.showX = false;
        //   this.transformControl.showY = true;
        // }

        // this.transformControl.attach(object);

      } else {
        // if (this.selectedLine..length > 0) {
        //   const obj = this.scene.getObjectByName(this.selectedLine);
        //   this.dragEnd = obj.position;
        //   console.log(obj, this.dragStart, this.dragEnd);
        // this.transformControl.detach();
        //   this.selectedLine = '';
        // }

      }

      if (this.group.children.length === 0) {

        this.group.transformGroup = false;
        draggableObjects.push(...this.objects);

      }

    }

    this.render();

  }

  dragStartEvent(event) {

    this.initialDragPosition.copy(event.object.position);
    this.dragStart = event.object.position.clone();
    this.initialMousePosition.set(event.object.position.x, event.object.position.y);
    this.selectedLine = event.object.clone();
    console.log("hit");
    event.object.material.color.set(0xff0000);
  }

  dragEndEvent(event) {
    event.object.material.color.set(0xffffff);
    console.log("start", this.initialDragPosition, event.object.position.x);

    // if (!this.panel.geometry.boundingBox)
    //   this.panel.geometry.computeBoundingBox()
    // const size = this.panel.geometry.boundingBox.getSize(new THREE.Vector3());

    const bbox = new THREE.Box3().setFromObject(this.widthGrp);
    const size = bbox.getSize(new THREE.Vector3());

    if (!event.value) {
      this.dragEnd = event.object.position.clone();
      let offsetx = 0,
        offsety = 0;
      const prevW = this.floorWidth;
      const prevh = this.floorLength;
      let diffwidth = this.dragEnd.x - this.dragStart.x;
      let diffHeight = this.dragEnd.y - this.dragStart.y;
      if (this.selectedLine.name === 'right') {
        offsetx = size.x;
      } else if (this.selectedLine.name === 'left') {
        offsetx = size.x;
        diffwidth = this.dragStart.x - this.dragEnd.x;
      } else if (this.selectedLine.name === 'top') {
        offsety = size.y;
      } else {
        offsety = size.y;
        diffHeight = this.dragStart.y - this.dragEnd.y;
      }

      const width = Math.round(diffwidth + offsetx);
      const length = Math.round(diffHeight + offsety); //this.dragEnd.y - this.dragStart.y;
      // this.currentTexture.repeat.set(length,width)
      console.log("res", width, length);
      this.updateFloorMats((length > 0) ? length : prevh, (width > 0) ? width : prevW);
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

    console.log(this.floorLength, this.floorWidth);

  }

  onDragEvent(event) {

    const object = event.object;

    // Calculate the change in mouse position
    const deltaMouseX = event.object.position.x - this.initialMousePosition.x;
    const deltaMouseY = event.object.position.y - this.initialMousePosition.y;

    // Update the object's position along the X-axis
    if (event.object.name == 'left' || event.object.name == 'right') {
      event.object.position.x = Math.round(this.initialDragPosition.x + deltaMouseX);
      event.object.position.y = 0;
    } else {
      event.object.position.y = Math.round(this.initialDragPosition.y + deltaMouseY);
      event.object.position.x = 0;
    }
  }

  dragChange(event) {
    console.log(event);
    if (!this.panel.geometry.boundingBox)
      this.panel.geometry.computeBoundingBox()
    const size = this.panel.geometry.boundingBox.getSize(new THREE.Vector3());

    if (!event.value) {
      this.dragEnd = this.selectedLine.position.clone();
      let offsetx = 0,
        offsety = 0;
      const prevW = this.panel.geometry.parameters.width;
      const prevh = this.panel.geometry.parameters.height;
      let diffwidth = this.dragEnd.x - this.dragStart.x;
      let diffHeight = this.dragEnd.y - this.dragStart.y;
      if (this.selectedLine.name === 'right') {
        offsetx = size.x;
      } else if (this.selectedLine.name === 'left') {
        offsetx = size.x;
        diffwidth = this.dragStart.x - this.dragEnd.x;
      } else if (this.selectedLine.name === 'top') {
        offsety = size.y;
      } else {
        offsety = size.y;
        diffHeight = this.dragStart.y - this.dragEnd.y;
      }

      const width = diffwidth + offsetx;
      const length = diffHeight + offsety; //this.dragEnd.y - this.dragStart.y;
      // this.currentTexture.repeat.set(length,width)
      console.log("res", width, length);
      this.panel.geometry = new THREE.PlaneGeometry((width > 0) ? width : prevW, (length > 0) ? length : prevh);
      if (this.selectedLine.name === 'left')
        this.panel.position.set(this.panel.position.x - diffwidth / 2, this.panel.position.y, 0);
      else if (this.selectedLine.name === 'right')
        this.panel.position.set(this.panel.position.x + diffwidth / 2, this.panel.position.y, 0);
      if (this.selectedLine.name === 'top')
        this.panel.position.set(this.panel.position.x, this.panel.position.y + diffHeight / 2, 0);
      else
        this.panel.position.set(this.panel.position.x, this.panel.position.y - diffHeight / 2, 0);
    }
    // else{
    //   this.dragEnd= this.selectedLine.position;
    //   // this.selectedLine='';
    // }
    console.log(this.dragStart, this.dragEnd);
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
    this.selectedPattern = patternDetails.pattern;
    this.updateFloorMats(this.floorLength, this.floorWidth);
  }

  async updatePatternImage(imgsrc) {
    console.log("hit");
    const loader = new THREE.TextureLoader();
    const bakedTexture = await loader.loadAsync("../assets/pattern1White.png");
    const bakedTexture2 = await loader.loadAsync("../assets/pattern1Red.png");
    const geometry2 = new THREE.PlaneGeometry(this.floorWidth, this.floorLength);
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
    if (this.panel.parent)
      this.panel.parent.remove(this.panel);
    this.panel = new THREE.Group();
    this.panel.add(this.panel1);
    this.panel.add(this.panel2);
    this.updateFloorMats(this.floorLength, this.floorWidth)

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

  async updateFloorMaterial(imgsrc) {
    // let texture = await this.CreateTexture(
    //   "../assets/pattern1White.png",
    //   "../assets/pattern1Red.png",
    //   "../assets/patternBorder.png",
    //   this.PrimaryColor,
    //   this.secondaryColor
    // );

    this.currentTexture = new THREE.TextureLoader().load("/" + imgsrc, (texture) => {
      //   this.currentTexture.wrapS = this.currentTexture.wrapT = THREE.MirroredRepeatWrapping;
      //   this.currentTexture.repeat.set(this.panel.scale.x, this.panel.scale.y);

      this.panel1.material.map = texture;
      this.panel1.material.needsUpdate = true;
      this.panel2.material.map = texture;
      this.panel2.material.needsUpdate = true;
    });
  }

  updateFloorColor(color) {
    this.PrimaryColor = color;
    this.panel1.material.color = new THREE.Color(color);
    this.updateFloorMats(this.floorLength, this.floorWidth);
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