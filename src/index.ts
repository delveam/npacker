import Canvas from "./canvas.js"
import IData from "./image.js";
import processArgs from "./cli.js";
import { readAllImages } from "./image.js";

let args = processArgs(process.argv)
let images = readAllImages(args._[2], !args.notrim)
images.sort((a: IData, b: IData) => b.img.getHeight() - a.img.getHeight());

let canvasSize = 1;
let success = false;

while (!success) {
    success = true;
    let canvas = new Canvas(canvasSize, canvasSize, args.border)
    for (let i = 0; i < images.length; i++) {
        let img = images[i];
        if (!canvas.push(img)) {
            success = false;
            canvasSize *= 2;
            break;
        }
    };
    if (success) {
        try {
            canvas.getPng().write(args.path);
        } catch (e) {
            console.log("ERROR: Could not write png/json file!");
        }
    }
}