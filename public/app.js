import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const canvas = document.querySelector('#scene');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x07100d);
scene.fog = new THREE.FogExp2(0x07100d, 0.022);

const camera = new THREE.PerspectiveCamera(42, innerWidth / innerHeight, 0.1, 500);
camera.position.set(12, 7.3, 14);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.06;
controls.target.set(0, 1.7, 0);
controls.minDistance = 7;
controls.maxDistance = 30;
controls.maxPolarAngle = Math.PI * 0.48;
controls.autoRotate = true;
controls.autoRotateSpeed = 0.65;

scene.add(new THREE.HemisphereLight(0xb9e7ff, 0x162219, 1.5));
const key = new THREE.DirectionalLight(0xffe3b3, 3.2);
key.position.set(8, 13, 7);
key.castShadow = true;
key.shadow.mapSize.set(2048, 2048);
key.shadow.camera.left = -20; key.shadow.camera.right = 20;
key.shadow.camera.top = 20; key.shadow.camera.bottom = -20;
scene.add(key);
const rim = new THREE.DirectionalLight(0x62ffd0, 2.1);
rim.position.set(-10, 5, -8);
scene.add(rim);

const ground = new THREE.Mesh(
  new THREE.CircleGeometry(34, 96),
  new THREE.MeshStandardMaterial({ color: 0x111c16, roughness: 0.96, metalness: 0.02 })
);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

const grid = new THREE.GridHelper(50, 50, 0x315849, 0x183229);
grid.material.opacity = 0.28;
grid.material.transparent = true;
grid.position.y = 0.012;
scene.add(grid);

function mat(color, metalness=.55, roughness=.45) {
  return new THREE.MeshStandardMaterial({ color, metalness, roughness });
}
const armorMat = mat(0x26342c, .72, .38);
const armorDark = mat(0x101714, .82, .30);
const accentMat = new THREE.MeshStandardMaterial({ color:0xffb735, emissive:0x4a2300, emissiveIntensity:.45, metalness:.55, roughness:.3 });
const glassMat = new THREE.MeshPhysicalMaterial({ color:0x1c4851, transmission:.18, transparent:true, opacity:.74, roughness:.18, metalness:.22 });
const lightMat = new THREE.MeshStandardMaterial({ color:0xbaffdf, emissive:0x63ffc2, emissiveIntensity:4 });

const vehicle = new THREE.Group();
vehicle.position.y = 0.85;
scene.add(vehicle);

function box(name, size, pos, material, bevel=false) {
  const g = new THREE.BoxGeometry(...size);
  const m = new THREE.Mesh(g, material);
  m.name = name;
  m.position.set(...pos);
  m.castShadow = true;
  m.receiveShadow = true;
  vehicle.add(m);
  return m;
}

// Main hull and cabin
box('lowerHull', [7.6, 1.25, 3.0], [0, 1.05, 0], armorDark);
box('upperHull', [5.45, 1.55, 2.72], [-.35, 2.18, 0], armorMat);
const nose = box('nose', [1.9, 1.38, 2.85], [3.16, 1.85, 0], armorMat);
nose.rotation.z = -0.05;
box('roof', [4.1, .35, 2.5], [-.55, 3.05, 0], armorDark);
box('rearModule', [1.25, 1.8, 2.85], [-3.15, 2.05, 0], armorMat);

// Windows
box('windshield', [.12, .95, 2.18], [4.08, 2.34, 0], glassMat).rotation.z = -0.06;
box('leftWindow', [2.55, .86, .08], [1.25, 2.38, 1.405], glassMat);
box('rightWindow', [2.55, .86, .08], [1.25, 2.38, -1.405], glassMat);

// Bumpers and guards
box('frontBumper', [.45, .56, 3.42], [4.08, .78, 0], armorDark);
box('rearBumper', [.35, .48, 3.2], [-4.0, .8, 0], armorDark);
box('sideGuardL', [5.5, .25, .18], [-.1, .9, 1.68], armorDark);
box('sideGuardR', [5.5, .25, .18], [-.1, .9, -1.68], armorDark);

// Headlights
for (const z of [-.83, .83]) box('headlight', [.13, .35, .58], [4.32, 1.55, z], lightMat);

// Wheels
const wheelGeo = new THREE.CylinderGeometry(.83, .83, .55, 28);
const tireMat = mat(0x070908, .05, .98);
const hubMat = mat(0x617268, .8, .27);
const wheels = [];
for (const x of [-2.65, 0, 2.65]) {
  for (const z of [-1.72, 1.72]) {
    const wheel = new THREE.Group();
    const tire = new THREE.Mesh(wheelGeo, tireMat);
    tire.rotation.x = Math.PI / 2;
    tire.castShadow = true;
    wheel.add(tire);
    const hub = new THREE.Mesh(new THREE.CylinderGeometry(.32,.32,.58,18), hubMat);
    hub.rotation.x = Math.PI / 2;
    hub.castShadow = true;
    wheel.add(hub);
    wheel.position.set(x, .63, z);
    vehicle.add(wheel);
    wheels.push(wheel);
  }
}

// Solar panels
const solarGroup = new THREE.Group();
vehicle.add(solarGroup);
function solarPanel(z, rot=0) {
  const panel = new THREE.Mesh(new THREE.BoxGeometry(2.3,.10,1.05), mat(0x172f47,.35,.25));
  panel.position.set(-.5, 3.43, z);
  panel.rotation.x = rot;
  panel.castShadow = true;
  solarGroup.add(panel);
  for (let i=-4;i<=4;i++) {
    const line = new THREE.Mesh(new THREE.BoxGeometry(.015,.012,.98), mat(0x7aa9c7,.1,.4));
    line.position.set(i*.23,.06,0); panel.add(line);
  }
  return panel;
}
const solarL = solarPanel(.65, 0);
const solarR = solarPanel(-.65, 0);

// Side doors
const doorL = box('doorL', [1.2, 1.45, .12], [-.3, 2.0, 1.49], armorDark);
const doorR = box('doorR', [1.2, 1.45, .12], [-.3, 2.0, -1.49], armorDark);

// Drone and bay
const droneBay = box('droneBay', [1.3,.25,1.25], [-1.85,3.36,0], armorDark);
const drone = new THREE.Group();
const droneBody = new THREE.Mesh(new THREE.BoxGeometry(.65,.16,.34), armorDark);
droneBody.castShadow = true; drone.add(droneBody);
for (const sx of [-1,1]) for (const sz of [-1,1]) {
  const arm = new THREE.Mesh(new THREE.BoxGeometry(.62,.06,.06), armorMat);
  arm.rotation.y = (sx===sz ? Math.PI/4 : -Math.PI/4);
  arm.position.set(sx*.27,0,sz*.18); drone.add(arm);
  const rotor = new THREE.Mesh(new THREE.CylinderGeometry(.22,.22,.025,20), armorDark);
  rotor.position.set(sx*.53,.04,sz*.42); drone.add(rotor);
}
drone.position.set(-1.85,3.68,0);
vehicle.add(drone);

// Sensors and antenna
const mast = new THREE.Mesh(new THREE.CylinderGeometry(.06,.09,.92,12), armorDark);
mast.position.set(-2.75,3.68,0); mast.castShadow=true; vehicle.add(mast);
const sensor = new THREE.Mesh(new THREE.SphereGeometry(.22,18,12), glassMat);
sensor.position.set(-2.75,4.17,0); vehicle.add(sensor);

// Environment rocks
for (let i=0; i<26; i++) {
  const rock = new THREE.Mesh(new THREE.DodecahedronGeometry(.25 + Math.random()*.55, 0), mat(0x273128,.05,.95));
  const a = Math.random()*Math.PI*2;
  const r = 7 + Math.random()*18;
  rock.position.set(Math.cos(a)*r, .1, Math.sin(a)*r);
  rock.scale.y = .5 + Math.random();
  rock.rotation.set(Math.random(),Math.random(),Math.random());
  rock.castShadow = rock.receiveShadow = true;
  scene.add(rock);
}

const modeData = {
  diesel: ['Diesel Hybrid Mode', 'Long-range travel with the diesel generator supporting electric wheel motors. Best for rough terrain and extended missions.'],
  ev: ['Silent EV Mode', 'Low-noise electric movement for reconnaissance and stealth. Exterior lights dim and the powertrain glow shifts to electric cyan.'],
  amphibious: ['Amphibious Mode', 'Suspension rises, water-jet systems activate and sealed body controls prepare the vehicle for rivers and lakes.'],
  night: ['Night Operations', 'Visible lighting is reduced while thermal, infrared and low-light sensors take priority for safe movement after dark.']
};

let activeMode = 'diesel';
function applyMode(mode) {
  activeMode = mode;
  document.querySelectorAll('.mode').forEach(b => b.classList.toggle('active', b.dataset.mode === mode));
  document.querySelector('#modeTitle').textContent = modeData[mode][0];
  document.querySelector('#modeText').textContent = modeData[mode][1];
  if (mode === 'ev') {
    lightMat.color.set(0x9af7ff); lightMat.emissive.set(0x3de9ff);
    renderer.toneMappingExposure = .92;
  } else if (mode === 'amphibious') {
    lightMat.color.set(0xb6d9ff); lightMat.emissive.set(0x3a74ff);
    renderer.toneMappingExposure = 1.02;
  } else if (mode === 'night') {
    lightMat.color.set(0x77ffb0); lightMat.emissive.set(0x00ff7f);
    renderer.toneMappingExposure = .55;
  } else {
    lightMat.color.set(0xbaffdf); lightMat.emissive.set(0x63ffc2);
    renderer.toneMappingExposure = 1.05;
  }
}

document.querySelectorAll('.mode').forEach(btn => btn.addEventListener('click', () => applyMode(btn.dataset.mode)));
document.querySelector('#autoRotate').addEventListener('change', e => controls.autoRotate = e.target.checked);
document.querySelector('#resetView').addEventListener('click', () => {
  camera.position.set(12, 7.3, 14); controls.target.set(0,1.7,0); controls.update();
});

let doorsOpen = false, solarOpen = false, droneOut = false;
document.querySelector('#doors').addEventListener('change', e => doorsOpen = e.target.checked);
document.querySelector('#solar').addEventListener('change', e => solarOpen = e.target.checked);
document.querySelector('#drone').addEventListener('change', e => droneOut = e.target.checked);

function damp(current, target, speed=.08) { return THREE.MathUtils.lerp(current, target, speed); }
const clock = new THREE.Clock();
function animate() {
  requestAnimationFrame(animate);
  const t = clock.getElapsedTime();
  controls.update();

  wheels.forEach(w => w.rotation.z -= controls.autoRotate ? .006 : 0);
  doorL.rotation.x = damp(doorL.rotation.x, doorsOpen ? -1.2 : 0);
  doorR.rotation.x = damp(doorR.rotation.x, doorsOpen ? 1.2 : 0);
  solarL.rotation.x = damp(solarL.rotation.x, solarOpen ? -1.0 : 0);
  solarR.rotation.x = damp(solarR.rotation.x, solarOpen ? 1.0 : 0);
  drone.position.y = damp(drone.position.y, droneOut ? 6.2 : 3.68, .04);
  drone.position.x = damp(drone.position.x, droneOut ? -3.7 : -1.85, .04);
  drone.rotation.y += droneOut ? .012 : .002;
  if (droneOut) drone.position.z = Math.sin(t*1.1)*.5;
  else drone.position.z = damp(drone.position.z, 0, .08);

  vehicle.position.y = .85 + Math.sin(t*.65)*.025;
  if (activeMode === 'amphibious') vehicle.position.y = damp(vehicle.position.y, 1.18, .025);
  renderer.render(scene, camera);
}
animate();

addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});

window.addEventListener('load', () => setTimeout(() => document.querySelector('#loading').classList.add('hidden'), 650));
