#!/usr/bin/env zx

import "zx/globals";
import ArgParser from "./args.mjs";
import utils from "./utils.mjs";

process.env.FORCE_COLOR = "1";

const ap = new ArgParser(argv);

const createLocal = async () => {
  cd(ap.workspaceDir);
  await $`mkdir ${ap.projDir}`;
  cd(ap.projDir);
  await $`git init`;
};

const main = async () => {
  echo(
    `Creating ${ap.getArg("LOCAL_REPO") ? "local" : ""} project: ${chalk.cyan(
      ap.projectName,
    )}`,
  );

  await spinner("Scaffolding project template", async () => {
    let exists = fs.existsSync(ap.projDir);
    if (exists) {
      echo(chalk.red("Error: "), "Project already exists");
      throw Error();
    }

    exists = fs.existsSync(ap.workspaceDir);
    if (!exists) await $`mkdir ${ap.workspaceDir}`;

    const flags = [
      "--clone",
      "--add-readme",
      ...(ap.getArg("IS_PRIVATE") ? ["--private"] : ["--public"]),
    ];

    // vite cli removes all project files so must be created first
    if (ap.getArg("REACT_MODE")) {
      cd(ap.workspaceDir);
      await $`pnpm create vite ${ap.projectName} --template react-swc-ts`;
      cd(ap.projectName);
      await $`git init`;
      if (!ap.getArg("LOCAL_REPO"))
        await $`gh repo create --source=. ${flags.slice(1)}`;
    } else {
      if (ap.getArg("LOCAL_REPO")) {
        await createLocal();
      } else {
        try {
          cd(ap.workspaceDir);
          await $`gh repo create ${ap.projectName} ${flags}`;
        } catch {
          echo("Could not create remote with GH CLI. Creating local repo");
          await createLocal();
        }
      }
    }

    // copy bundle
    await $`cp ${utils.COMMON_BUNDLE}/gen.gitignore ${ap.projDir}/.gitignore`;
    await $`cp ${utils.COMMON_BUNDLE}/README.md ${ap.projDir}/`;
    await utils.searchReplaceFile(
      /PROJECT_NAME/g,
      ap.projectName,
      path.join(ap.projDir, "README.md"),
    );

    // add commitlint config
    const config = path.join(
      utils.COMMON_BUNDLE,
      `${ap.getArg("USE_EMOJI") ? "emoji." : ""}commitlint.config.js`,
    );
    await $`cp ${config} ${ap.projDir}/commitlint.config.cjs`;
  });
};

await main();
