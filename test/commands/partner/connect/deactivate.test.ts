import {runCommand} from '@heroku-cli/test-utils'
import {expect} from 'chai'
import nock from 'nock'

import Cmd from '../../../../src/commands/partner/connect/deactivate.js'
import {deactivateResponse} from '../../../helpers/fixtures.js'

const PARTNER_CONNECT_ACCEPT_HEADER = 'application/vnd.heroku+json; version=3.partner'

describe('partner:connect:deactivate', () => {
  let api: nock.Scope
  const {env} = process

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

      const {stderr, stdout} = await runCommand(Cmd, [idOrSlug, '--confirm', idOrSlug])

      expect(stdout).to.contain('Deactivated partner integration')
      expect(stdout).to.contain('Integration')
      expect(stdout).to.contain(idOrSlug)
      expect(stdout).to.contain('Status')
      expect(stdout).to.contain(deactivateResponse.isv_status)
      expect(stderr).to.equal('')
    })

    it('shows message when integration is already deactivated', async () => {
      const idOrSlug = 'test-integration'

      api.delete(`/partner/connect/${idOrSlug}`).matchHeader('accept', PARTNER_CONNECT_ACCEPT_HEADER).reply(200, {
        id: 'inactive',
        message: 'ISV integration is already inactive',
      })

      const {stderr, stdout} = await runCommand(Cmd, [idOrSlug, '--confirm', idOrSlug])

      expect(stdout).to.contain(`Partner integration ${idOrSlug} is already deactivated.`)
      expect(stdout).to.contain(idOrSlug)
      expect(stderr).to.equal('')
    })

    it('shows error when integration is not found', async () => {
      const idOrSlug = 'test-integration'
      api
        .delete(`/partner/connect/${idOrSlug}`)
        .matchHeader('accept', PARTNER_CONNECT_ACCEPT_HEADER)
        .reply(404, {id: 'record_not_found', message: 'Record not found'})

      const {error} = await runCommand(Cmd, [idOrSlug, '--confirm', idOrSlug])
      expect(error?.message).to.match(/Partner integration .* doesn't exist/)
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
          responses: [],
          summary: {failed: 1, succeeded: 1, total: 2},
        })

      const {error} = await runCommand(Cmd, [idOrSlug, '--confirm', idOrSlug])
      expect(error?.message).to.contain('We can\'t deactivate partner integration')
    })
  })
})
