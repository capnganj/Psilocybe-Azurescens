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
import { SMAAPass } from 'three/examples/jsm/postprocessing/SMAAPass';


//1) - generate fxhash features - global driving parameters
//new featuresClass
let feet = new Features();
window.$fxhashData = feet;

// FX Features
window.$fxhashFeatures = {
   "Palette" : feet.color.inverted ? feet.color.name + " Invert" : feet.color.name,
  // "Scatter": feet.pattern.scatterTag,
   "Pattern Size" : feet.pattern.sizeTag,
   "Hatch Pattern" : feet.pattern.anglesTag,
   "Background": feet.background.tag,
   "Sunlight" : feet.lightsAndCamera.lightsTag,
   "Camera": feet.lightsAndCamera.cameraTag,
   "Mushrooms": feet.numShrooms.toString()
};
console.log(window.$fxhashFeatures);
//console.log(feet);

//vars related to fxhash preview call
//previewed tracks whether preview has been called
let previewed = false;

//from fxhash webpack boilerplate
// these are the variables you can use as inputs to your algorithms
//console.log(fxhash)   // the 64 chars hex number fed to your algorithm
//console.log(fxrand()) // deterministic PRNG function, use it instead of Math.random()
//console.log("fxhash features", window.$fxhashFeatures);


//2) Initialize three.js scene and start the render loop
//all data driving geometry and materials and whatever else should be generated in step 2




//global vars 
let controls, renderer, scene, camera, firstAnimate
let outerDiv, innerDiv
let postprocessing = {selectedObjects: []}
init();

function init() {
  //scene & camera
  scene = new THREE.Scene();
  const sCol = new THREE.Color(feet.background.value.r/255, feet.background.value.g/255, feet.background.value.b/255);
  scene.background = sCol;
  //scene.background
  scene.fog = new THREE.Fog(sCol, 20, 70)

  renderer = new THREE.WebGLRenderer( { 
    antialias: true,
    alpha: true
  } );

  //renderer
  let w = computeCanvasSize()
  
  renderer.setSize( w.w, w.h);
  renderer.setPixelRatio( window.devicePixelRatio );
  renderer.shadowMap.enabled = true;
  renderer.domElement.id = "hashish";
  //renderer.domElement.style.backgroundColor = feet.background.value
  document.body.style.backgroundColor = 'rgb(5,5,5)'
  document.body.style.display = 'flex'
  document.body.style.justifyContent = 'center'
  document.body.style.alignItems = 'center'
  document.body.style.height = window.innerHeight.toString() + 'px'

  outerDiv = document.createElement('div')
  outerDiv.style.backgroundColor = feet.background.value
  outerDiv.style.display = 'flex'
  outerDiv.style.justifyContent = 'center'
  //outerDiv.style.boxShadow = '3px 3px 15px black'
  //outerDiv.style.alignItems = 'center'
  outerDiv.style.height = w.h.toString() + 'px'
  outerDiv.style.width = w.w.toString() + 'px'
  document.body.appendChild(outerDiv)

  innerDiv = document.createElement('div')
  outerDiv.appendChild(innerDiv)

  //renderer in frame
  //renderer.domElement.style.marginTop = w.nearEdgeOffset.toString() + 'px'
  //renderer.domElement.style.borderStyle = 'solid'
  //renderer.domElement.style.borderColor = feet.invertColor(feet.background.value)
  //renderer.domElement.style.borderWidth = '1px'
  innerDiv.appendChild( renderer.domElement )

  //camera and orbit controls
  camera = new THREE.PerspectiveCamera( 60, w.w / w.h, 0.01, 100 );
  camera.position.set( feet.lightsAndCamera.cameraVal.x, feet.lightsAndCamera.cameraVal.y, 34 );

  // controls
  controls = new OrbitControls( camera, renderer.domElement );
  controls.target = new THREE.Vector3(0, 3, 0)
  controls.enableDamping =true;
  controls.dampingFactor = 0.2;
  controls.autoRotateSpeed = 1;
  controls.maxDistance = 50;
  controls.minDistance = 18;

  //lights
  const p1 = new THREE.DirectionalLight( );
  p1.intensity = 0.4
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

  //light colors
  const p3Col = feet.interpolateFn(0.15);
  const p4Col = feet.interpolateFn(0.66);
  const p5Col = feet.interpolateFn(0.33);
  const p6Col = feet.interpolateFn(0.85);
  
  const p3 = new THREE.DirectionalLight(
    new THREE.Color(p3Col.r/255, p3Col.g/255, p3Col.b/255),
    0.5
  )
  p3.position.set(10,1,10);
  const p4 = new THREE.DirectionalLight(
    new THREE.Color(p4Col.r/255, p4Col.g/255, p4Col.b/255),
    0.5
  )
  p4.position.set(10,1,-10);
  const p5 = new THREE.DirectionalLight(
    new THREE.Color(p5Col.r/255, p5Col.g/255, p5Col.b/255),
    0.5
  )
  p5.position.set(-10,-1,-10);
  const p6 = new THREE.DirectionalLight(
    new THREE.Color(p6Col.r/255, p6Col.g/255, p6Col.b/255),
    0.5
  )
  p6.position.set(-10,-1,10);
  
  scene.add(p3);
  scene.add(p4);
  scene.add(p5);
  scene.add(p6);
  
  const amb = new THREE.AmbientLight( 0xffffff, 0.4);
  //scene.add(amb);


  //geometry and materials
  const toon = new THREE.MeshStandardMaterial();

  //multiples - draw a circle and get points

    const rad = feet.numShrooms < 4 ? 10 : 13
  
    const elle = new THREE.EllipseCurve(0, 0, rad, rad, 0, Math.PI*2, false, 0)
    const ellesPoints = elle.getPoints(feet.numShrooms)

    //vairiable mushroom max sizes
    let maxSize 
    if (feet.numShrooms == 2) {
      maxSize = 15
    } 
    else if (feet.numShrooms == 3) {
      maxSize = 10
    }
    else if (feet.numShrooms == 5) {
      maxSize = 8
    }
    else {
      maxSize = 6
    }

    //loopss
    const obj = new THREE.Object3D()
    for (let i = 0; i < feet.numShrooms; i++) {
      
      let mH = feet.map(fxrand(), 0, 1, 3, maxSize);
	    let mW = feet.map(fxrand(), 0, 1, 5, maxSize)
	    let gHF = feet.map(fxrand(), 0, 1, 0.15, 0.3)
	    let gDF = feet.map(fxrand(), 0, 1, 0.1, 0.75)      
	    const c = new MushroomCap(mW, mH, gHF, gDF, feet)
	    const mesh = new THREE.Mesh(c.mergedBufferGeometry, toon)
      mesh.position.set(ellesPoints[i].x, feet.map(fxrand(), 0, 1, -2, 9), ellesPoints[i].y)
      //mesh.castShadow = true;
      //mesh.receiveShadow = true;
	    obj.add(mesh);
    }
    obj.rotateY(feet.map(fxrand(), 0, 1, -Math.PI, Math.PI))
    scene.add(obj)
  

  

  //postporocessing stuff
  initPostprocessing();
  renderer.autoClear = false;

  //animation controls and state
  firstAnimate = false;
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
    shape: 3, 
    radius: sizer.nearEdgeOffset * feet.pattern.sizeVal,
    rotateR: feet.pattern.anglesVals.r , // all could be features...
    rotateB: feet.pattern.anglesVals.g,
    rotateG: feet.pattern.anglesVals.b,
    scatter: 0,
    blending: 0.1,
    blendingMode: 4,
    greyscale: false,
    disable: false
  }
  const halftonePass = new HalftonePass(sizer.w, sizer.h, params)

  const smaa = new SMAAPass ( window.innerWidth * devicePixelRatio, window.innerHeight * devicePixelRatio );


  const composer = new EffectComposer( renderer );

  //render
  composer.addPass(renderPass);
  //halftones
  composer.addPass(halftonePass)
  //anti alias
  composer.addPass(smaa)

  postprocessing.composer = composer;
  postprocessing.halftonePass = halftonePass;
}

function computeCanvasSize() {
  
  //get the window width and height
  const ww = window.innerWidth;
  const wh = window.innerHeight;

  let smallEdgeSize = ((ww + wh)/2) * 0.02

  //return object to populate
  const ret = {}

  //we want to draw a rectangle with a border, as big as possible
  //does the horizontal dimension drive, or vertical
  if ( ww/wh >= 1 ) {
    //window is wide - let height drive
    ret.h = Math.round(wh);
    ret.w = Math.round(ret.h * 1 );
  } else {
    //window is tall - let width drive
    ret.w = Math.round(ww);
    ret.h = Math.round(ret.w / 1 );
  }

  //smallEdgeSize = ret.w * 0.02
  
  ret.topPadding = wh/2
  ret.nearEdgeOffset = smallEdgeSize

  return ret;
}


// threejs animation stuff
function onWindowResize() {

  //snag size
  let w = computeCanvasSize();

  //update camera, renderer
  camera.aspect = w.w / w.h;
  camera.updateProjectionMatrix();
  renderer.setPixelRatio( window.devicePixelRatio);
  renderer.setSize( w.w, w.h);

  //html updates
  document.body.style.height = window.innerHeight.toString() + 'px'
  outerDiv.style.height = w.h.toString() + 'px'
  outerDiv.style.width = w.w.toString() + 'px'
}

function animate() {

  controls.update(); // only required if controls.enableDamping = true, or if controls.autoRotate = true

  requestAnimationFrame( animate );
  render();

}

function render() {

  postprocessing.composer.render( scene, camera );

  if(previewed == false){
    fxpreview();
    previewed = true;
    download();
  } 

  const seconds = performance.now() / 7777 ;
  if (seconds > 1 && !firstAnimate && !controls.autoRotate) {
    controls.autoRotate = true;
    firstAnimate = true
  }

}

function toggleAutorotate() {
  controls.autoRotate = !controls.autoRotate;
}

function download() {
  var link = document.createElement('a');
  link.download = 'HatchedFungus.png';
  link.href = document.getElementById('hashish').toDataURL()
  link.click();
}
