import {hux} from '@heroku/heroku-cli-util'
import {Args, Flags} from '@oclif/core'

import BaseCommand from '../../../../lib/base.js'
import * as Partner from '../../../../lib/partner/types.js'
import {uploadPartnerData, validateLogoFile} from '../../../../lib/partner/upload.js'

export default class Create extends BaseCommand {
  static args = {
    slug: Args.string({description: 'name of the partner integration', required: true}),
  }
  static description =
    'create a partner integration record for Heroku Connect and store the ISV metadata used in Heroku Connect and Salesforce setup flows'
  static examples = [
    '$ heroku partner:connect:create acme-integration --team acme-team --isv-name "Acme Integrations"',
  ]
  static flags = {
    team: Flags.string({
      description: 'Heroku team that owns the partner integration',
      required: true,
    }),
    'isv-name': Flags.string({
      description: 'name of the ISV or partner publishing the integration',
      required: true,
    }),
    description: Flags.string({
      description: 'description of the integration (up to 500 characters)',
    }),
    'docs-url': Flags.string({
      description: 'link to partner’s documentation or onboarding guide',
    }),
    'contact-email': Flags.string({
      description: 'valid email for integration support',
    }),
    'logo-file': Flags.string({
      description: 'image path for the ISV logo',
    }),
  }

  async run(): Promise<void> {
    const {args, flags} = await this.parse(Create)

    const isvName = flags['isv-name'] as string
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
        endpoint: '/partner/connect',
        fields: {
          name: isvName,
          slug: args.slug,
          team: flags.team,
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
      const message = Partner.formatConnectionError(connErr)
      this.error(`Unable to create partner integration.\nReason: ${message}`)
    }

    this.log('✓ Partner integration created')
    this.log('')

    hux.styledObject({
      'Slug': integration.slug,
      'Partner Integration': integration.name,
      'Team': integration.team_name,
      'Description': integration.description || 'none',
      'Documentation URL': integration.docs_url || 'none',
      'Contact Email': integration.contact_email || 'none',
      'Logo URL': integration.logo_url || 'none',
      'Status': integration.status || 'none',
      'Created At': integration.created_at || 'none',
    })
  }
}
