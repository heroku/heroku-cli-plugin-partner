import {Args, Flags} from '@oclif/core'

import BaseCommand from '../../../../lib/base'
import {getHux} from '../../../../lib/hux-wrapper'
import * as Partner from '../../../../lib/partner/types'

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
    isvName: Flags.string({
      description: 'Name of the ISV or partner publishing the integration.',
      required: true,
    }),
    description: Flags.string({
      description: 'Description of the integration (up to 500 characters).',
      required: true,
    }),
    docsUrl: Flags.string({
      description:
        'Optional link to partner’s documentation or onboarding guide. Must be a valid URL.',
    }),
    contactEmail: Flags.string({
      description: 'Contact email for integration support. Must be a valid email address.',
      required: true,
    }),
    logoFile: Flags.string({
      aliases: ['logo-path'],
      description:
        'Optional image for the ISV logo. Must be path to a valid image file.',
    }),
  }

  async run(): Promise<void> {
    const hux = await getHux()
    const {args, flags} = await this.parse(Create)

    const payload: Partner.CreatePartnerConnect = {
      slug: args.slug,
      team: flags.team,
      description: flags.description,
      docsUrl: flags.docsUrl,
      contactEmail: flags.contactEmail,
      isvName: flags.isvName,
      logoFile: flags.logoFile,
    }

    // TODO: Implement API call to create partner integration

    this.log('✓ Partner integration created')
    this.log('')

    hux.styledObject({
      'ISV Name': payload.isvName,
      'Description': payload.description || 'none',
      'Documentation': payload.docsUrl || 'none',
      'Contact Email': payload.contactEmail || 'none',
      'Logo': payload.logoFile || 'none',
    })
  }
}
