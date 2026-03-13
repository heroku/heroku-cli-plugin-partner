import {Args, Flags} from '@oclif/core'

import BaseCommand from '../../../../lib/base'

export default class Deactivate extends BaseCommand {
  static args = {
    slug: Args.string({description: 'Label used to uniquely identify the ISV', required: true}),
  }
  static description = `Deactivates a Heroku Connect partner integration for the specified team.
Deactivation prevents new Heroku Connect add-ons from being associated with the partner integration.
It also destroys any existing Heroku Connect add-ons that are associated with the partner integration.`
  static examples = [
    '$ heroku partner:connect:deactivate acme-integrations --team acme-team',
  ]
  static flags = {
    team: Flags.string({description: 'The Heroku team that owns this partner integration', required: true}),
  }

  async run(): Promise<void> {
    const {args, flags} = await this.parse(Deactivate)
    const {slug} = args
    const {team} = flags

    // TODO: Implement deactivation logic
    this.log(`Deactivating integration ${slug} for team ${team}...`)
  }
}
