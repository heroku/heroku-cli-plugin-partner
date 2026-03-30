import {hux} from '@heroku/heroku-cli-util'
import {Args, Flags} from '@oclif/core'

import BaseCommand from '../../../../lib/base.js'
import * as Partner from '../../../../lib/partner/types.js'

export default class Info extends BaseCommand {
  static args = {
    // eslint-disable-next-line camelcase
    id_or_slug: Args.string({description: 'ID or name of the partner integration', required: true}),
  }
  static description = 'display details for a Heroku Connect partner integration'
  static examples = [
    '$ heroku partner:connect:info acme-integrations',
  ]
  static flags = {
    json: Flags.boolean({description: 'output in JSON format'}),
  }

  async run(): Promise<void> {
    const {args, flags} = await this.parse(Info)
    const {id_or_slug: idOrSlug} = args

    let integration: Partner.PartnerConnect
    try {
      const endpoint = `/partner/connect/${idOrSlug}`
      const {body} = await this.apiClient.get<Partner.PartnerConnect>(endpoint)
      integration = body
    } catch (error) {
      const connErr = error as Partner.ConnectionError
      if (connErr.body && connErr.body.id === 'record_not_found') {
        this.error(`No partner integration found for ${idOrSlug}`)
      } else {
        const message = connErr.body?.message || connErr.message || 'Unknown error'
        this.error(`Unable to retrieve partner integration details\nReason: ${message}`)
      }
    }

    if (flags.json) {
      hux.styledJSON(integration)
      return
    }

    hux.styledObject({
      'Slug': integration.slug,
      'Partner Integration': integration.name,
      'Contact Email': integration.contact_email,
      'Team': integration.team,
      'Description': integration.description,
      'Documentation URL': integration.docs_url,
      'Logo URL': integration.logo_url ? `${integration.logo_url}` : '<Default: Heroku>',
      'Status': integration.status,
      'Created At': integration.created_at,
      'Updated At': integration.updated_at,
    })
  }
}
