import {expect} from 'chai'
import nock from 'nock'
import {stderr, stdout} from 'stdout-stderr'

import Cmd from '../../../../../src/commands/partner/connect/info/index.js'
import {partnerConnectInfo} from '../../../../helpers/fixtures.js'
import stripAnsi from '../../../../helpers/strip-ansi.js'
import {runCommand} from '../../../../run-command.js'

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

      await runCommand(Cmd, [id, '--json'])

      expect(stdout.output).to.contain(`"id": "${id}"`)
      expect(stderr.output).to.equal('')
    })

    it('displays formatted output without --json flag', async () => {
      const id = '3c0b2b51-8431-4ce8-8e5f-b4a76e509b36'

      api
        .get(`/partner/connect/${id}`)
        .matchHeader('accept', PARTNER_CONNECT_ACCEPT_HEADER)
        .reply(200, partnerConnectInfo)

      await runCommand(Cmd, [id])

      const output = stripAnsi(stdout.output)
      expect(output).to.contain('Slug')
      expect(output).to.contain(partnerConnectInfo.slug)
      expect(output).to.contain('Partner Integration')
      expect(output).to.contain(partnerConnectInfo.name)
      expect(output).to.contain('Status')
      expect(output).to.contain(partnerConnectInfo.status)
      expect(output).to.contain('Created At')
      expect(output).to.contain(partnerConnectInfo.created_at)
      expect(output).to.contain('Updated At')
      expect(output).to.contain(partnerConnectInfo.updated_at)
      expect(output).to.contain('Description')
      expect(output).to.contain(partnerConnectInfo.description)
      expect(output).to.contain('Documentation URL')
      expect(output).to.contain(partnerConnectInfo.docs_url)
      expect(output).to.contain('Logo URL')
      expect(output).to.contain(partnerConnectInfo.logo_url)
      expect(output).to.contain('Contact Email')
      expect(output).to.contain(partnerConnectInfo.contact_email)
      expect(output).to.contain('Team')
      expect(output).to.contain(partnerConnectInfo.team)
      expect(stderr.output).to.equal('')
    })
  })
})
