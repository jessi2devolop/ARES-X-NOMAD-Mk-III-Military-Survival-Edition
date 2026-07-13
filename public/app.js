import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';

const canvas=document.querySelector('#scene');
const renderer=new THREE.WebGLRenderer({canvas,antialias:true,powerPreference:'high-performance'});
renderer.setPixelRatio(Math.min(devicePixelRatio,1.75));
renderer.setSize(innerWidth,innerHeight);
renderer.shadowMap.enabled=true;
renderer.shadowMap.type=THREE.PCFSoftShadowMap;
renderer.outputColorSpace=THREE.SRGBColorSpace;
renderer.toneMapping=THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure=.95;

const scene=new THREE.Scene();
scene.background=new THREE.Color(0x0b1215);
scene.fog=new THREE.FogExp2(0x10191b,.018);

const camera=new THREE.PerspectiveCamera(38,innerWidth/innerHeight,.1,600);
camera.position.set(13.5,6.8,15.5);
const controls=new OrbitControls(camera,renderer.domElement);
controls.enableDamping=true;
controls.dampingFactor=.055;
controls.target.set(0,1.8,0);
controls.minDistance=7.5;
controls.maxDistance=34;
controls.maxPolarAngle=Math.PI*.49;
controls.autoRotate=true;
controls.autoRotateSpeed=.45;

const composer=new EffectComposer(renderer);
composer.addPass(new RenderPass(scene,camera));
const bloom=new UnrealBloomPass(new THREE.Vector2(innerWidth,innerHeight),.28,.55,.88);
composer.addPass(bloom);

function noiseTexture(size,base,fleck){
 const c=document.createElement('canvas'); c.width=c.height=size;
 const x=c.getContext('2d'); x.fillStyle=base; x.fillRect(0,0,size,size);
 for(let i=0;i<size*14;i++){x.globalAlpha=Math.random()*.16;x.fillStyle=fleck;const s=Math.random()*3+.4;x.fillRect(Math.random()*size,Math.random()*size,s,s)}
 x.globalAlpha=1; const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=renderer.capabilities.getMaxAnisotropy();return t;
}
const paintMap=noiseTexture(512,'#354137','#090d0a');paintMap.repeat.set(3,2);
const groundMap=noiseTexture(512,'#3a3a30','#11120e');groundMap.repeat.set(28,28);

const armor=new THREE.MeshStandardMaterial({map:paintMap,color:0x6c765f,metalness:.72,roughness:.43});
const dark=new THREE.MeshStandardMaterial({color:0x161c19,metalness:.82,roughness:.31});
const rubber=new THREE.MeshStandardMaterial({color:0x080a09,metalness:.02,roughness:.96});
const steel=new THREE.MeshStandardMaterial({color:0x636b64,metalness:.91,roughness:.26});
const glass=new THREE.MeshPhysicalMaterial({color:0x17343b,metalness:.16,roughness:.12,transmission:.22,transparent:true,opacity:.82,clearcoat:1});
const lamp=new THREE.MeshStandardMaterial({color:0xeafff6,emissive:0xb8ffe5,emissiveIntensity:7,roughness:.2});
const amber=new THREE.MeshStandardMaterial({color:0xffb34a,emissive:0xff7b17,emissiveIntensity:4.2});
const solarMat=new THREE.MeshPhysicalMaterial({color:0x173b56,metalness:.44,roughness:.19,clearcoat:1});

scene.add(new THREE.HemisphereLight(0xb8d3db,0x171a14,1.15));
const sun=new THREE.DirectionalLight(0xffe0b3,5.3);sun.position.set(12,18,8);sun.castShadow=true;sun.shadow.mapSize.set(4096,4096);sun.shadow.camera.left=-24;sun.shadow.camera.right=24;sun.shadow.camera.top=24;sun.shadow.camera.bottom=-24;sun.shadow.bias=-.0003;scene.add(sun);
const fill=new THREE.DirectionalLight(0x7cc6d3,1.25);fill.position.set(-12,8,-9);scene.add(fill);

const sky=new THREE.Mesh(new THREE.SphereGeometry(260,32,16),new THREE.ShaderMaterial({
 side:THREE.BackSide,
 uniforms:{topColor:{value:new THREE.Color(0x1f3a45)},bottomColor:{value:new THREE.Color(0x88745b)},offset:{value:20},exponent:{value:.85}},
 vertexShader:'varying vec3 vWorldPosition;void main(){vec4 w=modelMatrix*vec4(position,1.0);vWorldPosition=w.xyz;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',
 fragmentShader:'uniform vec3 topColor;uniform vec3 bottomColor;uniform float offset;uniform float exponent;varying vec3 vWorldPosition;void main(){float h=normalize(vWorldPosition+offset).y;gl_FragColor=vec4(mix(bottomColor,topColor,max(pow(max(h,0.0),exponent),0.0)),1.0);}'
}));scene.add(sky);

const ground=new THREE.Mesh(new THREE.CircleGeometry(65,160),new THREE.MeshStandardMaterial({map:groundMap,color:0x59594a,roughness:.98}));
ground.rotation.x=-Math.PI/2;ground.receiveShadow=true;scene.add(ground);

function mountain(a,r,h,w,c){const m=new THREE.Mesh(new THREE.ConeGeometry(w,h,7),new THREE.MeshStandardMaterial({color:c,roughness:1}));m.position.set(Math.cos(a)*r,h*.48-.5,Math.sin(a)*r);m.rotation.y=a;m.scale.z=.64;scene.add(m)}
for(let i=0;i<22;i++)mountain(i/22*Math.PI*2,42+Math.random()*17,7+Math.random()*14,5+Math.random()*8,i%2?0x29332f:0x343a34);

function tree(x,z,s=1){
 const g=new THREE.Group();const tr=new THREE.Mesh(new THREE.CylinderGeometry(.11*s,.17*s,1.7*s,7),new THREE.MeshStandardMaterial({color:0x3b2e21,roughness:1}));tr.position.y=.85*s;g.add(tr);
 const fm=new THREE.MeshStandardMaterial({color:0x1d3326,roughness:.95});
 for(let i=0;i<3;i++){const c=new THREE.Mesh(new THREE.ConeGeometry((.95-i*.16)*s,1.5*s,8),fm);c.position.y=(1.55+i*.62)*s;c.castShadow=true;g.add(c)}
 g.position.set(x,0,z);scene.add(g)
}
for(let i=0;i<58;i++){const a=Math.random()*Math.PI*2,r=15+Math.random()*29;tree(Math.cos(a)*r,Math.sin(a)*r,.65+Math.random()*1.4)}

const vehicle=new THREE.Group();vehicle.position.y=.92;vehicle.rotation.y=-.22;scene.add(vehicle);
function rounded(size,pos,mat,r=.12,seg=4,parent=vehicle){const m=new THREE.Mesh(new RoundedBoxGeometry(...size,seg,r),mat);m.position.set(...pos);m.castShadow=m.receiveShadow=true;parent.add(m);return m}
function panel(size,pos,mat,rot=[0,0,0],parent=vehicle){const m=new THREE.Mesh(new THREE.BoxGeometry(...size),mat);m.position.set(...pos);m.rotation.set(...rot);m.castShadow=m.receiveShadow=true;parent.add(m);return m}

rounded([7.8,1,3],[0,1.14,0],dark,.17);
rounded([5.3,1.48,2.73],[-.42,2.11,0],armor,.2);
const nose=rounded([2.05,1.42,2.82],[3.17,1.95,0],armor,.16);nose.rotation.z=-.105;
panel([1.8,.16,2.55],[3.18,2.54,0],dark,[0,0,-.1]);
rounded([1.18,1.72,2.8],[-3.38,2.06,0],armor,.16);
panel([4.15,.24,2.5],[-.6,3.05,0],dark);
panel([.09,.92,2.18],[4.1,2.35,0],glass,[0,0,-.11]);
panel([2.25,.76,.07],[1.05,2.43,1.39],glass);
panel([2.25,.76,.07],[1.05,2.43,-1.39],glass);
rounded([.48,.55,3.45],[4.13,.82,0],dark,.1);
rounded([.4,.48,3.22],[-4.08,.82,0],dark,.1);
for(const z of[-1.66,1.66])rounded([5.7,.22,.18],[-.1,.88,z],steel,.08);
for(let i=-3;i<=3;i++)panel([.06,.52,2.72],[i*.48,.64,0],steel,[0,0,-.18]);

for(const z of[-.86,.86]){
 rounded([.13,.34,.56],[4.38,1.62,z],lamp,.05);
 const beam=new THREE.SpotLight(0xd9fff1,80,24,Math.PI/10,.52,1.4);beam.position.set(4.42,1.62,z);beam.target.position.set(14,.4,z);vehicle.add(beam,beam.target)
}
for(const z of[-1.18,1.18])rounded([.08,.18,.24],[4.32,1.26,z],amber,.03);

const wheels=[];
for(const x of[-2.72,0,2.72])for(const z of[-1.74,1.74]){
 const w=new THREE.Group();const tire=new THREE.Mesh(new THREE.CylinderGeometry(.86,.86,.58,48),rubber);tire.rotation.x=Math.PI/2;tire.castShadow=true;w.add(tire);
 const rim=new THREE.Mesh(new THREE.CylinderGeometry(.37,.37,.61,24),steel);rim.rotation.x=Math.PI/2;rim.castShadow=true;w.add(rim);
 const hub=new THREE.Mesh(new THREE.CylinderGeometry(.13,.13,.64,16),dark);hub.rotation.x=Math.PI/2;w.add(hub);
 for(let i=0;i<10;i++){const lug=new THREE.Mesh(new THREE.CylinderGeometry(.025,.025,.65,8),dark);lug.rotation.x=Math.PI/2;lug.position.set(Math.cos(i/10*Math.PI*2)*.25,Math.sin(i/10*Math.PI*2)*.25,0);w.add(lug)}
 w.position.set(x,.68,z);vehicle.add(w);wheels.push(w)
}
for(const x of[-2.72,0,2.72])for(const z of[-1.49,1.49]){const a=new THREE.Mesh(new THREE.TorusGeometry(.93,.1,12,42,Math.PI),dark);a.position.set(x,.87,z);a.rotation.set(Math.PI/2,0,z>0?0:Math.PI);a.castShadow=true;vehicle.add(a)}

const solarL=new THREE.Group(),solarR=new THREE.Group();solarL.position.set(-.55,3.33,.42);solarR.position.set(-.55,3.33,-.42);vehicle.add(solarL,solarR);
function solar(parent,side){rounded([2.45,.11,1.02],[0,0,side*.53],dark,.04,3,parent);panel([2.31,.03,.9],[0,.07,side*.53],solarMat,[0,0,0],parent);for(let i=-4;i<=4;i++)panel([.012,.035,.87],[i*.25,.09,side*.53],steel,[0,0,0],parent)}
solar(solarL,1);solar(solarR,-1);

const doorL=rounded([1.22,1.48,.11],[-.25,2,1.46],dark,.08);
const doorR=rounded([1.22,1.48,.11],[-.25,2,-1.46],dark,.08);

const drone=new THREE.Group();rounded([.72,.18,.38],[0,0,0],dark,.06,4,drone);
for(const sx of[-1,1])for(const sz of[-1,1]){panel([.7,.055,.055],[sx*.27,0,sz*.18],steel,[0,sx===sz?Math.PI/4:-Math.PI/4,0],drone);const r=new THREE.Mesh(new THREE.CylinderGeometry(.23,.23,.025,24),dark);r.position.set(sx*.55,.05,sz*.44);drone.add(r)}
drone.position.set(-1.9,3.63,0);vehicle.add(drone);rounded([1.42,.22,1.3],[-1.9,3.28,0],dark,.09);
const mast=new THREE.Mesh(new THREE.CylinderGeometry(.055,.09,.94,16),steel);mast.position.set(-2.92,3.63,0);vehicle.add(mast);
const sensor=new THREE.Mesh(new THREE.SphereGeometry(.23,28,18),glass);sensor.position.set(-2.92,4.13,0);vehicle.add(sensor);

const rockMat=new THREE.MeshStandardMaterial({color:0x36382f,roughness:1});
for(let i=0;i<90;i++){const r=new THREE.Mesh(new THREE.DodecahedronGeometry(.12+Math.random()*.48,0),rockMat);const a=Math.random()*Math.PI*2,d=6+Math.random()*30;r.position.set(Math.cos(a)*d,.04,Math.sin(a)*d);r.scale.y=.4+Math.random()*.85;r.rotation.set(Math.random(),Math.random(),Math.random());r.castShadow=r.receiveShadow=true;scene.add(r)}

const modeData={
 diesel:['Diesel Hybrid Mode','Long-range travel with a diesel generator supporting electric wheel motors. Best for rough terrain and extended missions.'],
 ev:['Silent EV Mode','Low-noise electric movement for reconnaissance and stealth. Lighting changes to an electric cyan signature.'],
 amphibious:['Amphibious Mode','The suspension rises and sealed systems prepare the vehicle for controlled river and lake crossings.'],
 night:['Night Operations','Exterior lighting is reduced while low-light and thermal sensor systems take priority.']
};
let activeMode='diesel';
function mode(m){activeMode=m;document.querySelectorAll('.mode').forEach(b=>b.classList.toggle('active',b.dataset.mode===m));document.querySelector('#modeTitle').textContent=modeData[m][0];document.querySelector('#modeText').textContent=modeData[m][1];
 if(m==='ev'){lamp.color.set(0xc7f9ff);lamp.emissive.set(0x35dcff);renderer.toneMappingExposure=.82;bloom.strength=.38}
 else if(m==='amphibious'){lamp.color.set(0xc7dcff);lamp.emissive.set(0x477dff);renderer.toneMappingExposure=.9;bloom.strength=.34}
 else if(m==='night'){lamp.color.set(0x82ffb4);lamp.emissive.set(0x00ff78);renderer.toneMappingExposure=.42;bloom.strength=.55}
 else{lamp.color.set(0xeafff6);lamp.emissive.set(0xb8ffe5);renderer.toneMappingExposure=.95;bloom.strength=.28}}
document.querySelectorAll('.mode').forEach(b=>b.addEventListener('click',()=>mode(b.dataset.mode)));
document.querySelector('#autoRotate').addEventListener('change',e=>controls.autoRotate=e.target.checked);
document.querySelector('#resetView').addEventListener('click',()=>{camera.position.set(13.5,6.8,15.5);controls.target.set(0,1.8,0);controls.update()});

let doors=false,solarOpen=false,droneOut=false;
document.querySelector('#doors').addEventListener('change',e=>doors=e.target.checked);
document.querySelector('#solar').addEventListener('change',e=>solarOpen=e.target.checked);
document.querySelector('#drone').addEventListener('change',e=>droneOut=e.target.checked);
const damp=(a,b,s=.075)=>THREE.MathUtils.lerp(a,b,s),clock=new THREE.Clock();
function animate(){requestAnimationFrame(animate);const t=clock.getElapsedTime();controls.update();
 doorL.rotation.x=damp(doorL.rotation.x,doors?-1.08:0);doorR.rotation.x=damp(doorR.rotation.x,doors?1.08:0);
 solarL.rotation.x=damp(solarL.rotation.x,solarOpen?-.92:0);solarR.rotation.x=damp(solarR.rotation.x,solarOpen?.92:0);
 drone.position.y=damp(drone.position.y,droneOut?6.1:3.63,.035);drone.position.x=damp(drone.position.x,droneOut?-3.6:-1.9,.035);drone.rotation.y+=droneOut?.018:.003;drone.position.z=droneOut?Math.sin(t*1.3)*.55:damp(drone.position.z,0,.08);
 const y=activeMode==='amphibious'?1.15:.92;vehicle.position.y=damp(vehicle.position.y,y+Math.sin(t*.72)*.015,.08);
 wheels.forEach(w=>w.rotation.z-=controls.autoRotate?.0018:0);composer.render()}
animate();

addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);composer.setSize(innerWidth,innerHeight);bloom.setSize(innerWidth,innerHeight)});
window.addEventListener('load',()=>setTimeout(()=>document.querySelector('#loading').classList.add('hidden'),850));
