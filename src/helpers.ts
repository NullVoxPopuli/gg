/* eslint-disable @typescript-eslint/no-explicit-any */
import chalk from 'chalk';
import { stripIndent } from 'common-tags';
import execa from 'execa';
import fs from 'fs/promises';
import path from 'path';
import process from 'process';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const nfzf = require('node-fzf');

const STARTING_DIRECTORY = process.cwd();
const GIT_ROOTS = (process.env.GG_PATHS || '').split(':');
const PREFIX = process.env.GG_PREFIX || process.env.HOME || '/';

export function verify() {
  if (GIT_ROOTS[0].length === 0) {
    throw new Error(
      chalk.red(stripIndent`
        \`GG_PATHS\` is not set!

        set \`GG_PATHS\` to paths that point to collections of git repos.

        example:
          GG_PATHS="$HOME/Development/NullVoxPopuli:$HOME/Development/Work"

        once GG_PATHS is set in your .bash_profile (or similar), open a new
        terminal and try again
     `)
    );
  }
}

export async function isInRepo(): Promise<boolean> {
  try {
    let { stdout } = await execa('git', ['rev-parse', '--is-inside-work-tree'], {});

    return stdout === 'true';
  } catch (e) {
    return false;
  }
}

export async function hasWorktrees(): Promise<boolean> {
  return await false;
}

export async function hasWorkspaces(): Promise<boolean> {
  return await false;
}

export async function promptForRepo(_search = '') {
  const list = await getGitRepoList();
  const withoutFolders = list.map((repo) => {
    let [, name] = repo.split(path.sep);

    return `/${name}`;
  });

  let result: any = await nfzf({
    label: label('git repo'),
    mode: 'normal',
    list: withoutFolders,
    prelinehook(i: number) {
      let [folder] = list[i].split(path.sep);

      return chalk.gray(`${folder}`);
    },
  });

  let { selected } = result;

  if (!selected || !selected.value) {
    console.info(chalk.gray('No repo selected'));
    process.exit(0);
  }

  let value = list[selected.index];
  let target = path.join(PREFIX, value);

  process.chdir(`${target}/`);

  return selected;
}

export async function promptForWorktree(_search = '') {}

export async function promptForWorkspace(_search = '') {}

function label(txt: string) {
  return `\n${txt} ${chalk.green('❯')} `;
}

/*
 * This is super slow
 */
async function getGitRepoList() {
  let results: string[] = [];

  for await (let root of GIT_ROOTS) {
    // find is faster than doing this with node utils
    // but does mean that gg can't work on Windows machines
    let { stdout } = await execa('find', [
      root,
      '-mindepth',
      '1',
      '-maxdepth',
      '1',
      '-type',
      'd',
      '-printf',
      '%P::',
    ]);

    stdout
      .split('::')
      .filter(Boolean)
      .map((file) => {
        let shortRoot = root.replace(new RegExp(`^${PREFIX}`), '');
        let filePath = path.join(shortRoot, file);

        results.push(filePath);
      });
  }

  return results;
}
