import { interpolateYlOrRd, interpolateInferno, interpolateMagma, interpolatePuBuGn, interpolatePlasma, interpolateRdPu, interpolateViridis, interpolateCividis, interpolateYlGnBu, interpolateYlGn, interpolateYlOrBr, interpolateCool, interpolateWarm, interpolateSinebow, interpolateRainbow } from 'd3-scale-chromatic'
import { rgb, hsl, color } from 'd3-color';
import * as THREE from 'three';

class Features {
    constructor() {

        //color palette 
        this.color = {
            name: ""
        };
        this.setColorPalette();


        //background color
        this.background = {
            tag: "",
            value: {}
        }
        this.setBackground();

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
    }

    //map function logic from processing <3
    map(n, start1, stop1, start2, stop2) {
        const newval = (n - start1) / (stop1 - start1) * (stop2 - start2) + start2;
        return newval;
    }

    //color palette interpolation
    interpolateFn(val) {
        if (val > 1.0) {
            val = 1.0
        }
        if (val < 0.0) {
            val = 0.0
        }
        let col;
        switch (this.color.name) {
            case "Ylorrd": 
                col = rgb(interpolateYlOrRd(val));
                break
            case "Rdpu": 
                col = rgb(interpolateRdPu(val));
                break;
            case "Viridis": 
                col = rgb(interpolateViridis(1-val));
                break;
            case "Magma": 
                col = rgb(interpolateMagma(1-val));
                break;
            case "Inferno": 
                col = rgb(interpolateInferno(1-val));
                break;
            case "Plasma": 
                col = rgb(interpolatePlasma(1-val));
                break;
            case "Cividis": 
                col = rgb(interpolateCividis(1-val));
                break;
            case "Ylgn":
                col = rgb(interpolateYlGn(val));
                break;
            case "Ylgnbu":
                col = rgb(interpolateYlGnBu(val));
                break;
            case "Pubugn":
                col = rgb(interpolatePuBuGn(val));
                break;
            case "Ylorbr":
                col = rgb(interpolateYlOrBr(val));
                break;
            case "Cool":
                col = rgb(interpolateCool(1-val));
                break;
            case "Warm":
                col = rgb(interpolateWarm(1-val));
                break;
            case "Sinebow":
                col = rgb(interpolateSinebow(val));
                break;
            case "Rainbow":
                col = rgb(interpolateRainbow(val));
                break;
            default:
                col = rgb(interpolateMagma(val));
        }

        if (this.color.inverted) {
            col = this.invertColor(col) 
        }

        return col;
    }

    //color inverter
    invertColor(rgb, bw) {
        let hex = color(rgb).formatHex()
        if (hex.indexOf('#') === 0) {
            hex = hex.slice(1);
        }
        // convert 3-digit hex to 6-digits.
        if (hex.length === 3) {
            hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
        }
        if (hex.length !== 6) {
            throw new Error('Invalid HEX color.');
        }
        var r = parseInt(hex.slice(0, 2), 16),
            g = parseInt(hex.slice(2, 4), 16),
            b = parseInt(hex.slice(4, 6), 16);
        if (bw) {
            // https://stackoverflow.com/a/3943023/112731
            return (r * 0.299 + g * 0.587 + b * 0.114) > 186
                ? '#000000'
                : '#FFFFFF';
        }
        // invert color components
        r = (255 - r).toString(16);
        g = (255 - g).toString(16);
        b = (255 - b).toString(16);
        // pad each with zeros and return
        let inverted = color("#" + padZero(r) + padZero(g) + padZero(b)).rgb();
        return inverted;

        function padZero(str, len) {
            len = len || 2;
            var zeros = new Array(len).join('0');
            return (zeros + str).slice(-len);
        }
    }

    //desaturate by some %
    desaturateColor(col, percent) {
        let h = hsl(col);
        h.s = h.s * percent
        return h.rgb();
    }

    //lighten by some %
    lightenColor(col, percent) {
        let h = hsl(col);
        h.l  = h.l * percent;
        return h.rgb();
    }

    //set color palette globally
    setColorPalette() {
        let c = fxrand();
        if (c < 0.09) { 
            this.color.name = "Rainbow"
        }
        else if (c < 0.17) { 
            this.color.name = "Rdpu"
        }
        else if (c < 0.25) {  
            this.color.name = "Sinebow"
        }
        else if (c < 0.32) { 
            this.color.name = "Ylgnbu"
        }
        else if (c < 0.41) { 
            this.color.name = "Viridis" 
        }
        else if (c < 0.55) {  
            this.color.name = "Inferno" 
        }
        else if (c < 0.66) {  
            this.color.name = "Plasma" 
        }
        else if (c < 0.78) {  
            this.color.name = "Cool" 
        }
        else if (c < 0.92) {  
            this.color.name = "Warm" 
        }
        else {  
            this.color.name = "Magma"  
        }

        //inverted?
        if( fxrand() > 0.666 ) {
            this.color.inverted = true;
        }
    }

    setBackground() {
        let b = fxrand();
        if (b < 0.00) {
            this.background.tag = "Rolling Paper";
            this.background.value = rgb(235, 213, 179);
        }
        else if (b < 1.00) {
            this.background.tag = "fxhash Dark";
            this.background.value = rgb(38, 38, 38);
        }
        else if (b < 0.00) {
            this.background.tag = "Newspaper";
            this.background.value = rgb(245, 242, 232);
        }
        else if (b < 0.00) {
            this.background.tag = "Brown Paper Bag";
            this.background.value = rgb(181, 155, 124);
        }
        else if (b < 0.00) {
            this.background.tag = "Palette Light";
            let col = this.color.inverted ? 
            this.interpolateFn(this.map(fxrand(), 0, 1, 0.66, 0.9)) : 
            this.interpolateFn(this.map(fxrand(), 0, 1, 0.1, 0.33));
            this.background.value = col;
        }
        else {
            this.background.tag = "Palette Dark";
            let col = this.color.inverted ? 
            this.interpolateFn(this.map(fxrand(), 0, 1, 0.2, 0.43)) : 
            this.interpolateFn(this.map(fxrand(), 0, 1, 0.56, 0.8));
            this.background.value = col;
        }
    }

    setPattern() {

        //size
        const s = fxrand();
        if (s < 0.08) {
            this.pattern.sizeTag = "Smaller"
            this.pattern.sizeVal = this.map(fxrand(), 0, 1, 13, 16)
        }
        else if (s < 0.63) {
            this.pattern.sizeTag = "Standard"
            this.pattern.sizeVal = this.map(fxrand(), 0, 1, 17, 20)
        } 
        else {
            this.pattern.sizeTag = "Larger"
            this.pattern.sizeVal = this.map(fxrand(), 0, 1, 23, 30)
        }

        //angles
        const a = fxrand();
        if (a < 0.1) {
            this.pattern.anglesTag = "Grid"
            this.pattern.anglesVals.r = Math.round(fxrand()) ? 0 : Math.PI/2
            this.pattern.anglesVals.g = Math.round(fxrand()) ? 0 : Math.PI/2
            this.pattern.anglesVals.b = Math.round(fxrand()) ? 0 : Math.PI/2
        } 
        else if (a < 0.3) {
            this.pattern.anglesTag = "Mirror"
            const angle = this.map(fxrand(), 0, 1, Math.PI/8, Math.PI/4)
            this.pattern.anglesVals.r = Math.round(fxrand()) ? 0 : Math.PI/2
            this.pattern.anglesVals.g = angle
            this.pattern.anglesVals.b = -angle
        }
        else {
            this.pattern.anglesTag = "Random"
            this.pattern.anglesVals.r = this.map(fxrand(), 0, 1, -Math.PI/2, Math.PI/2)
            this.pattern.anglesVals.g = this.map(fxrand(), 0, 1, -Math.PI/4, Math.PI/4)
            this.pattern.anglesVals.b = this.map(fxrand(), 0, 1, -Math.PI/8, Math.PI/8)
        }
    }

    setLightsAndCamera() {
        const l = fxrand();
        if (l < 0.27) {
            this.lightsAndCamera.lightsTag = "Left"
            this.lightsAndCamera.lightsVal = this.map(fxrand(), 0, 1, -13, -15)
        } 
        else if (l < 0.59) {
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

}

export { Features }