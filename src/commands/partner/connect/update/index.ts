import {Args, Flags} from '@oclif/core'

import BaseCommand from '../../../../lib/base'

export default class Update extends BaseCommand {
    static args = {
        id: Args.string({description: 'Partner Connect integration ID or slug', required: true}),
    }
    static description = 'Update Partner Connect integration'
    static flags = {
        json: Flags.boolean({description: 'Output in JSON format'}),
        description: Flags.string({description: 'Description', required: false}),
        docs_url: Flags.string({description: 'Docs URL', required: false}),
        contact_email: Flags.string({description: 'Contact Email', required: false}),
        logo_url: Flags.string({description: 'Logo URL', required: false}),
    }

    async run(): Promise<void> {
        const {args, flags} = await this.parse(Update)

        const {body} = await this.apiClient.patch<Record<string, unknown>>(`/partner/connect/${args.id}`, {
            body: {
                team: args.team,
                description: flags.description || undefined,
                docs_url: flags.docs_url || undefined,
                contact_email: flags.contact_email || undefined,
                logo_url: flags.logo_url || undefined,
            }
        })

        if (flags.json) {
            this.log(JSON.stringify(body, null, 2))
            return
        }

        this.log(`Partner Connect integration ${args.id} updated successfully`)
    }
}