import minimist from "minimist";
import chalk from "chalk";
import fs from "fs";
import { exit } from "process";

function printHelp() {
  const r = chalk.red;
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
  process.exit();
}

export default function processArgs(argsRaw) {
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

  console.log(args);

  if (args.help && args._.length < 3) {
    printHelp();
  }

  let isDir = (dir: string) => fs.lstatSync(dir).isDirectory();

  if (!isDir(args._[2])) {
    console.log("Invalid path to images folder!");
    exit();
  }

  if (!isDir(args.output)) {
    console.log("Invalid output path! This must be an existing directory!");
  }

  return args;
}
