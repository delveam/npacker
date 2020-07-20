import minimist from "minimist";
import chalk from "chalk";
import fs from "fs";
import { exit } from "process";

function printHelp() {
  /*const r = chalk.red;
  const y = chalk.yellow;
  const g = chalk.greenBright;
  const cy = chalk.cyan;

  console.log(
    r.bold("usage:  ") +
    "npacker " +
    g("<path to image folder> " + y("[optional params]"))
  );
  console.log("availiable parameters:");
  console.log(
    y("\t{-o --output} ") +
    cy("<path to directory>") +
    ":\n\t\tset folder to output to, must be an existing directory.\n\t\tdefault: current working directory."
  );
  process.exit();*/
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
        nt: "notrim",
      },
      stopEarly: false,
      default: {
        o: "./",
        f: "result",
        b: 0,
        notrim: false,
      },
    });

    if (args.help || args._.length != 1) {
      reject("HELP MESSAGE HERE");
      return;
    }

    let isDir = (dir: string) =>
      fs.existsSync(dir) && fs.lstatSync(dir).isDirectory();

    if (!isDir(args._[0])) {
      reject("Invalid path to images foler!");
      return;
    }

    if (!isDir(args.output)) {
      reject("Invalid output path! This must be an existing directory!");
      return;
    }

    resolve({
      path: args._[0],
      output: args.output,
      filename: args.filename,
      border: args.border,
      notrim: args.notrim,
    });
  });
}
