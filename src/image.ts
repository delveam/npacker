import Jimp from "jimp";

export default interface IData {
  name: string;
  img: Jimp;
  trimW: number;
  trimH: number;
}

export function trimmed(data: IData, border = 0) {
  let image = data.img.clone();

  // scan for left edge
  for (let x = 0; x < image.getWidth(); x++) {
    for (let y = 0; y < image.getHeight(); y++) {
      let alpha = Jimp.intToRGBA(image.getPixelColor(x, y)).a;
      if (alpha != 0) {
        var left = x;
      }
    }
  }
  // scan for right edge
  for (let x = image.getWidth() - 1; x >= 0; x--) {
    for (let y = 0; y < image.getHeight(); y++) {
      let alpha = Jimp.intToRGBA(image.getPixelColor(x, y)).a;
      if (alpha != 0) {
        var right = x;
      }
    }
  }
  // scan for top edge
  for (let y = 0; y < image.getHeight(); y++) {
    for (let x = 0; x < image.getWidth(); x++) {
      let alpha = Jimp.intToRGBA(image.getPixelColor(x, y)).a;
      if (alpha != 0) {
        var top = y;
      }
    }
  }
  // scan for bot edge
  for (let y = image.getHeight(); y >= 0; y--) {
    for (let x = 0; x < image.getWidth(); x++) {
      let alpha = Jimp.intToRGBA(image.getPixelColor(x, y)).a;
      if (alpha != 0) {
        var bot = y;
      }
    }
  }

  let newWidth = image.getWidth() - (image.getWidth() - right);
  let newHeight = image.getHeight() - (image.getHeight() - bot);
  image.crop(left, top, newWidth, newHeight);
  if (border != 0) {
    image = new Jimp(image.getWidth() + border, image.getHeight() + border)
      .mask(image, 0, 0);
  }
  return { name: data.name, img: image, trimW: left, trimH: top };
}