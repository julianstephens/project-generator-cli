import { Command } from "@commander-js/extra-typings";

import * as childProcess from "child_process";
import * as path from "path";

export const py = new Command("py").description(
  "Generate a Python project with Poetry",
);

py.requiredOption("-n, --name <name>", "Project name")
  .option("-p, --private", "Initialize a private GH repo")
  .option("-e, --emoji", "Use emoji commits")
  .option("-l, --local", "Do not create remote repo")
  .action((options) => {
    const args = [options.name, options.private, options.emoji, options.local];
    childProcess.fork(path.join(__dirname, "create.mjs"), args as any);
  });
