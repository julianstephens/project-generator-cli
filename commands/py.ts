import { Command } from "@commander-js/extra-typings";

import * as childProcess from "child_process";
import * as path from "path";

const py = new Command("py").description(
  "Generate a Python project with Poetry",
);

py.requiredOption("-n, --name <name>", "Project name")
  .option("-p, --private", "Initialize a private GH repo")
  .option("-e, --emoji", "Use emoji commits")
  .option("-l, --local", "Do not create remote repo")
  .action((options) => {
    const args = [options.name, options.local, options.private, options.emoji,];
    const base = childProcess.fork(
      path.join(__dirname, "..", "scripts", "base.mjs"),
      args as any,
    );
    base.on("exit", (code) => {
      if (code === 0) {
        childProcess.fork(path.join(__dirname, "..", "scripts", "py.mjs"), [
          options.name,
          `${options.local}`,
        ]);
      }
    });
  });

export default py;
