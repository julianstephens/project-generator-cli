import { Command } from "@commander-js/extra-typings";
import * as os from "os";
import * as path from "path";

import * as childProcess from "child_process";

const go = new Command("go").description(
  "Generate a Golang project with OpenAPI support",
);

go.requiredOption("-n, --name <name>", "Project name")
  .option("-p, --private", "Initialize a private GH repo")
  .option("-e, --emoji", "Use emoji commits")
  .option("-l, --local", "Do not create remote repo")
  .action((options) => {
    const args = [
      options.name,
      options.local,
      options.private,
      options.emoji,
      path.join(os.homedir(), "go", "src", "github.com", "julianstephens"),
    ];
    const base = childProcess.fork(
      path.join(__dirname, "..", "scripts", "base.mjs"),
      args as any,
    );
    base.on("exit", (code) => {
      if (code === 0) {
        childProcess.fork(path.join(__dirname, "..", "scripts", "go.mjs"), [
          options.name,
          `${options.local}`,
          "",
          "",
          path.join(os.homedir(), "go", "src", "github.com", "julianstephens"),
        ]);
      }
    });
  });

export default go;
