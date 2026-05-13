import { color, hux } from '@heroku/heroku-cli-util'
import { Args, Flags } from '@oclif/core'

import BaseCommand from '../../../../lib/base.js'
import * as Partner from '../../../../lib/partner/types.js'

export default class Deactivate extends BaseCommand {
  static args = {
    // eslint-disable-next-line camelcase
    id_or_slug: Args.string({
      description: 'ID or name of the partner integration',
      required: true,
    }),
  }
  static description = `deactivate a Heroku Connect partner integration
 Deactivation prevents associating new Heroku Connect add-ons with the partner integration.
 Deactivation also destroys any existing Heroku Connect add-ons associated with the partner integration.`
  static examples = ['$ heroku partner:connect:deactivate acme-integrations']
  static flags = {
    confirm: Flags.string({
      description: 'pass in the integration ID or slug to skip confirmation prompts',
    }),
  }

  async run(): Promise<void> {
    const { args, flags } = await this.parse(Deactivate)
    const { id_or_slug: idOrSlug } = args

    await hux.confirmCommand({
      comparison: idOrSlug,
      confirmation: flags.confirm,
      warningMessage: `This command deactivates the partner integration ${color.name(idOrSlug)} and destroys all associated Heroku Connect add-ons.`,
      abortedMessage: 'Canceled deactivation.',
    })

    this.log(`Deactivating partner integration ${color.name(idOrSlug)}...`)

    try {
      const endpoint = `/partner/connect/${idOrSlug}`
      const { body } = await this.apiClient.delete<Partner.DeactivateResponse>(endpoint)

      if (body.id === 'inactive') {
        this.log(`Partner integration ${color.name(idOrSlug)} is already deactivated.`)
        return
      }

      if (body.summary.failed > 0) {
        const failedResponses = body.responses.filter((r) => r.error || r.status >= 400)
        const details = failedResponses
          .map((r) => `  - Add-on ${r.addon_guid}: ${r.error || r.message || 'Unknown error'}`)
          .join('\n')
        this.log(
          `We can't deactivate partner integration ${color.name(idOrSlug)}.\n` +
            `${body.summary.failed} of ${body.summary.total} add-on deletions failed:\n${details}`
        )
        this.exit(1)
      }

      this.log(`✓ Deactivated partner integration ${color.name(idOrSlug)}`)
      hux.styledObject({
        Integration: idOrSlug,
        Status: body.isv_status,
      })
    } catch (error) {
      const connErr = error as Partner.ConnectionError
      if (connErr.body?.id === 'record_not_found') {
        this.error(`Partner integration ${color.name(idOrSlug)} doesn't exist.`)
      }

      this.error(`We can't deactivate partner integration ${color.name(idOrSlug)} due to an unexpected error.`)
    }
  }
}
