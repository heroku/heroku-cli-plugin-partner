import {expect} from 'chai'
import nock from 'nock'
import * as sinon from 'sinon'
import {stderr, stdout} from 'stdout-stderr'

import Cmd from '../../../../../src/commands/partner/connect/info'
import * as huxWrapper from '../../../../../src/lib/hux-wrapper'
import {partnerConnectInfo} from '../../../../helpers/fixtures'
import stripAnsi from '../../../../helpers/strip-ansi'
import {runCommand} from '../../../../run-command'

const PARTNER_CONNECT_ACCEPT_HEADER = 'application/vnd.heroku+json; version=3.partner'

// Mock hux functions
const mockHux = {
  styledJSON(obj: unknown) {
    console.log(JSON.stringify(obj, null, 2))
  },
  styledObject(obj: Record<string, unknown>) {
    for (const [key, value] of Object.entries(obj)) {
      if (value) {
        console.log(`${key}: ${value}`)
      }
    }
  },
}

describe('partner:connect:info', () => {
  let api: nock.Scope
  let huxStub: sinon.SinonStub
  const {env} = process

  beforeEach(() => {
    process.env = {}
    api = nock('https://api.heroku.com')
    huxStub = sinon.stub(huxWrapper, 'getHux').resolves(mockHux as never)
  })

  afterEach(() => {
    process.env = env
    huxStub.restore()
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
      expect(output).to.contain('Partner Integration')
      expect(output).to.contain('example')
      expect(output).to.contain('Status')
      expect(output).to.contain('active')
      expect(stderr.output).to.equal('')
    })
  })
})
