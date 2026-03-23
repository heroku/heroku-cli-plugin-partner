import {hux} from '@heroku/heroku-cli-util'
import {Args, Flags} from '@oclif/core'

import BaseCommand from '../../../../lib/base.js'
import * as Partner from '../../../../lib/partner/types.js'

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
  static flags = {
    confirm: Flags.string({
      description: 'Confirms the deactivation. Must match the integration ID or slug.',
    }),
  }
    
  async run(): Promise<void> {
    const {args, flags} = await this.parse(Deactivate)
    const {id_or_slug: idOrSlug} = args

    await hux.confirmCommand({
      comparison: idOrSlug,
      confirmation: flags.confirm,
      warningMessage: `This will deactivate the partner integration ${idOrSlug} and destroy all associated Heroku Connect add-ons.`,
      abortedMessage: 'Deactivation cancelled.',
    })

    this.log(`Deactivating integration ${idOrSlug}...`)

    try {
      const endpoint = `/partner/connect/${idOrSlug}`
      const {body} = await this.apiClient.delete<Partner.DeactivateResponse>(endpoint)

      if (body.id === 'inactive') {
        this.log(`Integration already deactivated for ${idOrSlug}`)
        return
      }

      if (body.summary.failed > 0) {
        const failedResponses = body.responses.filter(r => r.error || r.status >= 400)
        const details = failedResponses
          .map(r => `  - Add-on ${r.addon_guid}: ${r.error || r.message || 'Unknown error'}`)
          .join('\n')
        this.log(
          `Failed to deactivate partner integration for ${idOrSlug}.\n` +
          `${body.summary.failed} of ${body.summary.total} add-on deletions failed:\n${details}`
        )
        this.exit(1)
      }

      this.log('✓ Partner integration deactivated')
      hux.styledObject({
        'Integration': idOrSlug,
        'Status': body.isv_status,
      })
    } catch (error) {
      const connErr = error as Partner.ConnectionError
      if (connErr.body?.id === 'record_not_found') {
        this.error(`No partner integration found for ${idOrSlug}`)
      }

      const message = connErr.body?.message || connErr.message || 'Unknown error'
      this.error(`Failed to deactivate partner integration for ${idOrSlug}.\nReason: ${message}`)
    }
  }
}
