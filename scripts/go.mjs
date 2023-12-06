#!/usr/bin/env zx

import "zx/globals";
import ArgParser from "./args.mjs";
import utils from "./utils.mjs";

process.env.FORCE_COLOR = "1";

const ap = new ArgParser(argv);

const DEV_DEPS = ["github.com/swaggo/swag"];

const GO_BUNDLE = path.join(utils.SRC_DIR, "golang");

const main = async () => {
  await spinner("Copying project files", async () => {
    // copy golang bundle
    await $`mkdir -p ${ap.projDir}/${ap.projectName}`;
    await $`cp -a ${GO_BUNDLE}/. ${ap.projDir}/`;
    // combine gitignores
    const go = await fs.readFile(path.join(GO_BUNDLE, "go.gitignore"));
    await fs.appendFile(path.join(ap.projDir, ".gitignore"), go);
    await $`rm ${path.join(ap.projDir, "go.gitignore")}`;
  });

  await spinner("Installing dependencies", async () => {
    cd(ap.projDir);
    await $`go mod init`;
    DEV_DEPS.forEach(async (dep) => {
      await $`go get ${dep}@latest`;
    });
  });

  await spinner("Setting up pre-commit", async () => {
    cd(ap.projDir);
    await $`pre-commit autoupdate`;
    await $`pre-commit install`;
    await $`pre-commit install --hook-type commit-msg`;
  });

  await spinner("Committing changes", async () => {
    cd(ap.projDir);
    await $`git add .`.quiet();
    await $`git commit -m 'chore: add project files' --no-verify`.quiet();
    if (!ap.getArg("LOCAL_REPO")) await $`git push -u origin main`.quiet();
  });

  echo(chalk.black.bold.bgWhite("Complete!"));
};

await main();
