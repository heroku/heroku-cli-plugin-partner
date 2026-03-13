import {Args, Flags} from '@oclif/core'

import BaseCommand from '../../../../lib/base'
import {getHux} from '../../../../lib/hux-wrapper'
import * as Partner from '../../../../lib/partner/types'

export default class Deactivate extends BaseCommand {
  static args = {
    slug: Args.string({description: 'Label used to uniquely identify the ISV', required: true}),
  }
  static description = 'Deactivates a Heroku Connect partner integration for the specified team.\nDeactivation prevents customers from discovering or installing the integration,\nwhile preserving stored metadata for audit and potential reactivation.'
  static examples = [
    '$ heroku partner:connect:deactivate acme-integrations --team acme-team',
  ]
  static flags = {
    team: Flags.string({description: 'The Heroku team that owns this partner integration', required: true}),
  }

  async run(): Promise<void> {
    const hux = await getHux()
    const {args, flags} = await this.parse(Deactivate)
    const {slug} = args
    const {team} = flags

    // TODO: Implement deactivation logic
    this.log(`Deactivating integration ${slug} for team ${team}...`)
  }
}
