import * as color from '@heroku/heroku-cli-util/color'
import {styledJSON, styledObject} from '@heroku/heroku-cli-util/hux'
import {Args, Flags, ux} from '@oclif/core'

import BaseCommand from '../../../lib/base.js'
import * as Partner from '../../../lib/partner/types.js'

export default class PartnerConnectEnroll extends BaseCommand {
  static args = {

    id_or_slug: Args.string({
      description: 'ID or name of the partner integration',
      required: true,
    }),
  }
  static description = 'enroll an existing add-on into a partner integration'
  static examples = ['$ heroku partner:connect:enroll acme-integrations --addon addon-id']
  static flags = {
    addon: Flags.string({
      description: 'ID or name of the add-on to enroll',
      required: true,
    }),
    json: Flags.boolean({description: 'output in JSON format'}),
  }

  async run(): Promise<void> {
    const {args, flags} = await this.parse(PartnerConnectEnroll)
    const {id_or_slug: idOrSlug} = args
    const {addon: addonId} = flags
    ux.stdout(`Enrolling add-on ${color.addon(addonId)} to partner integration ${color.name(idOrSlug)}...`)
    let enrollResponse: Partner.EnrollResponse
    try {
      const endpoint = `/partner/connect/${idOrSlug}/addon/${addonId}/enroll`
      const {body} = await this.apiClient.post<Partner.EnrollResponse>(endpoint, {body: {}})
      enrollResponse = body
    } catch (error) {
      const connErr = error as Partner.ConnectionError
      switch (connErr.body?.id) {
        case 'conflict': {
          this.error(connErr.body?.message || `Add-on ${color.addon(addonId)} is already enrolled with an ISV.`)
          break
        }

        case 'forbidden': {
          this.error(connErr.body?.message || `You're not authorized to enroll the add-on ${color.addon(addonId)}.`)
          break
        }

        case 'not_found': {
          this.error(connErr.body?.message
              || `Add-on ${color.addon(addonId)} doesn't exist. Check the add-on exists and try again, or enroll a different add-on.`)
          break
        }

        default: {
          this.error(`We can't enroll add-on ${color.addon(addonId)} to partner integration ${color.name(idOrSlug)} due to an unexpected error.`)
        }
      }
    }

    if (flags.json) {
      styledJSON(enrollResponse)
      return
    }

    ux.stdout(`✓ Successfully enrolled add-on ${color.addon(enrollResponse.addon_uuid)} to partner integration ${color.name(idOrSlug)}.`)

    styledObject({
      'Add-on ID': enrollResponse.addon_uuid,
      'ISV ID': enrollResponse.isv_guid,
      'ISV Slug': enrollResponse.isv_slug,
    })
  }
}
