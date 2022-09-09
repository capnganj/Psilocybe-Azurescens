import { rgb } from 'd3-color';

class Features {
    constructor() {

        this.background = rgb(38, 38, 38);

        this.pattern = {
            scatterTag: "",
            scatterVal: 0,
            sizeTag: "",
            sizeVal: 10,
            anglesTag: "",
            anglesVals: {}
        }
        this.setPattern();

        this.lightsAndCamera = {
            lightsTag: "",
            lightsVal: 0,
            cameraTag: "",
            cameraVal: {}
        }
        this.setLightsAndCamera();

        this.numShrooms = 0
        this.setNumShrooms();
    }

    //map function logic from processing <3
    map(n, start1, stop1, start2, stop2) {
        const newval = (n - start1) / (stop1 - start1) * (stop2 - start2) + start2;
        return newval;
    }

    setPattern() {

        //size
        const s = fxrand();
        if (s < 0.08) {
            this.pattern.sizeTag = "Smaller"
            this.pattern.sizeVal = this.map(fxrand(), 0, 1, 11, 13)
        }
        else if (s < 0.63) {
            this.pattern.sizeTag = "Standard"
            this.pattern.sizeVal = this.map(fxrand(), 0, 1, 15, 18)
        } 
        else {
            this.pattern.sizeTag = "Larger"
            this.pattern.sizeVal = this.map(fxrand(), 0, 1, 20, 27)
        }

        //angles
        const a = fxrand();
        if (a < 0.08) {
            this.pattern.anglesTag = "Grid"
            this.pattern.anglesVals.r = Math.round(fxrand()) ? 0 : Math.PI/2
            this.pattern.anglesVals.g = Math.round(fxrand()) ? 0 : Math.PI/2
            this.pattern.anglesVals.b = Math.round(fxrand()) ? 0 : Math.PI/2
        } 
        else if (a < 0.11) {
            this.pattern.anglesTag = "Mirror"
            const angle = this.map(fxrand(), 0, 1, Math.PI/8, Math.PI/4)
            this.pattern.anglesVals.r = Math.round(fxrand()) ? 0 : Math.PI/2
            this.pattern.anglesVals.g = angle
            this.pattern.anglesVals.b = -angle
        }
        else {
            this.pattern.anglesTag = "Random"
            this.pattern.anglesVals.r = this.map(fxrand(), 0, 1, -Math.PI/2, Math.PI/2)
            this.pattern.anglesVals.g = this.map(fxrand(), 0, 1, -Math.PI/2, Math.PI/2)
            this.pattern.anglesVals.b = this.map(fxrand(), 0, 1, -Math.PI/2, Math.PI/2)
        }
    }

    setLightsAndCamera() {
        const l = fxrand();
        if (l < 0.44) {
            this.lightsAndCamera.lightsTag = "Left"
            this.lightsAndCamera.lightsVal = this.map(fxrand(), 0, 1, -13, -15)
        } 
        else if (l <= 1.0) {
            this.lightsAndCamera.lightsTag = "Right"
            this.lightsAndCamera.lightsVal = this.map(fxrand(), 0, 1, 13, 15)
        }
        else {
            this.lightsAndCamera.lightsTag = "Top"
            this.lightsAndCamera.lightsVal = this.map(fxrand(), 0, 1, -1, 1)
        }

        const c = fxrand()
        if (c < 0.07) {
            this.lightsAndCamera.cameraTag = "Front"
            this.lightsAndCamera.cameraVal = { x: 0, y: 0 }
        } 
        else if (c < 0.19) {
            this.lightsAndCamera.cameraTag = "Left"
            this.lightsAndCamera.cameraVal = { x: -10, y: 0 }
        }
        else if (c < 0.33) {
            this.lightsAndCamera.cameraTag = "Right"
            this.lightsAndCamera.cameraVal = { x: 10, y: 0 }
        }
        else if (c < 0.82) {
            this.lightsAndCamera.cameraTag = "Bottom"
            this.lightsAndCamera.cameraVal = { x: 0, y: -5 }
        }
        else if (c < 0.93) {
            this.lightsAndCamera.cameraTag = "Bottom Left"
            this.lightsAndCamera.cameraVal = { x: -10, y: -5 }
        }
        else if (c <= 1.0) {
            this.lightsAndCamera.cameraTag = "Bottom Right"
            this.lightsAndCamera.cameraVal = { x: 10, y: -5 }
        }
    }

    setNumShrooms(){
        const n = fxrand()
        if (n < 0.618) {
            this.numShrooms = 2
        } 
        else if (n < 0.789) {
            this.numShrooms = 3
        }
        else if (n < 0.895) {
            this.numShrooms = 5
        }
        else {
            this.numShrooms = 7
        }

        if (this.numShrooms >= 3 && this.pattern.sizeTag == "Larger") {
            this.pattern.sizeTag = Math.round(fxrand()) ? "Standard" : "Smaller"
        }
    }

}

export { Features }