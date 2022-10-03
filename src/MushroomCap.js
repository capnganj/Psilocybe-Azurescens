import * as THREE from 'three';
import { mergeBufferGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils';

class MushroomCap {
    constructor (width, height, gillHeightFactor, gillDepthFactor, features) {

        //driving dimensions - should be passed in
        this.capWidth = width;
        this.capHeight = height;
        this.gillsFactor = gillDepthFactor;

        this.feet = features;

        //computed dimensions - we need these to draw curves
        this.gillsHeight = this.capHeight * gillHeightFactor;
        this.lipWidth = this.capWidth * 0.3;
        this.stemTopWidth = this.capWidth * 0.65;
        this.stemBaseWidth = this.capWidth * 0.55;

        //curve objects
        this.capCurve = {};
        this.gillsCurve = {};
        this.stemCurve = {};

        //lathe geometry!
        this.fungualBufferGeometry = {};
        this.stemBufferGeometry = {};

        //call curve draw functions then build up the buffer
        this.drawCrvs();
        this.draw3dFungus();
    }

    drawCrvs() {
        //start from lip, move up to tippy top -- cap
        this.capCurve = new THREE.CubicBezierCurve(
            new THREE.Vector2(this.capWidth  - this.lipWidth, 0),
            new THREE.Vector2(this.capWidth, 0),
            new THREE.Vector2(this.capWidth*0.666, this.capHeight),
            new THREE.Vector2(0.001, this.capHeight),
        )

        //lip to step -- gils
        this.gillsCurve = new THREE.QuadraticBezierCurve(
            new THREE.Vector2(0.001, -this.gillsHeight * this.gillsFactor),
            new THREE.Vector2(this.capWidth - this.lipWidth, -this.gillsHeight),
            new THREE.Vector2(this.capWidth - this.lipWidth, 0),
        )

        //stem
        this.inset = this.feet.map(fxrand(), 0, 1, -4.2, 4.2);
        this.stemCrv = new THREE.CubicBezierCurve3(
            new THREE.Vector3(0, 0, 0),
            new THREE.Vector3(0, -10.0, 0),
            new THREE.Vector3(this.inset, -20, this.inset),
            new THREE.Vector3(this.inset, -30, this.inset)
        );
    }

    draw3dFungus() {
        //lathe geometry needs an array of points - we get these from the curves
        let capPts = this.capCurve.getPoints(50);
        let gillsPts = this.gillsCurve.getPoints(50);
        let allPts = capPts.concat(gillsPts);

        //lathers and tubers
        this.fungualBufferGeometry = new THREE.LatheBufferGeometry(allPts, 100);

        this.stemBufferGeometry = new THREE.TubeBufferGeometry(this.stemCrv, 100, this.capWidth * 0.23, 50, false);

        //this works!  Clean up so only one geometry needs to be managed 
        const mergedGeometry = mergeBufferGeometries([this.fungualBufferGeometry, this.stemBufferGeometry], false)
        this.mergedBufferGeometry = mergedGeometry;
    }
}

export { MushroomCap };