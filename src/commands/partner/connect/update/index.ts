import {hux} from '@heroku/heroku-cli-util'
import {Args, Flags} from '@oclif/core'

import BaseCommand from '../../../../lib/base.js'
import * as Partner from '../../../../lib/partner/types.js'
import {uploadPartnerData, validateLogoFile} from '../../../../lib/partner/upload.js'

export default class Update extends BaseCommand {
  static args = {
    // eslint-disable-next-line camelcase
    id_or_slug: Args.string({description: 'ID or name of the partner integration', required: true}),
  }
  static description = 'Update Partner Connect integration'
  static examples = [
    '$ heroku partner:connect:update acme-integrations --description "Version 2 of the Acme integration"',
  ]
  static flags = {
    json: Flags.boolean({description: 'Output in JSON format'}),
    description: Flags.string({
      description: 'Description of the integration (up to 500 characters).',
    }),
    'docs-url': Flags.string({
      description: 'Link to partner documentation or onboarding guide. Must be a valid URL.',
    }),
    'contact-email': Flags.string({
      description: 'Contact email for integration support. Must be a valid email address.',
    }),
    'logo-file': Flags.string({
      description: 'Image path for the ISV logo. Must be a path to a valid image file.',
    }),
  }

  async run(): Promise<void> {
    const {args, flags} = await this.parse(Update)
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
        method: 'PATCH',
        fields: {
          // eslint-disable-next-line camelcase
          contact_email: flags['contact-email'],
          description: flags.description,
          // eslint-disable-next-line camelcase
          docs_url: flags['docs-url'],
        },
        logoFile,
      })
    } catch (error) {
      const connErr = error as Partner.ConnectionError
      const message = connErr.body?.message || connErr.message || 'Unknown error'
      this.error(`Unable to update partner integration.\nReason: ${message}`)
    }

    if (flags.json) {
      hux.styledJSON(integration)
      return
    }

    this.log('✓ Partner integration updated')
    this.log('')

    hux.styledObject({
      'Slug': integration.slug,
      'Partner Integration': integration.name,
      'Description': integration.description || 'none',
      'Documentation URL': integration.docs_url || 'none',
      'Contact Email': integration.contact_email || 'none',
      'Logo URL': integration.logo_url || 'none',
      'Status': integration.status || 'none',
      'Updated At': integration.updated_at || 'none',
    })
  }
}
