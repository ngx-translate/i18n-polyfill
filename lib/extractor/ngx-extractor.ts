#!/usr/bin/env node

import {getAst, getFileContent} from "./src/extractor";
import * as glob from "glob";
import * as yargs from "yargs";
import {existsSync, writeFileSync} from "fs";

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
          throw new Error(`The path you supplied was not found or did not contain any matching file: '${path}'`);
        }
      });
      return true;
    })
    .option("out-file", {
      alias: "o",
      describe:
        "Path and name of the file where you would like to save extracted strings. If the file exists then the messages will be merged",
      type: "string",
      normalize: true,
      required: true
    })
    .option("format", {
      alias: "f",
      describe: "Output format",
      default: "xlf",
      type: "string",
      choices: ["xlf", "xlf2", "xmb"]
    })
    .option("locale", {
      alias: "l",
      describe: "Source language of the application",
      default: "en",
      type: "string",
    })
    .exitProcess(true)
    .parse(args);

  const messages = getAst(cli.input);
  const content = getFileContent(messages, cli.outFile, cli.format, cli.locale);
  if (!existsSync(cli.outFile)) {
    console.log(`File "${cli.outFile}" doesn't exist, it will be created`);
  }
  writeFileSync(cli.outFile, content, {encoding: "utf8"});
  return 0;
}

// CLI entry point
if (require.main === module) {
  const args = process.argv.slice(2);
  process.exitCode = main(args);
}
