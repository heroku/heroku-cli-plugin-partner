import {runCommand} from '@heroku-cli/test-utils'
import {expect} from 'chai'
import nock from 'nock'

import Cmd from '../../../../src/commands/partner/connect/info.js'
import {partnerConnectInfo, partnerConnectInfoWithoutOptionalFields} from '../../../helpers/fixtures.js'

const PARTNER_CONNECT_ACCEPT_HEADER = 'application/vnd.heroku+json; version=3.partner'

describe('partner:connect:info', () => {
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

  context('when requesting partner connect info', () => {
    it('requests partner connect info with correct accept header', async () => {
      const id = '3c0b2b51-8431-4ce8-8e5f-b4a76e509b36'

      api
        .get(`/partner/connect/${id}`)
        .matchHeader('accept', PARTNER_CONNECT_ACCEPT_HEADER)
        .reply(200, partnerConnectInfo)

      const {stderr, stdout} = await runCommand(Cmd, [id, '--json'])

      expect(stdout).to.contain(`"id": "${id}"`)
      expect(stderr).to.equal('')
    })

    it('displays formatted output without --json flag', async () => {
      const id = '3c0b2b51-8431-4ce8-8e5f-b4a76e509b36'

      api
        .get(`/partner/connect/${id}`)
        .matchHeader('accept', PARTNER_CONNECT_ACCEPT_HEADER)
        .reply(200, partnerConnectInfo)

      const {stderr, stdout} = await runCommand(Cmd, [id])

      expect(stdout).to.contain('Slug')
      expect(stdout).to.contain(partnerConnectInfo.slug)
      expect(stdout).to.contain('Partner Integration')
      expect(stdout).to.contain(partnerConnectInfo.name)
      expect(stdout).to.contain('Status')
      expect(stdout).to.contain(partnerConnectInfo.status)
      expect(stdout).to.contain('Created At')
      expect(stdout).to.contain(partnerConnectInfo.created_at)
      expect(stdout).to.contain('Updated At')
      expect(stdout).to.contain(partnerConnectInfo.updated_at)
      expect(stdout).to.contain('Description')
      expect(stdout).to.contain(partnerConnectInfo.description)
      expect(stdout).to.contain('Documentation URL')
      expect(stdout).to.contain(partnerConnectInfo.docs_url)
      expect(stdout).to.contain('Logo URL')
      expect(stdout).to.contain(partnerConnectInfo.logo_url)
      expect(stdout).to.contain('Contact Email')
      expect(stdout).to.contain(partnerConnectInfo.contact_email)
      expect(stdout).to.contain('Team')
      expect(stdout).to.contain(partnerConnectInfo.team.name)
      expect(stderr).to.equal('')
    })

    it('shows a <Default: Heroku> for Logo URL when it\'s not set', async () => {
      const id = '3c0b2b51-8431-4ce8-8e5f-b4a76e509b36'

      api
        .get(`/partner/connect/${id}`)
        .matchHeader('accept', PARTNER_CONNECT_ACCEPT_HEADER)
        .reply(200, partnerConnectInfoWithoutOptionalFields)

      const {stderr, stdout} = await runCommand(Cmd, [id])
      expect(stdout).to.match(/Logo URL:\s+<Default: Heroku>/)
      expect(stderr).to.equal('')
    })

    it('shows a correct error message when partner integration isn\'t found', async () => {
      const id = '3c0b2b51-8431-4ce8-8e5f-b4a76e509b36'

      api
        .get(`/partner/connect/${id}`)
        .matchHeader('accept', PARTNER_CONNECT_ACCEPT_HEADER)
        .reply(404, {id: 'record_not_found', message: 'Record not found'})

      const {error} = await runCommand(Cmd, [id])
      expect(error?.message).to.match(/Partner integration .* doesn't exist/)
    })

    it('shows a default error message when some other error occurs', async () => {
      const id = '3c0b2b51-8431-4ce8-8e5f-b4a76e509b36'

      api
        .get(`/partner/connect/${id}`)
        .matchHeader('accept', PARTNER_CONNECT_ACCEPT_HEADER)
        .reply(500, {id: 'some_other_error', message: 'Some other error'})

      const {error} = await runCommand(Cmd, [id])
      expect(error?.message).to.match(/We can't retrieve partner integration .* details due to an unexpected error/)
    })
  })
})
