import { Command, flags } from '@oclif/command';
import { stripIndent } from 'common-tags';

import {
  hasWorkspaces,
  hasWorktrees,
  isInRepo,
  promptForRepo,
  promptForWorkspace,
  promptForWorktree,
  verify,
} from './helpers';

class Gg extends Command {
  static description = stripIndent`
    Optimized file system navigation focused on git repos and monorepos...

    3 Steps:
      1. Choose a repo, skipeed if already in a repo
      2. Choose a worktree, skipped if you have no worktrees
      3. Choose a sub-project, skipped if the current repo is not a monorepo

    Required environment variables:

      GG_PATHS :: all folders containing git repos to search for
        e.g.: GG_PATHS="$HOME/Development/NullVoxPopuli:$HOME/Development/Work"


    Optional environment variables:

      GG_PREFIX :: paths displayed in prompts will have this string removed
        e.g.: GG_PREFIX="$HOME/Development/"
  `;

  static flags = {
    version: flags.version({ char: 'v' }),
    help: flags.help({ char: 'h' }),
    changeWorkspace: flags.boolean({
      char: 'w',
      description: stripIndent`
        If in a monorepo, -w will skip to the change workspace step.
        Otherwise, no-op.
      `,
    }),
  };

  static args = [{ name: 'search' }];

  async run() {
    const { args, flags } = this.parse(Gg);
    const { changeWorkspace } = flags;
    let { search } = args;

    verify();

    if (!(await isInRepo())) {
      await promptForRepo(search);
      search = '';
    }

    if (!changeWorkspace && (await hasWorktrees())) {
      await promptForWorktree(search);
      search = '';
    }

    if (await hasWorkspaces()) {
      await promptForWorkspace(search);
    }
  }
}

export = Gg;
