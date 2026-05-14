import {runCommand} from '@heroku-cli/test-utils'
import {expect} from 'chai'
import nock from 'nock'
import path from 'node:path'
import {fileURLToPath} from 'node:url'

import Cmd from '../../../../src/commands/partner/connect/create.js'
import {partnerConnectInfo} from '../../../helpers/fixtures.js'

const PARTNER_CONNECT_ACCEPT_HEADER = 'application/vnd.heroku+json; version=3.partner'

describe('partner:connect:create', () => {
  let api: nock.Scope
  const {env} = process
  const testDir = path.dirname(fileURLToPath(import.meta.url))
  const logoFixture = path.join(testDir, '../../../fixtures/logo.png')

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

      const {stderr, stdout} = await runCommand(Cmd, [
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

      expect(stdout).to.contain('Created partner integration')
      expect(stdout).to.contain('Slug')
      expect(stdout).to.contain(partnerConnectInfo.slug)
      expect(stdout).to.contain('Partner Integration')
      expect(stdout).to.contain(partnerConnectInfo.name)
      expect(stderr).to.equal('')
    })

    it('uploads logo file when provided', async () => {
      const slug = 'test-integration'
      const team = 'test-team'
      const isvName = 'Test ISV'

      api
        .post('/partner/connect')
        .matchHeader('accept', PARTNER_CONNECT_ACCEPT_HEADER)
        .matchHeader('content-type', /multipart\/form-data/)
        .reply(201, {
          ...partnerConnectInfo,
          logo_url: 'https://example.com/logo.png',
        })

      const {stderr, stdout} = await runCommand(Cmd, [slug, '--team', team, '--isv-name', isvName, '--logo-file', logoFixture])

      expect(stdout).to.contain('Created partner integration')
      expect(stdout).to.contain('Logo URL')
      expect(stderr).to.equal('')
    })

    it('validates logo file exists', async () => {
      const slug = 'test-integration'
      const team = 'test-team'
      const isvName = 'Test ISV'
      const logoFile = '/tmp/nonexistent-' + Date.now() + '.png'

      const {error} = await runCommand(Cmd, [slug, '--team', team, '--isv-name', isvName, '--logo-file', logoFile], undefined, {print: true})
      expect(error?.message).to.contain("We can't find the logo file")
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
          errors: {
            slug: ['ISV with this slug already exists.'],
          },
          id: 'validation_error',
          message: 'Validation failed',
        })

      const {error} = await runCommand(Cmd, [
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
      expect(error?.message).to.contain("We can't create the partner integration")
      expect(error?.message).to.contain('Validation failed')
      expect(error?.message).to.contain('slug: ISV with this slug already exists.')
    })
  })
})
