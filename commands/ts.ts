import { Command } from "@commander-js/extra-typings";

import * as childProcess from "child_process";
import * as path from "path";

const ts = new Command("ts").description("Generate a Typescript project with pnpm");

ts.requiredOption("-n, --name <name>", "Project name")
  .option("-r, --react", "Create a Vite React project")
  .option("-p, --private", "Initialize a private GH repo")
  .option("-e, --emoji", "Use emoji commits")
  .option("-l, --local", "Do not create remote repo")
  .action((options) => {
    const args = [
      options.name,
      options.local,
      options.private,
      options.emoji,
      options.react,
    ];
    const base = childProcess.fork(
      path.join(__dirname, "..", "scripts", "base.mjs"),
      args as any
    );
    base.on("exit", (code) => {
      if (code === 0) {
        childProcess.fork(path.join(__dirname, "..", "scripts", "ts.mjs"), args as any);
      }
    });
  });

export default ts;
