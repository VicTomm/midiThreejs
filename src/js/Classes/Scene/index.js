import {
  Scene,
  PerspectiveCamera,
  WebGLRenderer,
  PointsMaterial,
  Geometry,
  Vector3,
  Points,
  FogExp2,
  LinearFilter,
  AdditiveBlending,
  Math as THREEMATH,
  Color,
  Spherical,
  BufferGeometry,
  Float32BufferAttribute,
} from "three";
import Stats from "stats.js";
import GifLoader from "three-gif-loader";

const boo = require("../../../assets/boo.gif");
const boo2 = require("../../../assets/boo2.gif");
const mario = require("../../../assets/mariodying.gif");
const babyMario = require("../../../assets/babymariogif.gif");

const boos = [boo, boo2];

export default class Viewer {
  constructor() {
    this.container = null;
    this.width = null;
    this.height = null;
    this.fieldOfView = null;
    this.aspectRatio = null;
    this.nearPlane = null;
    this.farPlane = null;
    this.stats = null;
    this.geometry = null;
    this.spherical = null;
    this.particleCount = null;
    this.i = null;
    this.h = 1;
    this.s = 1;
    this.l = 1;
    this.color = null;
    this.size = null;
    this.materials = [];
    this.mouseX = 0;
    this.mouseY = 0;
    this.windowHalfX;
    this.windowHalfY;
    this.cameraZ;
    this.fogHex;
    this.fogDensity;
    this.parameters = {};
    this.parameterCount;
    this.particles;
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.pointCloud = null;
    this.rotation = 0;
    this.colorVal = 0;
    this.autoRotate = false;
    this.distance = 0;
    this.extra = 0;
    this.randomColors = false;
    this.knobX = 0;
    this.knobY = 0;
    this.knobZ = 0;
  }

  initialize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.windowHalfX = this.width / 2;
    this.windowHalfY = this.height / 2;

    this.fieldOfView = 75;
    this.aspectRatio = this.width / this.height;
    this.nearPlane = 1;
    this.farPlane = 3000;

    this.cameraZ = this.farPlane / 3;
    this.fogHex = 0x000000;
    this.fogDensity = 0.0007;

    this.particleCount = 0;

    this.initScene();
    this.initCamera();
    this.createContainer();
    this.initRenderer();
    this.initStats();
    this.addEventListener();
  }

  initRenderer() {
    this.renderer = new WebGLRenderer();
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(this.width, this.height);
    this.container.appendChild(this.renderer.domElement);
  }

  initStats() {
    this.stats = new Stats();
    this.stats.domElement.style.position = "absolute";
    this.stats.domElement.style.top = "0px";
    this.stats.domElement.style.right = "0px";
    this.container.appendChild(this.stats.domElement);
  }

  initScene() {
    this.scene = new Scene();
    this.scene.fog = new FogExp2(this.fogHex, this.fogDensity);
  }

  initCamera() {
    this.camera = new PerspectiveCamera(
      this.fieldOfView,
      this.aspectRatio,
      this.nearPlane,
      this.farPlane
    );
    this.camera.z = this.cameraZ;
  }

  createContainer() {
    this.container = document.createElement("div");
    document.body.appendChild(this.container);
    document.body.style.margin = 0;
    document.body.style.overflow = "hidden";
  }

  handleParticles(value) {
    this.updateScene(value);
  }

  addRotationY(value) {
    this.rotation = value * 0.00005;
    this.updateGeometryY();
  }

  addRotationX(value) {
    this.rotation = value * 0.00005;
    this.updateGeometryX();
  }

  addRotationZ(value) {
    this.rotation = value * 0.00005;
    this.updateGeometryZ();
  }

  updateScene(value) {
    this.scene.dispose();
    if (this.onIncrease(value, this.particleCount)) {
      this.createSphere(value);
      this.initParameters();
    } else {
      const diff = this.scene.children.length - value;
      for (let index = 0; index < diff; index++) {
        const element = this.scene.children[index];
        this.scene.remove(element);
      }
    }
    this.scene.dispose();
    this.particleCount = this.scene.children.length;
  }

  createCube(onlyAdd = 0) {
    this.geometry = new BufferGeometry();
    const positions = [];
    const toAdd = onlyAdd === 0 ? this.particleCount : onlyAdd;
    const n2 = toAdd / 2;
    for (let i = 0; i < toAdd; i++) {
      const x = Math.random() * toAdd - n2;
      const y = Math.random() * toAdd - n2;
      const z = Math.random() * toAdd - n2;
      positions.push(x, y, z);
    }
    this.geometry.setAttribute(
      "position",
      new Float32BufferAttribute(positions, 3)
    );
  }

  createSphere(onlyAdd = 0) {
    this.geometry = new Geometry();
    this.spherical = new Spherical();
    const toAdd = onlyAdd === 0 ? this.particleCount : onlyAdd;
    for (let i = 0; i < toAdd; i++) {
      this.geometry.vertices.push(this.setRandomPointInSphere(this.distance)); // 10 is the desired radius
    }
  }

  setRandomPointInSphere(radius) {
    const v = new Vector3(
      THREEMATH.randFloatSpread(radius * 2),
      THREEMATH.randFloatSpread(radius * 2),
      THREEMATH.randFloatSpread(radius * 2)
    );
    if (v.length() > radius) {
      return this.setRandomPointInSphere(radius);
    }
    return v;
  }

  initParameters() {
    this.parameters = [
      [[1, 1, 0.5], 3],
      [[0.95, 1, 0.5], 3],
      [[0.9, 1, 0.5], 3],
      [[0.85, 1, 0.5], 3],
      [[0.8, 1, 0.5], 3],
    ];
    this.parameterCount = this.parameters.length;
    for (let i = 0; i < this.parameterCount; i++) {
      this.color = this.parameters[i][0];
      this.size = this.parameters[i][1];

      const loader = new GifLoader();

      const texture = loader.load(
        boos[Math.floor(Math.random() * boos.length)],
        function (reader) {},
        function (xhr) {},
        function () {
          console.error("An error happened.");
        }
      );

      texture.minFilter = LinearFilter;

      this.materials[i] = new PointsMaterial({
        size: this.size,
        map: texture,
        blending: AdditiveBlending,
        transparent: true,
        depthTest: false,
      });

      this.particles = new Points(this.geometry, this.materials[i]);
      this.particles.rotation.x = Math.random() * 6;
      this.particles.rotation.y = Math.random() * 6;
      this.particles.rotation.z = Math.random() * 6;

      this.addToScene(this.particles);
    }
  }

  addEventListener() {
    window.addEventListener("resize", this.onWindowResize.bind(this), false);
  }

  onIncrease(x, y) {
    if (x > y) {
      return true;
    } else {
      return false;
    }
  }

  onWindowResize() {
    this.windowHalfX = window.innerWidth / 2;
    this.windowHalfY = window.innerHeight / 2;

    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  updateRendererSize() {
    this.renderer.setSize(this.width, this.height);
    this.camera.aspect = this.width / this.height;
    this.camera.updateProjectionMatrix();
  }

  addToScene(obj) {
    this.scene.add(obj);
  }

  onKnobMovementX(value) {
    if (this.onIncrease(value, this.knobX)) {
      this.camera.position.x += value - this.camera.position.x;
    } else {
      this.camera.position.x -= value + this.camera.position.x;
    }
    this.knobX = value;
  }

  onKnobMovementY(value) {
    if (this.onIncrease(value, this.knobY)) {
      this.camera.position.y += value - this.camera.position.y;
    } else {
      this.camera.position.y -= value + this.camera.position.y;
    }
    this.knobY = value;
  }

  onKnobMovementZ(value) {
    if (this.onIncrease(value, this.knobZ)) {
      this.camera.position.z -= value + this.camera.position.z;
    } else {
      this.camera.position.z += value - this.camera.position.z;
    }
    this.knobZ = value;
  }

  updateStats() {
    this.stats.update();
  }

  activateAutoRotation(rotation) {
    this.autoRotate = rotation;
    if (!this.autoRotate) {
      this.rotation = Date.now() * 0.00005;
    }
  }

  getRandomArbitrary(min, max) {
    return Math.random() * (max - min) + min;
  }

  setDistance(value) {
    this.updateGeometry(value);
    this.distance = value;
  }

  updateGeometry(value) {
    for (let i = 0; i < this.scene.children.length; i++) {
      const object = this.scene.children[i];
      if (object instanceof Points) {
        object.geometry.vertices.forEach((element) => {
          const v = new Vector3(
            THREEMATH.randFloatSpread(value * 2),
            THREEMATH.randFloatSpread(value * 2),
            THREEMATH.randFloatSpread(value * 2)
          );
          element.set(v.x, v.y, v.z);
          object.geometry.verticesNeedUpdate = true;
        });
      }
    }
  }

  updateGeometryX() {
    for (let i = 0; i < this.scene.children.length; i++) {
      const object = this.scene.children[i];
      if (object instanceof Points) {
        object.rotateX(this.rotation);
      }
    }
  }

  updateGeometryY() {
    for (let i = 0; i < this.scene.children.length; i++) {
      const object = this.scene.children[i];
      if (object instanceof Points) {
        object.rotateY(this.rotation);
      }
    }
  }

  updateGeometryZ() {
    for (let i = 0; i < this.scene.children.length; i++) {
      const object = this.scene.children[i];
      if (object instanceof Points) {
        object.rotateZ(this.rotation);
      }
    }
  }

  setH(value) {
    this.h = value;
  }

  setS(value) {
    this.s = value;
  }

  setL(value) {
    this.l = value;
  }

  updateGeometryColor() {
    for (let i = 0; i < this.materials.length; i++) {
      this.materials[i].color.setHSL(this.h, this.s, this.l);
    }
  }

  activateRandomColors(value) {
    this.randomColors = value;
  }

  render() {
    if (this.autoRotate) {
      this.rotation = Date.now() * 0.00005;
    }

    this.camera.lookAt(this.scene.position);

    for (let i = 0; i < this.scene.children.length; i++) {
      const object = this.scene.children[i];

      if (object instanceof Points) {
        if (this.randomColors) {
          const color = i % 2 === 0 ? this.color[0] : this.color[1];
          object.material.color.setHSL(
            ((360 * (color + Date.now() * 0.00005)) % 360) / 360,
            this.s,
            this.l
          );
        } else {
          object.material.color.setHSL(this.h, this.s, this.l);
        }

        object.rotation.y = this.rotation;
      }
    }

    this.renderer.render(this.scene, this.camera);
  }
}
