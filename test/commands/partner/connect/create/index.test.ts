import {expect} from 'chai'
import nock from 'nock'
import path from 'node:path'
import {fileURLToPath} from 'node:url'
import {stderr, stdout} from 'stdout-stderr'

import Cmd from '../../../../../src/commands/partner/connect/create/index.js'
import {partnerConnectInfo} from '../../../../helpers/fixtures.js'
import stripAnsi from '../../../../helpers/strip-ansi.js'
import {runCommand} from '../../../../run-command.js'

const PARTNER_CONNECT_ACCEPT_HEADER = 'application/vnd.heroku+json; version=3.partner'

describe('partner:connect:create', () => {
  let api: nock.Scope
  const {env} = process
  const testDir = path.dirname(fileURLToPath(import.meta.url))
  const logoFixture = path.join(testDir, '../../../../fixtures/logo.png')

  beforeEach(() => {
    process.env = {}
    api = nock('https://api.heroku.com')
  })

  afterEach(() => {
    process.env = env
    nock.cleanAll()
  })

  context('when creating partner connect integration', () => {
    it('creates partner connect integration with multipart/form-data', async () => {
      const slug = 'test-integration'
      const team = 'test-team'
      const isvName = 'Test ISV'
      const description = 'Test description'
      const contactEmail = 'test@example.com'

      api
        .post('/partner/connect')
        .matchHeader('accept', PARTNER_CONNECT_ACCEPT_HEADER)
        .matchHeader('content-type', /multipart\/form-data/)
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
      expect(output).to.contain(`Created partner integration ${partnerConnectInfo.slug}.`)
      expect(output).to.contain('Slug')
      expect(output).to.contain(partnerConnectInfo.slug)
      expect(output).to.contain('Partner Integration')
      expect(output).to.contain(partnerConnectInfo.name)
      expect(stderr.output).to.equal('')
    })

    it('uploads logo file when provided', async () => {
      const slug = 'test-integration'
      const team = 'test-team'
      const isvName = 'Test ISV'

      api
        .post('/partner/connect')
        .matchHeader('accept', PARTNER_CONNECT_ACCEPT_HEADER)
        .matchHeader('content-type', /multipart\/form-data/)
        .reply(201, {...partnerConnectInfo, logo_url: 'https://example.com/logo.png'})

      await runCommand(Cmd, [
        slug,
        '--team',
        team,
        '--isv-name',
        isvName,
        '--logo-file',
        logoFixture,
      ])

      const output = stripAnsi(stdout.output)
      expect(output).to.contain(`Created partner integration ${partnerConnectInfo.slug}.`)
      expect(output).to.contain('Logo URL')
      expect(stderr.output).to.equal('')
    })

    it('validates logo file exists', async () => {
      const slug = 'test-integration'
      const team = 'test-team'
      const isvName = 'Test ISV'
      const logoFile = '/tmp/nonexistent-' + Date.now() + '.png'

      try {
        await runCommand(Cmd, [
          slug,
          '--team',
          team,
          '--isv-name',
          isvName,
          '--logo-file',
          logoFile,
        ])
        expect.fail('Expected command to throw error')
      } catch (error: unknown) {
        const err = error as Error
        expect(stripAnsi(err.message)).to.contain("We can't find the logo file")
      }
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
        .matchHeader('content-type', /multipart\/form-data/)
        .reply(400, {
          id: 'validation_error',
          message: 'Validation failed',
          errors: {
            slug: ['ISV with this slug already exists.'],
          },
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
        expect(stripAnsi(err.message)).to.contain("We can't create the partner integration because")
        expect(stripAnsi(err.message)).to.contain('Validation failed')
        expect(stripAnsi(err.message)).to.contain('slug: ISV with this slug already exists.')
      }
    })
  })
})
