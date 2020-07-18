import minimist from "minimist";
import chalk from "chalk";

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

export function cli(argsRaw) {
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

  if (args._.length != 1) {
    printHelp();
  }
}
