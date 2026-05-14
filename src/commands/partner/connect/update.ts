import * as color from '@heroku/heroku-cli-util/color'
import {styledJSON, styledObject} from '@heroku/heroku-cli-util/hux'
import {Args, Flags, ux} from '@oclif/core'

import BaseCommand from '../../../lib/base.js'
import * as Partner from '../../../lib/partner/types.js'
import {uploadPartnerData, validateLogoFile} from '../../../lib/partner/upload.js'

export default class PartnerConnectUpdate extends BaseCommand {
  static args = {

    id_or_slug: Args.string({
      description: 'ID or name of the partner integration',
      required: true,
    }),
  }
  static description
    = 'update a partner integration record for Heroku Connect and store the ISV metadata used in Heroku Connect and Salesforce setup flows'
  static examples = [
    '$ heroku partner:connect:update acme-integrations --description "Version 2 of the Acme integration"',
  ]
  static flags = {
    'contact-email': Flags.string({
      description: 'valid email for integration support',
    }),
    description: Flags.string({
      description: 'description of the integration (up to 500 characters)',
    }),
    'docs-url': Flags.string({
      description: "link to partner's documentation or onboarding guide",
    }),
    json: Flags.boolean({description: 'output in JSON format'}),
    'logo-file': Flags.string({
      description: 'image path for the ISV logo',
    }),
  }

  async run(): Promise<void> {
    const {args, flags} = await this.parse(PartnerConnectUpdate)
    const {id_or_slug: idOrSlug} = args
    const logoFile = flags['logo-file']

    // Validate logo file if provided
    if (logoFile) {
      try {
        validateLogoFile(logoFile)
      } catch (error: unknown) {
        this.error((error as Error).message)
      }
    }

    let integration: Partner.PartnerConnect
    try {
      integration = await uploadPartnerData<Partner.PartnerConnect>({
        auth: this.heroku.auth,
        endpoint: `/partner/connect/${idOrSlug}`,
        fields: {
          contact_email: flags['contact-email'],
          description: flags.description,
          docs_url: flags['docs-url'],
        },
        logoFile,
        method: 'PATCH',
      })
    } catch (error) {
      const connErr = error as Partner.ConnectionError
      const message = Partner.formatConnectionError(connErr)
      this.error(`We can't update the partner integration ${color.name(idOrSlug)} because ${message}`)
    }

    if (flags.json) {
      styledJSON(integration)
      return
    }

    ux.stdout(`✓ Updated partner integration ${color.name(idOrSlug)}`)
    ux.stdout('')

    const none = color.disabled('none')

    /* eslint-disable perfectionist/sort-objects */
    styledObject({
      Slug: integration.slug,
      'Partner Integration': integration.name,
      Team: integration.team.name,
      Description: integration.description || none,
      'Documentation URL': integration.docs_url || none,
      'Contact Email': integration.contact_email || none,
      'Logo URL': integration.logo_url || none,
      Status: integration.status || none,
      'Created At': integration.created_at || none,
      'Updated At': integration.updated_at || none,
    })
    /* eslint-enable perfectionist/sort-objects */
  }
}
