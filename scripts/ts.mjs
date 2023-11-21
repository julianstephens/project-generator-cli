#!/usr/bin/env zx

import "zx/globals";
import ArgParser from "./args.mjs";
import utils from "./utils.mjs";

process.env.FORCE_COLOR = "1";

const ap = new ArgParser(argv);

const DEV_DEPS = [
  "eslint",
  "eslint-config-alloy",
  "prettier",
  "typescript",
  "@tsconfig/node18",
  "@typescript-eslint/eslint-plugin",
  "@typescript-eslint/parser",
  "@types/node",
  "@types/eslint",
  "@types/prettier",
  ...(ap.getArg("REACT_MODE ")
    ? ["eslint-plugin-react", "tailwindcss", "postcss", "autoprefixer"]
    : []),
];

const TS_BUNDLE = path.join(utils.SRC_DIR, "typescript");

const main = async () => {
  if (ap.getArg("REACT_MODE")) {
    await spinner("Initializing Vite React project", async () => {
      cd(ap.projDir);
      await $`pnpm add -D ${DEV_DEPS}`;
      await $`cp ${TS_BUNDLE}/tailwind.config.cjs ${ap.projDir}/`;
      await $`cp ${TS_BUNDLE}/.eslintrc.react.cjs ${ap.projDir}/.eslintrc.cjs`;
    });
  } else {
    await spinner("Initializing Node project", async () => {
      cd(ap.projDir);
      await $`pnpm init`;
      await $`pnpm add -D ${DEV_DEPS}`;
      await $`cp ${TS_BUNDLE}/.eslintrc.cjs ${ap.projDir}/`;
      await $`mkdir -p ${ap.projDir}/src`;
      await $`touch ${ap.projDir}/src/index.ts`;
    });
  }

  await spinner("Copying project files", async () => {
    cd(ap.projDir);
    await $`cp ${TS_BUNDLE}/ts.gitignore ${ap.projDir}/.gitignore`;
    await $`cp ${TS_BUNDLE}/tsconfig.json ${ap.projDir}/`;
    await $`cp ${TS_BUNDLE}/.pre-commit-config.yaml ${ap.projDir}/`;
    await $`cp ${TS_BUNDLE}/.prettierrc.cjs ${ap.projDir}/`;
  });

  await spinner("Setting up pre-commit", async () => {
    cd(ap.projDir);
    await $`pre-commit autoupdate`;
    await $`pre-commit install`;
    await $`pre-commit install --hook-type commit-msg`;
  });

  await spinner("Committing changes", async () => {
    cd(ap.projDir);
    await $`git add .`;
    await $`git commit -m "feat: add project files"`;
    if (!ap.getArg("LOCAL_REPO")) await $`git push -u origin main`.quiet();
  });

  echo(chalk.black.bold.bgWhite("Complete!"));
};

await main();
