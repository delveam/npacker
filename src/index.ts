import Jimp from "jimp";
import fs from "fs";
import path from "path";
import yargs from "yargs";

const argv = yargs(process.argv.slice(2))
	.scriptName("npacker")
	.usage("$0 <path> [options]")
	.positional("path", {
		type: "string",
		description:
			"The path to the directory that contains the images that should be packed",
	})
	.demandCommand(1)
	.option("output", {
		alias: "o",
		type: "string",
		default: "atlas.png",
		description: "The path of the output file",
	})
	.option("border", {
		alias: "b",
		type: "number",
		default: 0,
		description:
			"The amount of pixels that are in-between sprites and the edge of the atlas",
	})
	.strict()
	.help()
	.parseSync();

type Args = {
	directory: string;
	border: number;
	output: string;
};

const args: Args = {
	directory: argv._[0] as string,
	border: isNaN(argv.border) ? 0 : argv.border,
	output: argv.output,
};

class Sprite {
	name: string;
	image: Jimp;
	untrimmedWidth: number;
	untrimmedHeight: number;
	trimmedLeft: number;
	trimmedTop: number;
	trimmedWidth: number;
	trimmedHeight: number;

	constructor(name: string, image: Jimp) {
		this.name = name;
		this.image = image;
		this.untrimmedWidth = image.getWidth();
		this.untrimmedHeight = image.getHeight();
		this.trimmedLeft = 0;
		this.trimmedTop = 0;
		this.trimmedWidth = this.untrimmedWidth;
		this.trimmedHeight = this.untrimmedHeight;
	}

	public trim(): void {
		const left = (() => {
			for (let x = 0; x < this.untrimmedWidth; ++x) {
				for (let y = 0; y < this.untrimmedHeight; ++y) {
					const alpha = Jimp.intToRGBA(this.image.getPixelColor(x, y)).a;

					if (alpha !== 0) {
						return x;
					}
				}
			}

			return this.untrimmedWidth;
		})();
		const right = (() => {
			for (let x = this.untrimmedWidth - 1; x >= 0; --x) {
				for (let y = 0; y < this.untrimmedHeight; ++y) {
					const alpha = Jimp.intToRGBA(this.image.getPixelColor(x, y)).a;

					if (alpha !== 0) {
						return x;
					}
				}
			}

			return 0;
		})();
		const top = (() => {
			for (let y = 0; y < this.untrimmedHeight; ++y) {
				for (let x = 0; x < this.untrimmedWidth; ++x) {
					const alpha = Jimp.intToRGBA(this.image.getPixelColor(x, y)).a;

					if (alpha !== 0) {
						return y;
					}
				}
			}

			return this.untrimmedHeight;
		})();
		const bottom = (() => {
			for (let y = this.untrimmedHeight - 1; y >= 0; --y) {
				for (let x = 0; x < this.untrimmedWidth; ++x) {
					const alpha = Jimp.intToRGBA(this.image.getPixelColor(x, y)).a;

					if (alpha !== 0) {
						return y;
					}
				}
			}

			return 0;
		})();

		const width = right - left + 1;
		const height = bottom - top + 1;
		if (
			width !== this.untrimmedWidth + 1 ||
			height !== this.untrimmedHeight + 1
		) {
			try {
				this.image.crop(left, top, width, height);

				this.trimmedLeft = left;
				this.trimmedTop = top;
				this.trimmedWidth = this.image.getWidth();
				this.trimmedHeight = this.image.getHeight();
			} catch (e) {
				const error = e as Error;
				console.error(error.message);
				process.exit(1);
			}
		}
	}
}

class Region {
	readonly x: number;
	readonly y: number;
	readonly width: number;
	readonly height: number;

	public get area() {
		return this.width * this.height;
	}

	constructor(x: number, y: number, width: number, height: number) {
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;
	}

	public engulfs(sprite: Sprite): boolean {
		return (
			this.width >= sprite.trimmedWidth && this.height >= sprite.trimmedHeight
		);
	}
}

class CanvasNode {
	readonly x: number;
	readonly y: number;
	readonly sprite: Sprite;

	constructor(x: number, y: number, sprite: Sprite) {
		this.x = x;
		this.y = y;
		this.sprite = sprite;
	}
}

class Canvas {
	#width: number;
	#height: number;
	#border: number;
	#open: Region[];
	#closed: CanvasNode[];

	constructor(width: number, height: number, border: number) {
		this.#width = width;
		this.#height = height;
		this.#border = border;
		this.#open = [new Region(border, border, width - border, height - border)];
		this.#closed = [];
	}

	private clean(): void {
		this.#open.sort((lhs, rhs) => lhs.area - rhs.area);
	}

	private split(region: Region, sprite: Sprite): Region[] {
		const result: Region[] = [];

		const right = new Region(
			region.x + sprite.trimmedWidth + this.#border,
			region.y,
			region.width - sprite.trimmedWidth - this.#border,
			sprite.trimmedHeight
		);
		if (right.area !== 0) {
			result.push(right);
		}

		const bottom = new Region(
			region.x,
			region.y + sprite.trimmedHeight + this.#border,
			region.width,
			region.height - sprite.trimmedHeight - this.#border
		);
		if (bottom.area !== 0) {
			result.push(bottom);
		}

		return result;
	}

	public push(sprite: Sprite): boolean {
		for (let i = 0; i < this.#open.length; ++i) {
			const region = this.#open[i];
			if (!region.engulfs(sprite)) {
				continue;
			}

			const node = new CanvasNode(region.x, region.y, sprite);
			this.#closed.push(node);

			this.#open.splice(i, 1);

			const regions = this.split(region, sprite);
			this.#open.push(...regions);
			this.clean();

			return true;
		}

		return false;
	}

	public generatePng(): Promise<Jimp> {
		return new Promise(
			(resolve, reject) =>
				new Jimp(this.#width, this.#height, (err, image) => {
					if (err) {
						reject(err);
						return;
					}

					for (let i = 0; i < this.#closed.length; ++i) {
						const node = this.#closed[i];
						if (node.sprite === null) {
							continue;
						}

						image.composite(node.sprite.image, node.x, node.y);
					}

					resolve(image);
				})
		);
	}

	public generateJson(): string {
		const sprites = [];
		for (let i = 0; i < this.#closed.length; ++i) {
			const node = this.#closed[i];
			const sprite = node.sprite;
			sprites.push({
				name: sprite.name,
				untrimmed: {
					width: sprite.untrimmedWidth,
					height: sprite.untrimmedHeight,
				},
				source: {
					x: sprite.trimmedLeft,
					y: sprite.trimmedTop,
					width: sprite.trimmedWidth,
					height: sprite.trimmedHeight,
				},
				destination: {
					x: node.x,
					y: node.y,
					width: sprite.trimmedWidth,
					height: sprite.trimmedHeight,
				},
			});
		}

		return JSON.stringify(sprites);
	}
}

async function main() {
	function getPaths(directory: string): string[] {
		try {
			const basenames = fs.readdirSync(directory);

			return basenames.map((it) => path.join(directory, it));
		} catch (e) {
			const error = e as Error;
			console.error(error.message);
			process.exit(1);
		}
	}

	async function getSprites(paths: string[]): Promise<Sprite[]> {
		const promises = paths.map((it) => Jimp.read(it));
		const results = await Promise.allSettled(promises);

		const sprites: Sprite[] = [];
		for (let i = 0; i < results.length; ++i) {
			const result = results[i];

			if (result.status !== "fulfilled") {
				continue;
			}

			// TODO: What do we do with an empty image?

			const sprite = new Sprite(path.parse(paths[i]).name, result.value);
			sprites.push(sprite);
		}

		return sprites;
	}

	function trimSprites(sprites: Sprite[]): void {
		for (let i = 0; i < sprites.length; ++i) {
			const sprite = sprites[i];
			sprite.trim();
		}
	}

	function sortSprites(sprites: Sprite[]): void {
		sprites.sort((lhs, rhs) => {
			let difference = rhs.trimmedHeight - lhs.trimmedHeight;
			if (difference === 0) {
				difference = rhs.trimmedWidth - lhs.trimmedWidth;
				if (difference === 0) {
					difference = lhs.name.localeCompare(rhs.name);
				}
			}

			return difference;
		});
	}

	async function packSprites(sprites: Sprite[]): Promise<[Jimp, string]> {
		let size = (() => {
			let area = 0;
			for (let i = 0; i < sprites.length; ++i) {
				const image = sprites[i];
				const width = image.trimmedWidth + args.border;
				const height = image.trimmedHeight + args.border;
				area += width * height;
			}

			return 2 ** Math.ceil(Math.log2(Math.sqrt(area)));
		})();

		loop: while (true) {
			const canvas = new Canvas(size, size, args.border);
			for (let i = 0; i < sprites.length; ++i) {
				const sprite = sprites[i];

				if (!canvas.push(sprite)) {
					size <<= 1;
					continue loop;
				}
			}

			try {
				const image = await canvas.generatePng();
				const json = canvas.generateJson();

				return [image, json];
			} catch (e) {
				const error = e as Error;
				console.error(error.message);
				process.exit(1);
			}
		}
	}

	const paths = getPaths(args.directory);
	const sprites = await getSprites(paths);
	trimSprites(sprites);
	sortSprites(sprites);
	const [packedImage, json] = await packSprites(sprites);
	packedImage.write(args.output);
	const tmp = path.parse(args.output);
	fs.writeFileSync(path.join(tmp.dir, `${tmp.name}.json`), json);
}

main();
