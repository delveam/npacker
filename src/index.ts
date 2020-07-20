import Canvas from "./canvas.js";
import IData from "./image.js";
import processArgs from "./cli.js";
import { readAllImages } from "./image.js";

processArgs(process.argv.splice(2))
  .then((args) => {
    return readAllImages(args);
  })
  .then(async ({images, args}) => {
    images.sort(
      (a: IData, b: IData) => b.img.getHeight() - a.img.getHeight()
    );

    let canvasSize = 1;
    let success = false;
    while (!success) {
      success = true;
      let canvas = new Canvas(canvasSize, canvasSize, args.border);
      for (let i = 0; i < images.length; i++) {
        let img = images[i];
        if (!canvas.push(img)) {
          success = false;
          canvasSize *= 2;
          break;
        }
      }
      if (success) {
        try {
          const image = await canvas.getPng()
          image.write(args.output + "/" + args.filename + ".png");
          console.log("Wrote PNG to: " + args.output + " as " + args.filename + ".png");
        } catch (e) {
          console.log("ERROR: Could not write png/json file!");
          console.log(e);
        }
      }
    }
  })
  .catch((err) => {
    console.log(err);
  });
