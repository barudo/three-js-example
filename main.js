import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const MODEL_URL = './attachments/final.glb';
const canvas = document.querySelector('#scene');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });

renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xf3f4f6);

const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);
camera.position.set(0, 1.2, 6);

const modelRoot = new THREE.Group();
scene.add(modelRoot);

const ambientLight = new THREE.AmbientLight(0xffffff, 2.2);
scene.add(ambientLight);

const keyLight = new THREE.DirectionalLight(0xffffff, 2.6);
keyLight.position.set(4, 5, 6);
scene.add(keyLight);

const fillLight = new THREE.DirectionalLight(0xffffff, 1.4);
fillLight.position.set(-4, 2, -4);
scene.add(fillLight);

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
const selectableMeshes = [];
let selectedMesh = null;
let selectedOutline = null;

const dragState = {
  active: false,
  moved: false,
  startX: 0,
  startY: 0,
  lastX: 0,
  lastY: 0
};

new GLTFLoader().load(
  MODEL_URL,
  (gltf) => {
    const model = gltf.scene;
    model.rotation.x = Math.PI / 2;
    modelRoot.add(model);

    model.traverse((object) => {
      if (!object.isMesh) return;

      object.castShadow = true;
      object.receiveShadow = true;
      selectableMeshes.push(object);
    });

    centerModel(model);
    render();
  },
  undefined,
  (error) => {
    console.error('Unable to load GLB model:', error);
  }
);

document.querySelectorAll('.swatch').forEach((button) => {
  button.addEventListener('click', () => {
    if (!selectedMesh) return;
    setMeshColor(selectedMesh, button.dataset.color);
    render();
  });
});

canvas.addEventListener('pointerdown', (event) => {
  dragState.active = true;
  dragState.moved = false;
  dragState.startX = event.clientX;
  dragState.startY = event.clientY;
  dragState.lastX = event.clientX;
  dragState.lastY = event.clientY;
  canvas.setPointerCapture(event.pointerId);
});

canvas.addEventListener('pointermove', (event) => {
  if (!dragState.active) return;

  const totalX = event.clientX - dragState.startX;
  const totalY = event.clientY - dragState.startY;
  if (Math.hypot(totalX, totalY) > 4) {
    dragState.moved = true;
  }

  const deltaX = event.clientX - dragState.lastX;
  const deltaY = event.clientY - dragState.lastY;
  modelRoot.rotation.y += deltaX * 0.01;
  modelRoot.rotation.x += deltaY * 0.01;
  modelRoot.rotation.x = THREE.MathUtils.clamp(modelRoot.rotation.x, -1.2, 1.2);

  dragState.lastX = event.clientX;
  dragState.lastY = event.clientY;
  render();
});

canvas.addEventListener('pointerup', (event) => {
  if (!dragState.active) return;

  dragState.active = false;
  canvas.releasePointerCapture(event.pointerId);

  if (!dragState.moved) {
    selectMesh(event);
  }
});

window.addEventListener('resize', () => {
  resizeRenderer();
  render();
});

resizeRenderer();
render();

function centerModel(model) {
  const box = new THREE.Box3().setFromObject(model);
  const center = box.getCenter(new THREE.Vector3());
  const size = box.getSize(new THREE.Vector3());
  const maxDimension = Math.max(size.x, size.y, size.z);

  model.position.sub(center);

  const distance = maxDimension / (2 * Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2));
  camera.position.set(0, maxDimension * 0.18, distance * 1.55);
  camera.near = Math.max(distance / 100, 0.01);
  camera.far = distance * 100;
  camera.lookAt(0, 0, 0);
  camera.updateProjectionMatrix();
}

function selectMesh(event) {
  const rect = canvas.getBoundingClientRect();
  pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

  raycaster.setFromCamera(pointer, camera);
  const hits = raycaster.intersectObjects(selectableMeshes, false);
  selectedMesh = hits.length > 0 ? hits[0].object : null;
  updateSelectedOutline();
  render();
}

function setMeshColor(mesh, color) {
  if (Array.isArray(mesh.material)) {
    mesh.material = mesh.material.map((material) => cloneMaterialWithColor(material, color));
    return;
  }

  mesh.material = cloneMaterialWithColor(mesh.material, color);
}

function cloneMaterialWithColor(material, color) {
  const cloned = material.clone();
  cloned.color.set(color);
  cloned.needsUpdate = true;
  return cloned;
}

function updateSelectedOutline() {
  if (selectedOutline) {
    selectedOutline.parent.remove(selectedOutline);
    selectedOutline.geometry.dispose();
    selectedOutline.material.dispose();
    selectedOutline = null;
  }

  if (!selectedMesh) return;

  selectedOutline = new THREE.BoxHelper(selectedMesh, 0x111827);
  scene.add(selectedOutline);
}

function resizeRenderer() {
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;

  renderer.setSize(width, height, false);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
}

function render() {
  if (selectedOutline) {
    selectedOutline.update();
  }

  renderer.render(scene, camera);
}
