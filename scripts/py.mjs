#!/usr/bin/env zx

import "zx/globals";
import ArgParser from "./args.mjs";
import utils from "./utils.mjs";

process.env.FORCE_COLOR = "1";

const ap = new ArgParser(argv);

const DEV_DEPS = ["ruff", "pydocstyle", "mypy", "pre-commit"];

const PY_BUNDLE = path.join(utils.SRC_DIR, "python");

const main = async () => {
  await spinner("Copying project files", async () => {
    // copy python bundle
    await $`mkdir -p ${ap.projDir}/${ap.projectName}`;
    await $`cp -a ${PY_BUNDLE}/. ${ap.projDir}/`;
    // combine gitignores
    const py = await fs.readFile(path.join(PY_BUNDLE, "py.gitignore"));
    await fs.appendFile(path.join(ap.projDir, ".gitignore"), py);
    await $`rm ${path.join(ap.projDir, "py.gitignore")}`;
    // create source template
    const srcFiles = ["__init__", "__main__"];
    srcFiles.forEach(async (f) => {
      await $`touch ${path.join(ap.projDir, ap.projectName, `${f}.py`)}`;
    });
    const data = `if __name__ == "__main__":
      pass
    `;
    fs.appendFile(path.join(ap.projDir, ap.projectName, "__main__.py"), data);
  });

  await spinner("Setting up pre-commit", async () => {
    cd(ap.projDir);
    await $`pre-commit autoupdate`;
    await $`pre-commit install`;
    await $`pre-commit install --hook-type commit-msg`;
  });

  await spinner("Setting up Poetry", async () => {
    cd(ap.projDir);
    await $`poetry init -n -q`;
    await $`poetry add -nq -G dev ${DEV_DEPS}`;
    await $`poetry install --no-root`;
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
