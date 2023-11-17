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

const SRC_DIR = path.join(
  os.homedir(),
  "workspace",
  "project-generator-cli",
  "dist",
  "bundle",
);
const COMMON_BUNDLE = path.join(SRC_DIR, "common");
const PROJ_DIR = path.join(os.homedir(), "workspace", PNAME);

const createLocal = async () => {
  await $`mkdir ${PROJ_DIR}`;
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

      const flags = [
        "--clone",
        "--add-readme",
        ...(IS_PRIVATE ? ["--private"] : ["--public"]),
      ];

      if (LOCAL_REPO) {
        await createLocal();
      } else {
        try {
          cd(path.join(os.homedir(), "workspace"));
          await $`gh repo create ${PNAME} ${flags}`;
        } catch {
          console.log(
            "Could not create remote with GH CLI. Creating local repo",
          );
          await createLocal();
        }
      }
    },
  );

  await spinner("Copying project files", async () => {
    // copy bundle
    await $`cp ${COMMON_BUNDLE}/gen.gitignore ${PROJ_DIR}/.gitignore`;
    await $`cp ${COMMON_BUNDLE}/.pre-commit-config.yaml ${PROJ_DIR}/`;
    await $`cp ${COMMON_BUNDLE}/README.md ${PROJ_DIR}/`;
    await searchReplaceFile(
      /PROJECT_NAME/g,
      PNAME,
      path.join(PROJ_DIR, "README.md"),
    );
    // add commitlint config
    const config = path.join(
      COMMON_BUNDLE,
      `${USE_EMOJI ? "emoji." : ""}commitlint.config.js`,
    );
    await $`cp ${config} ${PROJ_DIR}/commitlint.config.cjs`;
  });

  await spinner("Setting up pre-commit", async () => {
    cd(PROJ_DIR);
    await $`pre-commit autoupdate`;
    await $`pre-commit install`;
    await $`pre-commit install --hook-type commit-msg`;
  });
};

await main();
