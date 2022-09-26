# npacker

A CLI sprite packer made with Node.js, written in TypeScript.

This program searches for images in a given directory, trims transparent-padding from each image, and packs each image into a single file. A JSON file containing information on each packed image is also created.

## Building

First, make sure you have git, node, and npm installed. Then run the following commands:

``` bash
git clone https://github.com/delveam/npacker
cd npacker
npm install
npm run build
node build/index.js
```
