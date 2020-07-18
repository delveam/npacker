require = require("esm")(module);
const cli = require("./cli.js").cli;

cli(process.argv.splice(2));
