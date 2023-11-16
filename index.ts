#!/usr/bin/env node

import { Command } from "@commander-js/extra-typings";
import { py } from "./commands/py.js";

export const program = new Command();

program
  .name("gen")
  .description("CLI to generate a project template")
  .version("0.1.0")
  .addCommand(py);

const main = async () => {
  await program.parseAsync();
};

main();
