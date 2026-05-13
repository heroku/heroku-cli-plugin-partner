import { expect } from 'chai'
import nock from 'nock'
import { stderr, stdout } from 'stdout-stderr'

import Cmd from '../../../../../src/commands/partner/connect/deactivate/index.js'
import { deactivateResponse } from '../../../../helpers/fixtures.js'
import stripAnsi from '../../../../helpers/strip-ansi.js'
import { runCommand } from '../../../../run-command.js'

const PARTNER_CONNECT_ACCEPT_HEADER = 'application/vnd.heroku+json; version=3.partner'

describe('partner:connect:deactivate', () => {
  let api: nock.Scope
  const { env } = process

  beforeEach(() => {
    process.env = {}
    api = nock('https://api.heroku.com')
  })

  afterEach(() => {
    process.env = env
    nock.cleanAll()
  })

  context('when deactivating partner connect integration', () => {
    it('deactivates partner connect integration with correct accept header', async () => {
      const idOrSlug = 'test-integration'

      api
        .delete(`/partner/connect/${idOrSlug}`)
        .matchHeader('accept', PARTNER_CONNECT_ACCEPT_HEADER)
        .reply(202, deactivateResponse)

      await runCommand(Cmd, [idOrSlug, '--confirm', idOrSlug])

      const output = stripAnsi(stdout.output)
      expect(output).to.contain('Deactivated partner integration')
      expect(output).to.contain('Integration')
      expect(output).to.contain(idOrSlug)
      expect(output).to.contain('Status')
      expect(output).to.contain(deactivateResponse.isv_status)
      expect(stderr.output).to.equal('')
    })

    it('shows message when integration is already deactivated', async () => {
      const idOrSlug = 'test-integration'

      api.delete(`/partner/connect/${idOrSlug}`).matchHeader('accept', PARTNER_CONNECT_ACCEPT_HEADER).reply(200, {
        id: 'inactive',
        message: 'ISV integration is already inactive',
      })

      await runCommand(Cmd, [idOrSlug, '--confirm', idOrSlug])

      const output = stripAnsi(stdout.output)
      expect(output).to.contain(`Partner integration ${idOrSlug} is already deactivated.`)
      expect(output).to.contain(idOrSlug)
      expect(stderr.output).to.equal('')
    })

    it('shows error when integration is not found', async () => {
      const idOrSlug = 'test-integration'
      api
        .delete(`/partner/connect/${idOrSlug}`)
        .matchHeader('accept', PARTNER_CONNECT_ACCEPT_HEADER)
        .reply(404, { id: 'record_not_found', message: 'Record not found' })
      try {
        await runCommand(Cmd, [idOrSlug, '--confirm', idOrSlug])
        expect.fail('Expected command to throw error')
      } catch (error: unknown) {
        const err = error as Error
        expect(stripAnsi(err.message)).to.contain(`Partner integration ${idOrSlug} doesn't exist.`)
      }
    })

    it('shows error when some add-on deletions fail', async () => {
      const idOrSlug = 'nonexistent-integration'
      api
        .delete(`/partner/connect/${idOrSlug}`)
        .matchHeader('accept', PARTNER_CONNECT_ACCEPT_HEADER)
        .reply(207, {
          isv_guid: '3c0b2b51-8431-4ce8-8e5f-b4a76e509b36',
          isv_status: 'active',
          message: 'ISV integration deactivation failed',
          summary: { total: 2, succeeded: 1, failed: 1 },
          responses: [],
        })
      try {
        await runCommand(Cmd, [idOrSlug, '--confirm', idOrSlug])
        expect.fail('Expected command to throw error')
      } catch (error: unknown) {
        const err = error as Error
        expect(stripAnsi(err.message)).to.contain(`We can't deactivate partner integration ${idOrSlug}`)
      }
    })
  })
})
