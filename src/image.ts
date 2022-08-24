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
	border: number,
	verbose: boolean
): Promise<IData> {
	let path = pathInfo.path;
	try {
		const image = await Jimp.read(path);
		if (verbose) console.log("Found image: " + path);
		let result = { name: pathInfo.name, img: image, trimW: 0, trimH: 0 };
		if (trim) {
			return trimmed(result, border);
		}
		return result;
	} catch {
		if (verbose) console.log("Ignoring non-image file: " + path);
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
	const verbose = args.verbose;

	getAllImagePaths(dir, pathInfos);
	const promises = [] as Promise<IData>[];
	pathInfos.forEach((pi) => {
		promises.push(processImage(pi, trim, border, verbose));
	});
	const processedImages = await Promise.all(promises);
	return { images: processedImages.filter((i) => i != null), args: args };
}

async function trimmed(_data: IData, border = 0) {
	const data = _data;
	let image = data.img.clone();
	const numJumps = 4.0;

	const getLeft = () => {
		// scan for left edge
		const numIncrement = Math.ceil(image.getHeight() / numJumps);
		for (let x = 0; x < image.getWidth(); x++) {
			for (let i = 0; i < numIncrement; i++) {
				let y = i;
				while (y < image.getHeight()) {
					let alpha = Jimp.intToRGBA(image.getPixelColor(x, y)).a;
					if (alpha != 0) {
						return x;
					}
					y += numIncrement;
				}
			}
		}
		return 0;
	};
	const getRight = () => {
		// scan for right edge
		const numIncrement = Math.ceil(image.getHeight() / numJumps);
		for (let x = image.getWidth() - 1; x >= 0; x--) {
			for (let i = 0; i < numIncrement; i++) {
				let y = i;
				while (y < image.getHeight()) {
					let alpha = Jimp.intToRGBA(image.getPixelColor(x, y)).a;
					if (alpha != 0) {
						return x;
					}
					y += numIncrement;
				}
			}
		}
		return image.getWidth();
	};
	const getTop = () => {
		// scan for top edge
		const numIncrement = Math.ceil(image.getWidth() / numJumps);
		for (let y = 0; y < image.getHeight(); y++) {
			for (let i = 0; i < numIncrement; i++) {
				let x = i;
				while (x < image.getWidth()) {
					let alpha = Jimp.intToRGBA(image.getPixelColor(x, y)).a;
					if (alpha != 0) {
						return y;
					}
					x += numIncrement;
				}
			}
		}
		return 0;
	};
	const getBot = () => {
		// scan for bot edge
		const numIncrement = Math.ceil(image.getWidth() / numJumps);
		for (let y = image.getHeight() - 1; y >= 0; y--) {
			for (let i = 0; i < numIncrement; i++) {
				let x = i;
				while (x < image.getWidth()) {
					let alpha = Jimp.intToRGBA(image.getPixelColor(x, y)).a;
					if (alpha != 0) {
						return y;
					}
					x += numIncrement;
				}
			}
		}
		return image.getHeight();
	};

	let left = getLeft();
	let right = getRight();
	let bot = getBot();
	let top = getTop();

	let newWidth = right - left;
	let newHeight = bot - top;
	try {
		image.crop(left, top, newWidth + 1, newHeight + 1);
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
