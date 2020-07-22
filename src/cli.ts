import minimist from "minimist";
import chalk from "chalk";
import fs from "fs";

function helpAndExit() {
  const r = chalk.red;
  const y = chalk.yellow;
  const g = chalk.greenBright;
  const cy = chalk.cyan;

  console.log(
    r.bold("usage:  ") +
      "npack " +
      g("<path to image folder> " + y("[optional params]"))
  );
  console.log("availiable parameters:");
  console.log(y("\t{-h --help}") + ":\n\t\topen this dialogue.");
  console.log(
    y("\t{-o --output} ") +
      cy("<path to directory>") +
      ":\n\t\tset folder to output to, must be an existing directory.\n\t\tdefault: current working directory."
  );
  console.log(
    y("\t{-f --filename} ") +
      cy("<name>") +
      ':\n\t\tset filename of outputs (filename.png, filename.json). do not include the file extension here.\n\t\tdefault: "result"'
  );
  console.log(
    y("\t{-b --border} ") +
      cy("<integer value>") +
      ":\n\t\tset space between each sprite.\n\t\tdefault: 0"
  );
  console.log(
    y("\t{-n --notrim}") +
      ":\n\t\tif used, transparent padding will not be trimmed. can be useful if the script is too slow."
  );
  process.exit();
}

export interface Arguments {
  path: string;
  output: string;
  filename: string;
  border: number;
  notrim: boolean;
}

export default function processArgs(argsRaw: string[]): Promise<Arguments> {
  return new Promise((resolve, reject) => {
    const args = minimist(argsRaw, {
      boolean: ["notrim"],
      string: ["output", "filename"],
      alias: {
        h: "help",
        o: "output",
        f: "filename",
        b: "border",
        n: "notrim",
      },
      stopEarly: false,
      default: {
        o: process.cwd(),
        f: "result",
        b: 0,
        n: false,
      },
    });

    if (args.help || args._.length != 1) {
      helpAndExit();
    }

    let path = args._[0];

    let isDir = (dir: string) =>
      fs.existsSync(dir) && fs.lstatSync(dir).isDirectory();

    if (!isDir(path)) {
      reject("Invalid path to images folder!");
      return;
    }

    if (!isDir(args.output)) {
      reject("Invalid output path! This must be an existing directory!");
      return;
    }

    if (
      path.charAt(path.length - 1) == "\\" ||
      path.charAt(path.length - 1) == "/"
    ) {
      // this is just done for the sake of pretty output
      path = path.substring(0, path.length - 1);
    }

    resolve({
      path: path,
      output: args.output,
      filename: args.filename,
      border: args.border,
      notrim: args.notrim,
    });
  });
}
