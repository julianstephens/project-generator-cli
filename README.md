# project-generator-cli

A CLI tool for scaffolding minimal project templates with sane defaults.

## Prerequisites

### General
- [Git](https://git-scm.com/downloads)
- [GitHub CLI](https://cli.github.com/) (for creating GH remotes, otherwise use the `-l` or `--local` flag to skip)

### Python
- [Poetry](https://python-poetry.org/docs/#installation)

### Typescript
- [Node](https://nodejs.org/en) >=v18
- [pnpm](https://pnpm.io/installation)

## Installation

### Step 1: Clone this repo

### Step 2: Set `WORKSPACE_DIR` environment variable

Add the following line to your profile file (`~/.bash_profile`, `~/.zshrc`, `~/.profile`, or `~/.bashrc`). This is where all the projects created using the tool will be located (defaults to `~/workspace` if unset).

```sh
export WORKSPACE_DIR=/path/to/your/project/workspace
```

### Step 3: Make the `gen` command globally available

```sh
cd /path/to/project-generator-cli
pnpm link --global
```
## Usage

```sh
gen help
```
