import * as TWEEN from "@tweenjs/tween.js";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
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
  createDimension,
  createDimensionLine,
  toRadians,
} from "../Utils/MeshUtils";
import { jsPDF } from "jspdf";
CameraControls.install({ THREE: THREE });

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
    this.camera = null;
    this.light = null;
    this.scene = null;
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
    this.renderer = new THREE.WebGLRenderer({
      preserveDrawingBuffer: true,
      antialias: true,
      alpha: true,
    });
    let width = this.CanvasContainer.offsetWidth;
    let height = this.CanvasContainer.offsetHeight;
    if (width === 0) width = 500;
    if (height === 0) height = 500;
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(width, height);
    this.renderer.shadowMap.enabled = true;
    this.CanvasContainer.appendChild(this.renderer.domElement);

    this.camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 1000);
    this.camera.lookAt(new THREE.Vector3(0, 10, -20));
    this.camera.position.set(0, 10, 30);

    // this.controls = new CameraControls(this.camera, this.renderer.domElement);
    // this.controls.minPolarAngle = Math.PI / 4;
    // this.controls.maxPolarAngle = Math.PI / 2;
    // this.controls.minAzimuthAngle = -Math.PI / 4;
    // this.controls.maxAzimuthAngle = Math.PI / 4;
    // this.controls.setOrbitPoint(0, 20, 0);
    // this.controls.dampingFactor = 0.01;
    // this.controls.mouseButtons.wheel = CameraControls.ACTION.NONE;

    // const frustumSize = 70;
    // const aspect =
    //   this.CanvasContainer.offsetWidth / this.CanvasContainer.offsetHeight;
    // this.camera = new THREE.OrthographicCamera(
    //   (frustumSize * aspect) / -2,
    //   (frustumSize * aspect) / 2,
    //   frustumSize / 2,
    //   frustumSize / -2,
    //   1,
    //   1000
    // );

    // this.camera.position.set(0, 10, 50);

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(COLOR_ALICE_BLUE);

    // this.controls = new TrackballControls(
    //   this.camera,
    //   this.renderer.domElement
    // );

    // this.controls.rotateSpeed = 1.0;
    // this.controls.zoomSpeed = 1.2;
    // this.controls.panSpeed = 0.8;

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.target.set(0, 0, 0);
    this.controls.update();

    this.light = new THREE.AmbientLight(COLOR_GRAY, 1);
    this.scene.add(this.light);

    this.light = new THREE.DirectionalLight(COLOR_WHITE);
    this.light.position.set(0, -40, 100);
    this.light.intensity = 0.1;
    this.scene.add(this.camera);
    this.terminals = [];
    const geometry = new THREE.PlaneGeometry(1000, 1000);
    const material = new THREE.MeshPhongMaterial({
      color: 0xffff00,
      opacity: 0.5,
      side: THREE.DoubleSide,
      transparent: true,
    });
    this.Hiddenplane = new THREE.Mesh(geometry, material);
    this.Hiddenplane.position.set(0, 0, -44);
    this.Hiddenplane.visible = false;
    this.scene.add(this.Hiddenplane);
    // this.scene.add(this.light);
    this.render();
    const geometry2 = new THREE.BoxGeometry(5, 5, 5);
    const material2 = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    const cube = new THREE.Mesh(geometry2, material2);
    this.scene.add(cube);
    // this.renderer.domElement.addEventListener("mousedown", (event) => {
    //   this.onClick(event);
    // });
    // this.renderer.domElement.addEventListener("mouseup", (event) => {
    //   this.mouseUp(event);
    // });
    this.renderer.domElement.addEventListener("mousemove", (event) => {});
    this.renderer.domElement.addEventListener("resize", (event) => {});
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
  render() {
    TWEEN.update();
    this.renderer.render(this.scene, this.camera);
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
