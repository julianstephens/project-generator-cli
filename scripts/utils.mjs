import fs from "fs";
import os from "os";
import path from "path";

const searchReplaceFile = async (findExp, replace, file) => {
  const helper = async (exp, rep, loc) => {
    const data = await fs.promises.readFile(loc, "utf8");
    const result = data.replace(exp, rep);
    await fs.promises.writeFile(loc, result, "utf8");
  };

  if (Array.isArray(file)) {
    file.forEach(async (f) => {
      await helper(findExp, replace, f);
    });
  } else {
    await helper(findExp, replace, file);
  }
};

const SRC_DIR = path.join(
  os.homedir(),
  "workspace",
  "project-generator-cli",
  "dist",
  "bundle",
);

const COMMON_BUNDLE = path.join(SRC_DIR, "common");

export default {
  searchReplaceFile,
  SRC_DIR,
  COMMON_BUNDLE,
};
