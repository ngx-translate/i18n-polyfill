#!/usr/bin/env node

import {getAst} from "./extractor/extractor";
import * as glob from "glob";
import * as yargs from "yargs";

export function main(args) {
  const cli = yargs
    .usage("Extract strings from files for translation.\nUsage: $0 [options]")
    .help("help")
    .alias("help", "h")
    .option("input", {
      alias: "i",
      describe:
        "Paths you would like to extract strings from. You can use path expansion, glob patterns and multiple paths",
      default: process.env.PWD,
      type: "array",
      normalize: true
    })
    .check(options => {
      options.input.forEach((path: string) => {
        const files = glob.sync(path);

        if (!files || files.length === 0) {
          throw new Error(`The path you supplied was not found or empty: '${path}'`);
        }
      });
      return true;
    })
    .option("output", {
      alias: "o",
      describe:
        "Paths where you would like to save extracted strings. You can use path expansion, glob patterns and multiple paths",
      type: "array",
      normalize: true,
      required: true
    })
    .option("format", {
      alias: "f",
      describe: "Output format",
      default: "json",
      type: "string",
      choices: ["json", "namespaced-json", "pot"]
    })
    .exitProcess(true)
    .parse(args);

  getAst(cli.input);
  return 0;
}

// CLI entry point
if (require.main === module) {
  const args = process.argv.slice(2);
  process.exitCode = main(args);
}
