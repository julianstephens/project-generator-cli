export default class ArgParser {
  #argv;

  #ARGS = {
    PNAME: 0,
    LOCAL_REPO: 1,
    IS_PRIVATE: 2,
    USE_EMOJI: 3,
    REACT_MODE: 4,
    WORKSPACE_DIR: 5,
  };

  constructor(argv) {
    this.#argv = argv;
    this.workspaceDir =
      this.#argv._[4] ||
      process.env.WORKSPACE_DIR ||
      path.join(os.homedir(), "workspace");
    path.join(os.homedir(), "workspace");
    this.projectName = this.#argv._[0];
    this.projDir = path.join(this.workspaceDir, this.projectName);
  }

  #bool = (opt) => (opt && opt?.toLowerCase() === "true" ? true : false);

  getArg(arg) {
    const pos = this.#ARGS[arg];
    if (pos === 0) return this.#argv._[pos];
    return this.#bool(this.#argv._[pos]);
  }
}
