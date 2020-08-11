import Jimp from "jimp";
import fs from "fs";
import { Arguments } from "./cli.js";

export default interface IData {
  name: string;
  img: Jimp;
  trimW: number;
  trimH: number;
}

interface PathInfo {
  path: string;
  name: string;
}

interface ImagesAndArguments {
  images: IData[];
  args: Arguments;
}

function getAllImagePaths(dir: string, list: PathInfo[]) {
  const files = fs.readdirSync(dir);
  files.forEach((file) => {
    let path = dir + "/" + file;
    if (process.platform == "win32") {
      path = path.replace("/", "\\");
    }
    let isDir = fs.existsSync(path) && fs.lstatSync(path).isDirectory();
    if (isDir) {
      getAllImagePaths(path, list);
    } else {
      list.push({ path: path, name: file });
    }
  });
}

async function processImage(
  pathInfo: PathInfo,
  trim: boolean,
  border: number
): Promise<IData> {
  let path = pathInfo.path;
  try {
    const image = await Jimp.read(path);
    console.log("Found image: " + path);
    let result = { name: pathInfo.name, img: image, trimW: 0, trimH: 0 };
    if (trim) {
      return trimmed(result, border);
    }
    return result;
  } catch {
    console.log("Ignoring non-image file: " + path);
    return null;
  }
}

export async function readAllImages(
  args: Arguments
): Promise<ImagesAndArguments> {
  const pathInfos = [] as PathInfo[];
  const dir = args.path;
  const trim = !args.notrim;
  const border = args.border;

  getAllImagePaths(dir, pathInfos);
  const promises = [] as Promise<IData>[];
  pathInfos.forEach((pi) => {
    promises.push(processImage(pi, trim, border));
  });
  const processedImages = await Promise.all(promises);
  return { images: processedImages.filter((i) => i != null), args: args };
}

async function trimmed(_data: IData, border = 0) {
  const data = _data;
  let image = data.img.clone();

  const getLeft = () => {
    // scan for left edge
    for (let x = 0; x < image.getWidth(); x++) {
      for (let y = 0; y < image.getHeight(); y++) {
        let alpha = Jimp.intToRGBA(image.getPixelColor(x, y)).a;
        if (alpha != 0) {
          return x;
        }
      }
    }
  };
  const getRight = () => {
    // scan for right edge
    for (let x = image.getWidth(); x >= 0; x--) {
      for (let y = 0; y < image.getHeight(); y++) {
        let alpha = Jimp.intToRGBA(image.getPixelColor(x, y)).a;
        if (alpha != 0) {
          return x;
        }
      }
    }
  };
  const getTop = () => {
    // scan for top edge
    for (let y = 0; y < image.getHeight(); y++) {
      for (let x = 0; x < image.getWidth(); x++) {
        let alpha = Jimp.intToRGBA(image.getPixelColor(x, y)).a;
        if (alpha != 0) {
          return y;
        }
      }
    }
  };
  const getBot = () => {
    // scan for bot edge
    for (let y = image.getHeight(); y >= 0; y--) {
      for (let x = 0; x < image.getWidth(); x++) {
        let alpha = Jimp.intToRGBA(image.getPixelColor(x, y)).a;
        if (alpha != 0) {
          return y;
        }
      }
    }
  };

  let left = getLeft();
  let right = getRight();
  let bot = getBot();
  let top = getTop();

  let newWidth = right - left;
  let newHeight = bot - top;
  try {
    image.crop(left, top, newWidth, newHeight);
  } catch {
    console.log(data.name);
  }
  if (border != 0) {
    image = new Jimp(
      image.getWidth() + border,
      image.getHeight() + border
    ).blit(image, 0, 0);
  }
  return { name: data.name, img: image, trimW: left, trimH: top };
}
