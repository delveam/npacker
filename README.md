# nPacker
A sprite packer made with Node.js, written in TypeScript. This program takes in a folder of .png files, packs them into a single .png file, and spits out a JSON file containing information where every .png file was placed. It also trims alpha padding off of each image in order to save space. This utility can especially be useful for game development.

## Installation
The installation process should be the same on every platform. First, make sure you have Node.js as well as npm installed. Then, to install the script globally (so it can be used from anywhere on your system), run:
```
git clone https://github.com/austin0209/npacker
cd npacker
npm run build
npm install -g
```
That's it! If everything ran successfully, you can simply run ```npack``` from anywhere in your system!

## Output
nPacker will output two files: a .png file and a JSON file. By default the names of these files are "result.png" and "result.json" respectively. These files are saved the the current working directory by default. The file name as well as the output path can be configured by optional parameters, as specified below

## Usage
```
usage:  npacker <path to image folder> [optional params]
availiable parameters:
        {-h --help}:
                open this dialogue.
        {-o --output} <path to directory>:
                set folder to output to, must be an existing directory.
                default: current working directory.
        {-f --filename}<name>:
                set filename of outputs (filename.png, filename.json). do not include the file extension here.
                default: "result"
        {-b --border} <name>:
                set space between each sprite.
                default: 0
        {-n --notrim}:
                if used, transparent padding will not be trimmed. can be useful if the script is too slow.
```
