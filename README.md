# nPacker
A sprite packer made with Node.js, written in TypeScript.

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
