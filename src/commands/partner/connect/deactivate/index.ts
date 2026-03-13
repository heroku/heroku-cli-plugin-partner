import {Args} from '@oclif/core'

import BaseCommand from '../../../../lib/base'

export default class Deactivate extends BaseCommand {
  static args = {
    // eslint-disable-next-line camelcase
    id_or_slug: Args.string({description: 'Partner Connect integration ID or integration name', required: true}),
  }
  static description = `Deactivates a Heroku Connect partner integration.
Deactivation prevents new Heroku Connect add-ons from being associated with the partner integration.
It also destroys any existing Heroku Connect add-ons that are associated with the partner integration.`
  static examples = [
    '$ heroku partner:connect:deactivate acme-integrations',
  ]

  async run(): Promise<void> {
    const {args} = await this.parse(Deactivate)
    const {id_or_slug: idOrSlug} = args

    // TODO: Implement deactivation logic
    this.log(`Deactivating integration ${idOrSlug}...`)
  }
}
