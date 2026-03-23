import {Args} from '@oclif/core'

import BaseCommand from '../../../../lib/base.js'

export default class Deactivate extends BaseCommand {
  static args = {
    // eslint-disable-next-line camelcase
    id_or_slug: Args.string({description: 'ID or name of the partner integration', required: true}),
  }
  static description = `deactivate a Heroku Connect partner integration
Deactivation prevents associating new Heroku Connect add-ons with the partner integration.
Deactivation also destroys any existing Heroku Connect add-ons associated with the partner integration.`
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
