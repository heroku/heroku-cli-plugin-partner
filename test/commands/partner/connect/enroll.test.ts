import {runCommand} from '@heroku-cli/test-utils'
import {expect} from 'chai'
import nock from 'nock'

import Cmd from '../../../../src/commands/partner/connect/enroll.js'
import {enrollResponse} from '../../../helpers/fixtures.js'

const PARTNER_CONNECT_ACCEPT_HEADER = 'application/vnd.heroku+json; version=3.partner'

describe('partner:connect:enroll', () => {
  let api: nock.Scope
  const {env} = process
  const idOrSlug = 'acme-integrations'
  const addonId = '01234567-89ab-cdef-0123-456789abcdef'

  beforeEach(() => {
    process.env = {}
    api = nock('https://api.heroku.com')
  })

  afterEach(() => {
    process.env = env
    nock.cleanAll()
  })

  context('when enrolling an add-on successfully', () => {
    it('enrolls add-on and displays JSON output with --json flag', async () => {
      api
        .post(`/partner/connect/${idOrSlug}/addon/${addonId}/enroll`)
        .matchHeader('accept', PARTNER_CONNECT_ACCEPT_HEADER)
        .reply(200, enrollResponse)

      const {stderr, stdout} = await runCommand(Cmd, [idOrSlug, '--addon', addonId, '--json'])

      expect(stdout).to.contain(`"addon_uuid": "${enrollResponse.addon_uuid}"`)
      expect(stdout).to.contain(`"isv_guid": "${enrollResponse.isv_guid}"`)
      expect(stdout).to.contain(`"isv_slug": "${enrollResponse.isv_slug}"`)
      expect(stderr).to.equal('')
    })

    it('enrolls add-on and displays formatted output without --json flag', async () => {
      api
        .post(`/partner/connect/${idOrSlug}/addon/${addonId}/enroll`)
        .matchHeader('accept', PARTNER_CONNECT_ACCEPT_HEADER)
        .reply(200, enrollResponse)
      const {stderr, stdout} = await runCommand(Cmd, [idOrSlug, '--addon', addonId])
      expect(stdout).to.contain('Successfully enrolled add-on')
      expect(stdout).to.contain('Add-on ID')
      expect(stdout).to.contain(enrollResponse.addon_uuid)
      expect(stdout).to.contain('ISV ID')
      expect(stdout).to.contain(enrollResponse.isv_guid)
      expect(stdout).to.contain('ISV Slug')
      expect(stdout).to.contain(enrollResponse.isv_slug)
      expect(stderr).to.equal('')
    })
  })

  context('when enrolling an add-on fails', () => {
    it('shows API error message when add-on is not found, if present', async () => {
      api
        .post(`/partner/connect/${idOrSlug}/addon/${addonId}/enroll`)
        .matchHeader('accept', PARTNER_CONNECT_ACCEPT_HEADER)
        .reply(404, {
          id: 'not_found',
          message: `Add-on with UUID '${addonId}' not found`,
        })

      const {error} = await runCommand(Cmd, [idOrSlug, '--addon', addonId])
      expect(error?.message).to.contain(`Add-on with UUID '${addonId}' not found`)
    })

    it('shows default error message when add-on is not found, if API error message is not present', async () => {
      api
        .post(`/partner/connect/${idOrSlug}/addon/${addonId}/enroll`)
        .matchHeader('accept', PARTNER_CONNECT_ACCEPT_HEADER)
        .reply(404, {
          id: 'not_found',
        })

      const {error} = await runCommand(Cmd, [idOrSlug, '--addon', addonId])
      expect(error?.message).to.match(/Add-on .* doesn't exist. Check the add-on exists and try again, or enroll a different add-on/)
    })

    it('shows API error message when add-on is already enrolled, if present', async () => {
      api
        .post(`/partner/connect/${idOrSlug}/addon/${addonId}/enroll`)
        .matchHeader('accept', PARTNER_CONNECT_ACCEPT_HEADER)
        .reply(409, {
          id: 'conflict',
          message: 'Add-on is already enrolled with an ISV',
        })

      const {error} = await runCommand(Cmd, [idOrSlug, '--addon', addonId])
      expect(error?.message).to.contain('Add-on is already enrolled with an ISV')
    })

    it('shows default error message when add-on is already enrolled, if API error message is not present', async () => {
      api
        .post(`/partner/connect/${idOrSlug}/addon/${addonId}/enroll`)
        .matchHeader('accept', PARTNER_CONNECT_ACCEPT_HEADER)
        .reply(409, {
          id: 'conflict',
        })

      const {error} = await runCommand(Cmd, [idOrSlug, '--addon', addonId])
      expect(error?.message).to.match(/Add-on .* is already enrolled with an ISV/)
    })

    it('shows API error message when not authorized to enroll add-on, if present', async () => {
      api
        .post(`/partner/connect/${idOrSlug}/addon/${addonId}/enroll`)
        .matchHeader('accept', PARTNER_CONNECT_ACCEPT_HEADER)
        .reply(403, {
          id: 'forbidden',
          message: "Add-on's app does not belong to the ISV's team",
        })

      const {error} = await runCommand(Cmd, [idOrSlug, '--addon', addonId])
      expect(error?.message).to.contain("Add-on's app does not belong to the ISV's team")
    })

    it('shows default error message when not authorized to enroll add-on, if API error message is not present', async () => {
      api
        .post(`/partner/connect/${idOrSlug}/addon/${addonId}/enroll`)
        .matchHeader('accept', PARTNER_CONNECT_ACCEPT_HEADER)
        .reply(403, {
          id: 'forbidden',
        })

      const {error} = await runCommand(Cmd, [idOrSlug, '--addon', addonId])
      expect(error?.message).to.contain('You\'re not authorized to enroll the add-on')
    })

    it('shows error when an internal server error occurs', async () => {
      api
        .post(`/partner/connect/${idOrSlug}/addon/${addonId}/enroll`)
        .matchHeader('accept', PARTNER_CONNECT_ACCEPT_HEADER)
        .reply(500, {
          id: 'internal_error',
          message: 'Failed to enroll add-on in Connect cell',
        })

      const {error} = await runCommand(Cmd, [idOrSlug, '--addon', addonId])
      expect(error?.message).to.match(/We can't enroll add-on .* to partner integration/)
    })
  })
})
