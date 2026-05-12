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
    this.log(`Enrolling add-on ${addonId} to partner integration ${idOrSlug}...`)
    let enrollResponse: Partner.EnrollResponse
    try {
      const endpoint = `/partner/connect/${idOrSlug}/addon/${addonId}/enroll`
      const {body} = await this.apiClient.post<Partner.EnrollResponse>(endpoint, {body: {}})
      enrollResponse = body
    } catch (error) {
      const connErr = error as Partner.ConnectionError
      switch (connErr.body?.id) {
        case 'conflict': {
          this.error(`Add-on '${addonId}' is already enrolled with an ISV.`)

          break
        }

        case 'forbidden': {
          this.error(`You're not authorized to enroll the add-on '${addonId}'. Contact your Heroku admin, or open a ticket with Heroku Support to get help with the error: https://help.heroku.com/.`)

          break
        }

        case 'not_found': {
          this.error(`Add-on '${addonId}' doesn't exist. Check the add-on exists and try again, or enroll a different add-on.`)

          break
        }

        default: {
          this.error(`We can't enroll add-on '${addonId}' to partner integration '${idOrSlug}' due to an unexpected error. Try again, or open a ticket with Heroku Support to get help with the error: https://help.heroku.com/.`)
        }
      }
    }

    if (flags.json) {
      hux.styledJSON(enrollResponse)

      return
    }

    this.log(`✓ Successfully enrolled add-on ${addonId} to partner integration ${idOrSlug}.`)

    hux.styledObject({
      'Add-on ID': enrollResponse.addon_uuid,
      'ISV ID': enrollResponse.isv_guid,
      'ISV Slug': enrollResponse.isv_slug,
    })
  }
}
