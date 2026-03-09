import {Args, Flags} from '@oclif/core'

import BaseCommand from '../../../../lib/base'

export default class Info extends BaseCommand {
  static args = {
    id: Args.string({description: 'Partner Connect integration ID', required: true}),
  }
  static description = 'Show Partner Connect integration info'
  static flags = {
    json: Flags.boolean({description: 'Output in JSON format'}),
  }

  async run(): Promise<void> {
    const {args, flags} = await this.parse(Info)

    const {body} = await this.apiClient.get<Record<string, unknown>>(`/partner/connect/${args.id}`)

    if (flags.json) {
      this.log(JSON.stringify(body, null, 2))
      return
    }

    const fields = [
      ['Name:', body.name],
      ['Slug:', body.slug],
      ['Description:', body.description || '(none)'],
      ['Docs URL:', body.docs_url || '(none)'],
      ['Contact Email:', body.contact_email || '(none)'],
      ['Logo URL:', body.logo_url || '(none)'],
    ]

    const maxLabelLength = Math.max(...fields.map(([label]) => String(label).length))

    for (const [label, value] of fields) {
      this.log(`${String(label).padEnd(maxLabelLength + 1)} ${value}`)
    }
  }
}
