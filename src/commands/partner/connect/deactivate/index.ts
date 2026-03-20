import {hux} from '@heroku/heroku-cli-util'
import {Args, Flags} from '@oclif/core'

import BaseCommand from '../../../../lib/base.js'
import * as Partner from '../../../../lib/partner/types.js'

export default class Deactivate extends BaseCommand {
  static args = {

    slug: Args.string({description: 'Partner Connect integration slug', required: true}),
  }
  static description = `Deactivates a Heroku Connect partner integration.
Deactivation prevents new Heroku Connect add-ons from being associated with the partner integration.
It also destroys any existing Heroku Connect add-ons that are associated with the partner integration.`
  static examples = [
    '$ heroku partner:connect:deactivate acme-integrations --team acme-team',
  ]
  static flags = {
    team: Flags.string({
      description: 'The Heroku team that owns this partner integration.',
      required: true,
    }),
  }
    
  async run(): Promise<void> {
    const {args, flags} = await this.parse(Deactivate)
    const {slug} = args
    const team = flags.team as string

    this.log(`Deactivating integration ${slug}...`)

    try {
      const endpoint = `/partner/connect/${slug}`
      const {body} = await this.apiClient.delete<Partner.DeactivateResponse>(endpoint)

      if (body.id === 'inactive') {
        this.log(`Integration already deactivated for ${team}`)
        return
      }

      if (body.summary && body.summary.failed > 0) {
        this.error(`Failed to deactivate partner integration for ${team}. Reason: ${body.message}`)
      }

      this.log('✓ Partner integration deactivated')
      hux.styledObject({
        'Team': team,
        'Integration': slug,
        'Status': body.isv_status,
      })
    } catch (error) {
      const connErr = error as Partner.ConnectionError
      if (connErr.body?.id === 'record_not_found') {
        this.error(`No partner integration found for team ${team}`)
      }

      const message = connErr.body?.message || connErr.message || 'Unknown error'
      this.error(`Failed to deactivate partner integration for ${team}.\nReason: ${message}`)
    }
  }
}
