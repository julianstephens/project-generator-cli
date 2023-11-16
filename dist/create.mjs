#!/usr/bin/env zx

import "zx/globals";

const searchReplaceFile = async (findExp, replace, file) => {
  const helper = async (exp, rep, loc) => {
    const data = await fs.readFile(loc, "utf8");
    const result = data.replace(exp, rep);
    await fs.writeFile(loc, result, "utf8");
  };

  if (Array.isArray(file)) {
    file.forEach(async (f) => {
      await helper(findExp, replace, f);
    });
  } else {
    await helper(findExp, replace, file);
  }
};

process.env.FORCE_COLOR = "1";

const bool = (opt) => (opt.toLowerCase() === "true" ? true : false);

const PNAME = argv._[0];
const IS_PRIVATE = bool(argv._[1]);
const USE_EMOJI = bool(argv._[2]);
const LOCAL_REPO = bool(argv._[3]);

const DEV_DEPS = ["ruff", "pyright", "pydocstyle", "mypy", "pre-commit"];

const SRC_DIR = path.join(
  os.homedir(),
  "workspace",
  "project-generator-cli",
  "dist",
  "bundle",
);
const COMMON_BUNDLE = path.join(SRC_DIR, "common");
const PY_BUNDLE = path.join(SRC_DIR, "python");
const PROJ_DIR = path.join(os.homedir(), "workspace", PNAME);

const create_local = async () => {
  await $`mkdir -p ${path.join(PROJ_DIR, PNAME)}`;
  cd(PROJ_DIR);
  await $`git init`;
};

const main = async () => {
  await spinner(
    `Creating ${LOCAL_REPO ? "local" : ""} project ${chalk.cyan(PNAME)}`,
    async () => {
      const exists = fs.existsSync(PROJ_DIR);
      if (exists) {
        console.log(chalk.red("Error: "), "Project already exists");
        throw Error("Project already exists");
      }

      cd(path.join(os.homedir(), "workspace"));
      const flags = [
        "--clone",
        "--add-readme",
        ...(IS_PRIVATE ? ["--private"] : ["--public"]),
      ];
      if (!LOCAL_REPO) {
        try {
          await $`gh repo create ${PNAME} ${flags}`;
          cd(PROJ_DIR);
        } catch {
          console.log(
            `Could not create remote with GH CLI. Creating local repo...`,
          );
          create_local();
        }
      } else {
        create_local();
      }
    },
  );

  await spinner("Copying project files", async () => {
    // copy python bundle
    await $`cp ${COMMON_BUNDLE}/gen.gitignore ${PROJ_DIR}/`;
    await $`cp ${COMMON_BUNDLE}/.pre-commit-config.yaml ${PROJ_DIR}/`;
    await $`cp ${COMMON_BUNDLE}/README.md ${PROJ_DIR}/`;
    await $`cp -a ${PY_BUNDLE}/. ${PROJ_DIR}/`;
    // combine gitignores
    const py = await fs.readFile(path.join(PY_BUNDLE, "py.gitignore"));
    await fs.appendFile(path.join(PROJ_DIR, "gen.gitignore"), py);
    await $`mv ${path.join(PROJ_DIR, "gen.gitignore")} ${path.join(
      PROJ_DIR,
      ".gitignore",
    )}`;
    await $`rm ${path.join(PROJ_DIR, "py.gitignore")}`;
    // add commitlint config
    const config = path.join(
      COMMON_BUNDLE,
      `${USE_EMOJI ? "emoji." : ""}commitlint.config.js`,
    );
    await $`cp ${config} ${PROJ_DIR}/commitlint.config.cjs`;
    // create source template
    const srcFiles = ["__init__.py", "__main__.py"];
    srcFiles.forEach(async (f) => {
      const loc = path.join(PROJ_DIR, PNAME, f);
      await $`touch ${loc}`;
    });

    const data = `if __name__ == "__main__":
      pass
    `;
    fs.appendFile(path.join(PROJ_DIR, PNAME, "__main__.py"), data);
  });

  await spinner(`Setting up Poetry`, async () => {
    cd(PROJ_DIR);
    await $`poetry init -n -q`;
    await $`poetry add -nq -G dev ${DEV_DEPS}`;
    await $`poetry install --no-root`;
    await searchReplaceFile(/PROJECT_NAME/g, PNAME, [
      path.join(PROJ_DIR, "pyrightconfig.json"),
      path.join(PROJ_DIR, "README.md"),
    ]);
  });

  await spinner("Setting up pre-commit", async () => {
    cd(PROJ_DIR);
    await $`poetry run pre-commit autoupdate`;
    await $`poetry run pre-commit install`;
    await $`poetry run pre-commit install --hook-type commit-msg`;
  });

  cd(PROJ_DIR);
  await $`git add .`.quiet();
  await $`git commit -m 'Initial commit' --no-verify`.quiet();
  if (!LOCAL_REPO) await $`git push -u origin main`.quiet();

  console.log(chalk.black.bold.bgWhite("Complete!"));
};

await main();
