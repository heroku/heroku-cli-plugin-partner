import {hux} from '@heroku/heroku-cli-util'
import {Args, Flags} from '@oclif/core'

import BaseCommand from '../../../../lib/base.js'
import * as Partner from '../../../../lib/partner/types.js'

export default class Enroll extends BaseCommand {
  static args = {
    // eslint-disable-next-line camelcase
    id_or_slug: Args.string({description: 'ID or name of the partner integration', required: true}),
  }
  static description = 'enroll an existing add-on into a partner integration'
  static examples = [
    '$ heroku partner:connect:enroll acme-integrations --addon addon-id',
  ]
  static flags = {
    addon: Flags.string({description: 'ID or name of the add-on to enroll', required: true}),
    json: Flags.boolean({description: 'output in JSON format'}),
  }

  async run(): Promise<void> {
    const {args, flags} = await this.parse(Enroll)
    const {id_or_slug: idOrSlug} = args
    const {addon: addonId} = flags
    this.log(`Enrolling add-on ${addonId} into partner integration ${idOrSlug}...`)
    let enrollResponse: Partner.EnrollResponse
    try {
      const endpoint = `/partner/connect/${idOrSlug}/addon/${addonId}/enroll`
      const {body} = await this.apiClient.post<Partner.EnrollResponse>(endpoint, {body: {}})
      enrollResponse = body
    } catch (error) {
      const connErr = error as Partner.ConnectionError
      switch (connErr.body?.id) {
        case 'conflict': {
          this.error(connErr.body?.message || `Add-on '${addonId}' is already associated with an ISV`)

          break
        }

        case 'forbidden': {
          this.error(connErr.body?.message || `Not authorized to enroll add-on '${addonId}'`)

          break
        }

        case 'not_found': {
          this.error(connErr.body?.message || `Add-on '${addonId}' not found`)

          break
        }

        default: {
          const message = Partner.formatConnectionError(connErr)
          this.error(`Failed to enroll add-on '${addonId}' into partner integration '${idOrSlug}'.\nReason: ${message}`)
        }
      }
    }

    this.log(`✓ ${enrollResponse.message}`)

    if (flags.json) {
      hux.styledJSON(enrollResponse)

      return
    }

    hux.styledObject({
      'Add-on UUID': enrollResponse.addon_uuid,
      'ISV GUID': enrollResponse.isv_guid,
      'ISV Slug': enrollResponse.isv_slug,
    })
  }
}
