import { expect } from 'chai'
import nock from 'nock'
import { stderr, stdout } from 'stdout-stderr'

import Cmd from '../../../../../src/commands/partner/connect/enroll/index.js'
import { enrollResponse } from '../../../../helpers/fixtures.js'
import stripAnsi from '../../../../helpers/strip-ansi.js'
import { runCommand } from '../../../../run-command.js'

const PARTNER_CONNECT_ACCEPT_HEADER = 'application/vnd.heroku+json; version=3.partner'

describe('partner:connect:enroll', () => {
  let api: nock.Scope
  const { env } = process
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

      await runCommand(Cmd, [idOrSlug, '--addon', addonId, '--json'])

      expect(stdout.output).to.contain(`"addon_uuid": "${enrollResponse.addon_uuid}"`)
      expect(stdout.output).to.contain(`"isv_guid": "${enrollResponse.isv_guid}"`)
      expect(stdout.output).to.contain(`"isv_slug": "${enrollResponse.isv_slug}"`)
      expect(stderr.output).to.equal('')
    })

    it('enrolls add-on and displays formatted output without --json flag', async () => {
      api
        .post(`/partner/connect/${idOrSlug}/addon/${addonId}/enroll`)
        .matchHeader('accept', PARTNER_CONNECT_ACCEPT_HEADER)
        .reply(200, enrollResponse)
      await runCommand(Cmd, [idOrSlug, '--addon', addonId])
      const output = stripAnsi(stdout.output)
      expect(output).to.contain('Successfully enrolled add-on')
      expect(output).to.contain('Add-on ID')
      expect(output).to.contain(enrollResponse.addon_uuid)
      expect(output).to.contain('ISV ID')
      expect(output).to.contain(enrollResponse.isv_guid)
      expect(output).to.contain('ISV Slug')
      expect(output).to.contain(enrollResponse.isv_slug)
      expect(stderr.output).to.equal('')
    })
  })

  context('when enrolling an add-on fails', () => {
    it('shows error when add-on is not found', async () => {
      api
        .post(`/partner/connect/${idOrSlug}/addon/${addonId}/enroll`)
        .matchHeader('accept', PARTNER_CONNECT_ACCEPT_HEADER)
        .reply(404, {
          id: 'not_found',
          message: `Add-on with UUID '${addonId}' not found`,
        })
      try {
        await runCommand(Cmd, [idOrSlug, '--addon', addonId])
        expect.fail('Expected command to throw error')
      } catch (error: unknown) {
        const err = error as Error
        expect(stripAnsi(err.message)).to.contain(`Add-on with UUID '${addonId}' not found`)
      }
    })
    it('shows error when add-on is already enrolled', async () => {
      api
        .post(`/partner/connect/${idOrSlug}/addon/${addonId}/enroll`)
        .matchHeader('accept', PARTNER_CONNECT_ACCEPT_HEADER)
        .reply(409, {
          id: 'conflict',
          message: 'Add-on is already associated with an ISV',
        })
      try {
        await runCommand(Cmd, [idOrSlug, '--addon', addonId])
        expect.fail('Expected command to throw error')
      } catch (error: unknown) {
        const err = error as Error
        expect(stripAnsi(err.message)).to.contain('Add-on is already associated with an ISV')
      }
    })
    it('shows error when not authorized to enroll add-on', async () => {
      api
        .post(`/partner/connect/${idOrSlug}/addon/${addonId}/enroll`)
        .matchHeader('accept', PARTNER_CONNECT_ACCEPT_HEADER)
        .reply(403, {
          id: 'forbidden',
          message: "Add-on's app does not belong to the ISV's team",
        })
      try {
        await runCommand(Cmd, [idOrSlug, '--addon', addonId])
        expect.fail('Expected command to throw error')
      } catch (error: unknown) {
        const err = error as Error
        expect(stripAnsi(err.message)).to.contain("Add-on's app does not belong to the ISV's team")
      }
    })
    it('shows error when an internal server error occurs', async () => {
      api
        .post(`/partner/connect/${idOrSlug}/addon/${addonId}/enroll`)
        .matchHeader('accept', PARTNER_CONNECT_ACCEPT_HEADER)
        .reply(500, {
          id: 'internal_error',
          message: 'Failed to enroll add-on in Connect cell',
        })
      try {
        await runCommand(Cmd, [idOrSlug, '--addon', addonId])
        expect.fail('Expected command to throw error')
      } catch (error: unknown) {
        const err = error as Error
        expect(stripAnsi(err.message)).to.contain(
          `We can't enroll add-on ${addonId} to partner integration ${idOrSlug}`
        )
      }
    })
  })
})
