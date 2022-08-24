#!/usr/bin/env node

import fs from "fs";
import Canvas from "./canvas.js";
import IData from "./image.js";
import processArgs from "./cli.js";
import { readAllImages } from "./image.js";

processArgs(process.argv.splice(2))
	.then((args) => {
		return readAllImages(args);
	})
	.then(async ({ images, args }) => {
		images.sort((a: IData, b: IData) => {
			let res = b.img.getHeight() - a.img.getHeight();
			if (res == 0) {
				res = b.img.getWidth() - a.img.getWidth();
				if (res == 0) {
					res = a.name.localeCompare(b.name);
				}
			}
			return res;
		});

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
					const image = await canvas.getPng();
					image.write(args.output + "/" + args.filename + ".png");
					console.log(
						"Wrote PNG to: " + args.output + " as: " + args.filename + ".png"
					);
					const json = canvas.getJson(args.filename);
					fs.writeFileSync(args.output + "/" + args.filename + ".json", json);
					console.log(
						"Wrote JSON to: " + args.output + " as: " + args.filename + ".json"
					);
				} catch (e) {
					console.log("ERROR: Error writing png/json file!");
				}
			}
		}
	})
	.catch((e) => {
		console.error(e);
		process.exit(1);
	});
