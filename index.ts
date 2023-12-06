#!/usr/bin/env node

import { Command } from "@commander-js/extra-typings";
import go from "./commands/go";
import py from "./commands/py";
import ts from "./commands/ts";

export const program = new Command();

program
  .name("gen")
  .description("CLI to generate a project template")
  .version("0.1.0")
  .addCommand(py)
  .addCommand(go)
  .addCommand(ts);

const main = async () => {
  await program.parseAsync();
};

main().catch((error) => error.bind(console.error));
