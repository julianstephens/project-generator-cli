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

const PNAME = argv._[0];
const LOCAL_REPO = argv._[1] === "true" ? true : false;

const DEV_DEPS = ["ruff", "pyright", "pydocstyle", "mypy", "pre-commit"];

const SRC_DIR = path.join(
  os.homedir(),
  "workspace",
  "project-generator-cli",
  "dist",
  "bundle",
);

const PY_BUNDLE = path.join(SRC_DIR, "python");
const PROJ_DIR = path.join(os.homedir(), "workspace", PNAME);

const main = async () => {
  await spinner("Copying python files", async () => {
    // copy python bundle
    await $`mkdir -p ${PROJ_DIR}/${PNAME}`;
    await $`cp -a ${PY_BUNDLE}/. ${PROJ_DIR}/`;
    // combine gitignores
    const py = await fs.readFile(path.join(PY_BUNDLE, "py.gitignore"));
    await fs.appendFile(path.join(PROJ_DIR, ".gitignore"), py);
    await $`rm ${path.join(PROJ_DIR, "py.gitignore")}`;
    // create source template
    const srcFiles = ["__init__", "__main__"];
    srcFiles.forEach(async (f) => {
      await $`touch ${path.join(PROJ_DIR, PNAME, `${f}.py`)}`;
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
    await searchReplaceFile(
      /PROJECT_NAME/g,
      PNAME,
      path.join(PROJ_DIR, "pyrightconfig.json"),
    );
  });

  cd(PROJ_DIR);
  await $`git add .`.quiet();
  await $`git commit -m 'chore: add project files' --no-verify`.quiet();
  if (!LOCAL_REPO) await $`git push -u origin main`.quiet();

  console.log(chalk.black.bold.bgWhite("Complete!"));
};

await main();
