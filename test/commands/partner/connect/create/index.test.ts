import {expect} from 'chai'
import nock from 'nock'
import * as fs from 'node:fs'
import * as os from 'node:os'
import path from 'node:path'
import {stderr, stdout} from 'stdout-stderr'

import Cmd from '../../../../../src/commands/partner/connect/create/index.js'
import {partnerConnectInfo} from '../../../../helpers/fixtures.js'
import stripAnsi from '../../../../helpers/strip-ansi.js'
import {runCommand} from '../../../../run-command.js'

const PARTNER_CONNECT_ACCEPT_HEADER = 'application/vnd.heroku+json; version=3.partner'

describe('partner:connect:create', () => {
  let api: nock.Scope
  const {env} = process
  let tempFiles: string[] = []

  beforeEach(() => {
    process.env = {}
    api = nock('https://api.heroku.com')
  })

  afterEach(() => {
    process.env = env
    nock.cleanAll()
    // Clean up temp files
    for (const file of tempFiles) {
      try {
        if (fs.existsSync(file)) fs.unlinkSync(file)
      } catch {}
    }

    tempFiles = []
  })

  function createTempFile(name: string, size: number): string {
    const tempDir = os.tmpdir()
    const filePath = path.join(tempDir, name)
    fs.writeFileSync(filePath, Buffer.alloc(size))
    tempFiles.push(filePath)
    return filePath
  }

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
      expect(output).to.contain('Partner integration created')
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
      const logoFile = createTempFile('logo.png', 1024)

      api
        .post('/partner/connect', (body: string) =>
          // Check that body contains logo_image field
          body.includes('logo_image') && body.includes('logo.png'))
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
        logoFile,
      ])

      const output = stripAnsi(stdout.output)
      expect(output).to.contain('Partner integration created')
      expect(output).to.contain('Logo URL')
      expect(stderr.output).to.equal('')
    })

    it('validates logo file size', async () => {
      const slug = 'test-integration'
      const team = 'test-team'
      const isvName = 'Test ISV'
      const logoFile = createTempFile('large-logo.png', 6 * 1024 * 1024) // 6MB

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
        expect(stripAnsi(err.message)).to.contain('Logo file size exceeds 5MB')
      }
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
        expect(stripAnsi(err.message)).to.contain('Logo file not found')
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
        // Axios error format - the message property won't necessarily be in the error message
      }
    })
  })
})
