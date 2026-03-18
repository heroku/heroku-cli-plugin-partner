import {hux} from '@heroku/heroku-cli-util'
import {Args, Flags} from '@oclif/core'

import BaseCommand from '../../../../lib/base.js'
import * as Partner from '../../../../lib/partner/types.js'

export default class Create extends BaseCommand {
  static args = {
    slug: Args.string({description: 'Label used to uniquely identify the ISV', required: true}),
  }
  static description =
    'Creates a new partner integration record for Heroku Connect and stores ISV metadata used in Heroku Connect and Salesforce setup flows.'
  static examples = [
    '$ heroku partner:connect:create acme-integration --team acme-team --isv-name "Acme Integrations"',
  ]
  static flags = {
    team: Flags.string({
      description: 'The Heroku team that owns this partner integration.',
      required: true,
    }),
    'isv-name': Flags.string({
      description: 'Name of the ISV or partner publishing the integration.',
      required: true,
    }),
    description: Flags.string({
      description: 'Optional description of the integration (up to 500 characters).',
    }),
    'docs-url': Flags.string({
      description: 'Optional link to partner’s documentation or onboarding guide. Must be a valid HTTP/HTTPS URL.',
    }),
    'contact-email': Flags.string({
      description: 'Optional contact email for integration support. Must be a valid email address.',
    }),
    'logo-file': Flags.string({
      description: 'Optional image path for the ISV logo. Must be a path to a valid image file.',
    }),
  }

  async run(): Promise<void> {
    const {args, flags} = await this.parse(Create)

    const isvName = flags['isv-name'] as string

    let integration: Partner.PartnerConnect
    try {
      const endpoint = `/partner/connect`
      const requestBody = {
        'contact_email': flags['contact-email'],
        'description': flags.description,
        'docs_url': flags['docs-url'],
        'logo_url': flags['logo-file'],
        'name': isvName,
        'slug': args.slug,
        'team': flags.team,
      }

      const {body} = await this.apiClient.post<Partner.PartnerConnect>(endpoint, {
        body: requestBody,
      })
      integration = body
    } catch (error) {
      const connErr = error as Partner.ConnectionError
      const message = connErr.body?.message || connErr.message || 'Unknown error'
      this.error(`Unable to create partner integration.\nReason: ${message}`)
    }

    this.log('✓ Partner integration created')
    this.log('')

    hux.styledObject({
      'Slug': integration.slug,
      'Partner Integration': integration.name,
      'Team': integration.team,
      'Description': integration.description || 'none',
      'Documentation URL': integration.docs_url || 'none',
      'Contact Email': integration.contact_email || 'none',
      'Logo URL': integration.logo_url || 'none',
      'Status': integration.status || 'none',
      'Created At': integration.created_at || 'none',
    })
  }
}
