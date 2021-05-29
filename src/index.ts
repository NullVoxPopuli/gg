import {Command, flags} from '@oclif/command'

class Gg extends Command {
  static description = 'describe the command here'

  static flags = {
    version: flags.version({char: 'v'}),
    help: flags.help({char: 'h'}),
  }

  static args = [{name: 'search'}]

  async run() {
    const {args} = this.parse(Gg)
    const {search} = args;

  }
}

export = Gg
