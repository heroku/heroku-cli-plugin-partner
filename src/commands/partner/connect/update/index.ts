import {Args, Flags} from '@oclif/core'

import BaseCommand from '../../../../lib/base'
import {getHux} from '../../../../lib/hux-wrapper'

export default class Update extends BaseCommand {
    static args = {
        // eslint-disable-next-line camelcase
        id_or_slug: Args.string({description: 'Partner Connect integration ID or integration name', required: true}),
    }
    static description = 'Update Partner Connect integration'
    static examples = [
        '$ heroku partner:connect:update acme-integrations --description "Version 2 of the Acme integration"',
    ]
    static flags = {
        json: Flags.boolean({description: 'Output in JSON format'}),
        description: Flags.string({description: 'Description of the integration (up to 500 characters).', required: false}),
        'docs-url': Flags.string({description: 'Link to partner’s documentation or onboarding guide. Must be a valid URL. URL', required: false}),
        'contact-email': Flags.string({description: 'Contact email for integration support. Must be a valid email address.', required: false}),
        'logo-file': Flags.string({description: 'Image for the ISV logo. Must be path to a valid image file.', required: false}),
    }

    async run(): Promise<void> {
        const {args, flags} = await this.parse(Update)

        const updateBody: Record<string, string> = {}
        if (flags.description) updateBody.description = flags.description
        if (flags['docs-url']) updateBody.docsUrl = flags['docs-url']
        if (flags['contact-email']) updateBody.contactEmail = flags['contact-email']
        if (flags['logo-file']) updateBody.logoFile = flags['logo-file']

        const {body} = await this.apiClient.patch<Record<string, unknown>>(`/partner/connect/${args.id_or_slug}`, {
            body: updateBody,
        })

        if (flags.json) {
            this.log(JSON.stringify(body, null, 2))
            return
        }

        this.log('✓ Partner integration created')
        this.log('')

        const hux = await getHux()

        hux.styledObject({
        'ISV Name': body.isvName,
        'Description': body.description || 'none',
        'Documentation': body.docsUrl || 'none',
        'Contact Email': body.contactEmail || 'none',
        'Logo': body.logoFile || 'none',
        })
    }
}
