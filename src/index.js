//CAPNGANJ Hatched Fungus
//September, 2022

//imports
import { Features } from './Features';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { MushroomCap } from './MushroomCap';

import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { HalftonePass } from 'three/examples/jsm/postprocessing/HalftonePass';


//1) - generate fxhash features - global driving parameters
//new featuresClass
let feet = new Features();
window.$fxhashData = feet;

// FX Features
window.$fxhashFeatures = {
  // "Palette" : feet.color.inverted ? feet.color.name + " Invert" : feet.color.name,
  // "Scatter": feet.pattern.scatterTag,
   "Pattern Size" : feet.pattern.sizeTag,
   "Pattern" : feet.pattern.anglesTag,
   "Sunlight" : feet.lightsAndCamera.lightsTag,
   "Camera": feet.lightsAndCamera.cameraTag
};
console.log(window.$fxhashFeatures);
//console.log(feet);

//vars related to fxhash preview call
//previewed tracks whether preview has been called
let previewed = false;
let loaded = false;

//from fxhash webpack boilerplate
// these are the variables you can use as inputs to your algorithms
//console.log(fxhash)   // the 64 chars hex number fed to your algorithm
//console.log(fxrand()) // deterministic PRNG function, use it instead of Math.random()
//console.log("fxhash features", window.$fxhashFeatures);


//2) Initialize three.js scene and start the render loop
//all data driving geometry and materials and whatever else should be generated in step 2




//global vars 
let controls, renderer, scene, camera, skullObj, animateSkull;
let postprocessing = {selectedObjects: []}
init();

function init() {
  //scene & camera
  scene = new THREE.Scene();
  const sCol = new THREE.Color(1,1,1);
  scene.background = sCol;
  //scene.fog = new THREE.Fog(sCol, 5, 26)

  renderer = new THREE.WebGLRenderer( { 
    antialias: true,
    alpha: true
  } );

  //renderer
  let w = computeCanvasSize()
  renderer.setPixelRatio( w.w/w.h );
  renderer.setSize( w.w, w.h );
  renderer.shadowMap.enabled = true;
  renderer.domElement.id = "hashish";
  //renderer.domElement.style.backgroundColor = feet.background.value
  document.body.style.backgroundColor = feet.background.value
  document.body.style.display = 'flex';
  document.body.style.justifyContent = 'center';
  document.body.style.alignItems = 'center'
  renderer.domElement.style.paddingTop = w.topPadding.toString() + 'px'
  document.body.appendChild( renderer.domElement );

  //camera and orbit controls
  camera = new THREE.PerspectiveCamera( 60, w.w / w.h, 0.01, 100 );
  camera.position.set( feet.lightsAndCamera.cameraVal.x, feet.lightsAndCamera.cameraVal.y, 32 );

  // controls
  controls = new OrbitControls( camera, renderer.domElement );
  controls.target = new THREE.Vector3(0, 3, 0)
  controls.enableDamping =true;
  controls.dampingFactor = 0.2;
  controls.autoRotateSpeed = 1.0;
  controls.maxDistance = 50;
  controls.minDistance = 18;

  //lights
  const p1 = new THREE.DirectionalLight( );
  //p1.color = new THREE.Color(1,1,0)
  p1.intensity = 0.6
  p1.position.set( feet.lightsAndCamera.lightsVal, 15, 15);
  p1.castShadow = true;
  p1.shadow.mapSize.width = 2048;
  p1.shadow.mapSize.height = 2048;
  const d = 15;
  p1.shadow.camera.left = -d;
  p1.shadow.camera.right = d;
  p1.shadow.camera.top = d;
  p1.shadow.camera.bottom = -d;
  p1.shadow.camera.far = 1000;
  scene.add(p1);
  
  const amb = new THREE.AmbientLight( 0xffffff, 0.4);
  //scene.add(amb);


  //geometry and materials

  //toon material 
  const format = ( renderer.capabilities.isWebGL2 ) ? THREE.RedFormat : THREE.LuminanceFormat;
  const colors = new Uint8Array(5);
  for (let c = 0; c < colors.length; c++) {
    colors[c] = (c/colors.length) * 256;
  }
  const gradientMap = new THREE.DataTexture(colors, colors.length, 1, format);
  gradientMap.needsUpdate = true;
  const toon = new THREE.MeshToonMaterial({
    color: new THREE.Color(),
    gradientMap: gradientMap
  });

  //single mushroom geometry
  let mH = feet.map(fxrand(), 0, 1, 10, 20);
  let mW = feet.map(fxrand(), 0, 1, 10, 15)
  let gHF = feet.map(fxrand(), 0, 1, 0.15, 0.3)
  let gDF = feet.map(fxrand(), 0, 1, 0.1, 0.75)      
  const c = new MushroomCap(mW, mH, gHF, gDF, feet)
  const meshMat = new THREE.MeshStandardMaterial();
  const mesh = new THREE.Mesh(c.mergedBufferGeometry, toon)
  scene.add(mesh);
  skullObj = mesh;
  

  //postporocessing stuff
  initPostprocessing();
  renderer.autoClear = false;

  //animation controls and state
  animateSkull = false;
  renderer.domElement.addEventListener( 'dblclick', toggleAutorotate);

  //set up resize listener and let it rip!
  window.addEventListener( 'resize', onWindowResize );
  
  animate();
}


function initPostprocessing() {
  const sizer = computeCanvasSize()
  //renderrender
  const renderPass = new RenderPass( scene, camera);
  //halftone
  const params = {
    shape: 1, 
    radius: feet.pattern.sizeVal,
    rotateR: feet.pattern.anglesVals.r , // all could be features...
    rotateB: feet.pattern.anglesVals.g,
    rotateG: feet.pattern.anglesVals.b,
    scatter: 0,
    blending: 0,
    blendingMode: 2,
    greyscale: true,
    disable: false
  };
  const halftonePass = new HalftonePass(sizer.w, sizer.h, params)
  

  const composer = new EffectComposer( renderer );

  //render
  composer.addPass(renderPass);
  //halftone pass
  composer.addPass(halftonePass)

  postprocessing.composer = composer;
}

function computeCanvasSize() {
  
  //get the window width and height
  const ww = window.innerWidth;
  const wh = window.innerHeight;

  const smallEdgeSize = ((ww + wh)/2) * 0.02

  //return object to populate
  const ret = {}

  //we want to draw a horizontal golden rectangle with a border, as big as possible
  //does the horizontal dimension drive, or vertical
  if ( ww/wh >= 1 ) {
    //window is wide - let height drive
    ret.h = Math.round(wh - (smallEdgeSize * 2.5));
    ret.w = Math.round(ret.h);
  } else {
    //window is tall - let width drive
    ret.w = Math.round(ww - (smallEdgeSize * 2));
    ret.h = Math.round(ret.w);
  }

  
  ret.topPadding = (wh/2) - (ret.h/2)

  return ret;
}


// threejs animation stuff
function onWindowResize() {

  let w = computeCanvasSize();

  camera.aspect = w.w / w.h;
  camera.updateProjectionMatrix();
  renderer.setPixelRatio( w.w / w.h);
  renderer.setSize( w.w, w.h );

  renderer.domElement.style.paddingTop = w.topPadding.toString() + 'px'

}

function animate() {

  controls.update(); // only required if controls.enableDamping = true, or if controls.autoRotate = true

  requestAnimationFrame( animate );
  render();

}

function render() {

  postprocessing.composer.render( scene, camera );

  if(previewed == false && loaded == true){
    fxpreview();
    previewed = true;
    //download();
  } 

}

function toggleAutorotate() {
  controls.autoRotate = !controls.autoRotate;
}

function download() {
  var link = document.createElement('a');
  link.download = 'AcidWarning.png';
  link.href = document.getElementById('hashish').toDataURL()
  link.click();
}
