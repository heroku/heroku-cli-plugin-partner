import {expect} from 'chai'
import nock from 'nock'
import * as sinon from 'sinon'
import {stderr, stdout} from 'stdout-stderr'

import Cmd from '../../../../../src/commands/partner/connect/create'
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

describe('partner:connect:create', () => {
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

  context('when creating partner connect integration', () => {
    it('creates partner connect integration with correct accept header', async () => {
      const slug = 'test-integration'
      const team = 'test-team'
      const isvName = 'Test ISV'
      const description = 'Test description'
      const contactEmail = 'test@example.com'

      api
        .post('/partner/connect', {
          slug,
          team,
          name: isvName,
          description,
          contact_email: contactEmail,
        })
        .matchHeader('accept', PARTNER_CONNECT_ACCEPT_HEADER)
        .reply(201, partnerConnectInfo)

      await runCommand(Cmd, [
        slug,
        '--team',
        team,
        '--isv-name',
        isvName,
        '--description',
        description,
        '--contact-email',
        contactEmail,
      ])

      const output = stripAnsi(stdout.output)
      expect(output).to.contain('Partner integration created')
      expect(output).to.contain(`Slug: ${partnerConnectInfo.slug}`)
      expect(output).to.contain(`Partner Integration: ${partnerConnectInfo.name}`)
      expect(stderr.output).to.equal('')
    })

    it('sends snake_cased request body keys', async () => {
      const slug = 'test-integration'
      const team = 'test-team'
      const isvName = 'Test ISV'
      const contactEmail = 'test@example.com'
      const docsUrl = 'https://docs.example.com'
      const logoFile = 'https://example.com/logo.png'

      api
        .post('/partner/connect', (body: unknown) => {
          const b = body as Record<string, unknown>

          expect(b).to.have.property('slug', slug)
          expect(b).to.have.property('team', team)
          expect(b).to.have.property('name', isvName)

          expect(b).to.have.property('contact_email', contactEmail)
          expect(b).to.have.property('docs_url', docsUrl)
          expect(b).to.have.property('logo_url', logoFile)

          expect(b).to.not.have.property('contactEmail')
          expect(b).to.not.have.property('docsUrl')
          expect(b).to.not.have.property('logoUrl')

          return true
        })
        .matchHeader('accept', PARTNER_CONNECT_ACCEPT_HEADER)
        .reply(201, partnerConnectInfo)

      await runCommand(Cmd, [
        slug,
        '--team',
        team,
        '--isv-name',
        isvName,
        '--contact-email',
        contactEmail,
        '--docs-url',
        docsUrl,
        '--logo-file',
        logoFile,
      ])

      expect(stderr.output).to.equal('')
    })

    it('handles API errors with specific error message', async () => {
      const slug = 'test-integration'
      const team = 'test-team'
      const isvName = 'Test ISV'
      const description = 'Test description'
      const contactEmail = 'test@example.com'

      api
        .post('/partner/connect')
        .matchHeader('accept', PARTNER_CONNECT_ACCEPT_HEADER)
        .reply(400, {
          id: 'bad_request',
          message: 'Integration with this slug already exists',
        })

      try {
        await runCommand(Cmd, [
          slug,
          '--team',
          team,
          '--isv-name',
          isvName,
          '--description',
          description,
          '--contact-email',
          contactEmail,
        ])
        expect.fail('Expected command to throw error')
      } catch (error: unknown) {
        const err = error as Error
        expect(stripAnsi(err.message)).to.contain('Unable to create partner integration')
        expect(stripAnsi(err.message)).to.contain('Integration with this slug already exists')
      }
    })
  })
})
