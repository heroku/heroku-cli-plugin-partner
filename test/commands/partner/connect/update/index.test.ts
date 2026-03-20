import {expect} from 'chai'
import nock from 'nock'
import * as fs from 'node:fs'
import * as os from 'node:os'
import path from 'node:path'
import {stderr, stdout} from 'stdout-stderr'

import Cmd from '../../../../../src/commands/partner/connect/update/index.js'
import stripAnsi from '../../../../helpers/strip-ansi.js'
import {runCommand} from '../../../../run-command.js'

const PARTNER_CONNECT_ACCEPT_HEADER = 'application/vnd.heroku+json; version=3.partner'

const partnerConnectUpdateResponse = {
  id: '3c0b2b51-8431-4ce8-8e5f-b4a76e509b36',
  name: 'Example ISV',
  slug: 'example-isv',
  description: 'Updated description',
  docs_url: 'https://example.com/docs',
  contact_email: 'partner@example.com',
  logo_url: '/path/to/logo.png',
  status: 'active',
  team: 'acme-team',
  updated_at: '2021-06-01T00:00:00Z',
}

describe('partner:connect:update', () => {
  let api: nock.Scope
  const {env} = process
  const id = '3c0b2b51-8431-4ce8-8e5f-b4a76e509b36'
  let tempFiles: string[] = []

  beforeEach(() => {
    process.env = {}
    api = nock('https://api.heroku.com')
  })

  afterEach(() => {
    process.env = env
    nock.cleanAll()
    // Clean up temp files and directories
    for (const file of tempFiles) {
      try {
        if (fs.existsSync(file)) {
          fs.unlinkSync(file)
          // Remove parent directory
          const dir = path.dirname(file)
          if (fs.existsSync(dir)) fs.rmdirSync(dir)
        }
      } catch {}
    }

    tempFiles = []
  })

  function createTempFile(name: string, size: number): string {
    const tmpDir = os.tmpdir() || process.env.TEMP || process.env.TMP || process.cwd()
    const tempDir = fs.mkdtempSync(path.join(tmpDir, 'partner-test-'))
    const filePath = path.join(tempDir, name)
    fs.writeFileSync(filePath, Buffer.alloc(size))
    tempFiles.push(filePath)
    return filePath
  }

  it('sends a PATCH request with multipart/form-data', async () => {
    api
      .patch(`/partner/connect/${id}`)
      .matchHeader('accept', PARTNER_CONNECT_ACCEPT_HEADER)
      .matchHeader('content-type', /multipart\/form-data/)
      .reply(200, partnerConnectUpdateResponse)

    await runCommand(Cmd, [id])

    expect(stdout.output).to.contain('Partner integration updated')
    expect(stderr.output).to.equal('')
  })

  it('returns JSON output with --json flag', async () => {
    api
      .patch(`/partner/connect/${id}`)
      .matchHeader('accept', PARTNER_CONNECT_ACCEPT_HEADER)
      .matchHeader('content-type', /multipart\/form-data/)
      .reply(200, partnerConnectUpdateResponse)

    await runCommand(Cmd, [id, '--json'])

    expect(stdout.output).to.contain(`"id": "${id}"`)
    expect(stdout.output).to.contain('"description": "Updated description"')
    expect(stderr.output).to.equal('')
  })

  it('displays styled output for successful update', async () => {
    api
      .patch(`/partner/connect/${id}`)
      .matchHeader('accept', PARTNER_CONNECT_ACCEPT_HEADER)
      .matchHeader('content-type', /multipart\/form-data/)
      .reply(200, partnerConnectUpdateResponse)

    await runCommand(Cmd, [id])

    const output = stripAnsi(stdout.output)
    expect(output).to.contain('Slug')
    expect(output).to.contain(partnerConnectUpdateResponse.slug)
    expect(output).to.contain('Partner Integration')
    expect(output).to.contain(partnerConnectUpdateResponse.name)
    expect(output).to.contain('Description')
    expect(output).to.contain(partnerConnectUpdateResponse.description)
    expect(output).to.contain('Documentation URL')
    expect(output).to.contain(partnerConnectUpdateResponse.docs_url)
    expect(output).to.contain('Contact Email')
    expect(output).to.contain(partnerConnectUpdateResponse.contact_email)
    expect(output).to.contain('Status')
    expect(output).to.contain(partnerConnectUpdateResponse.status)
    expect(output).to.contain('Updated At')
    expect(output).to.contain(partnerConnectUpdateResponse.updated_at)
    expect(stderr.output).to.equal('')
  })

  it('updates with optional fields', async () => {
    api
      .patch(`/partner/connect/${id}`)
      .matchHeader('accept', PARTNER_CONNECT_ACCEPT_HEADER)
      .matchHeader('content-type', /multipart\/form-data/)
      .reply(200, {
        ...partnerConnectUpdateResponse,
        description: 'New description',
        docs_url: 'https://example.com/docs',
        contact_email: 'partner@example.com',
      })

    await runCommand(Cmd, [
      id,
      '--description', 'New description',
      '--docs-url', 'https://example.com/docs',
      '--contact-email', 'partner@example.com',
    ])

    const output = stripAnsi(stdout.output)
    expect(output).to.contain('Partner integration updated')
    expect(output).to.contain('Description')
    expect(output).to.contain('New description')
    expect(output).to.contain('Documentation URL')
    expect(output).to.contain('https://example.com/docs')
    expect(output).to.contain('Contact Email')
    expect(output).to.contain('partner@example.com')
    expect(stderr.output).to.equal('')
  })

  it('uploads logo file when provided', async () => {
    const logoFile = createTempFile('new-logo.png', 2048)

    api
      .patch(`/partner/connect/${id}`, (body: string) =>
        // Check that body contains logo_image field
        body.includes('logo_image') && body.includes('new-logo.png'))
      .matchHeader('accept', PARTNER_CONNECT_ACCEPT_HEADER)
      .matchHeader('content-type', /multipart\/form-data/)
      .reply(200, {
        ...partnerConnectUpdateResponse,
        logo_url: 'https://example.com/new-logo.png',
      })

    await runCommand(Cmd, [id, '--logo-file', logoFile])

    const output = stripAnsi(stdout.output)
    expect(output).to.contain('Partner integration updated')
    expect(output).to.contain('Logo URL')
    expect(output).to.contain('https://example.com/new-logo.png')
    expect(stderr.output).to.equal('')
  })

  it('validates logo file size', async () => {
    const logoFile = createTempFile('large-logo.png', 7 * 1024 * 1024) // 7MB

    try {
      await runCommand(Cmd, [id, '--logo-file', logoFile])
      expect.fail('Expected command to throw error')
    } catch (error: unknown) {
      const err = error as Error
      expect(stripAnsi(err.message)).to.contain('Logo file size exceeds 5MB')
    }
  })

  it('validates logo file exists', async () => {
    const logoFile = '/tmp/missing-' + Date.now() + '.png'

    try {
      await runCommand(Cmd, [id, '--logo-file', logoFile])
      expect.fail('Expected command to throw error')
    } catch (error: unknown) {
      const err = error as Error
      expect(stripAnsi(err.message)).to.contain('Logo file not found')
    }
  })

  it('throws an error when the API returns a 404', async () => {
    api
      .patch(`/partner/connect/${id}`)
      .matchHeader('accept', PARTNER_CONNECT_ACCEPT_HEADER)
      .matchHeader('content-type', /multipart\/form-data/)
      .reply(404, {id: 'not_found', message: 'Couldn\'t find that integration.'})

    try {
      await runCommand(Cmd, [id])
      expect.fail('Expected command to throw')
    } catch (error: unknown) {
      const err = error as Error
      expect(stripAnsi(err.message)).to.contain('Unable to update partner integration')
    }
  })

  it('throws an error when the API returns a 422', async () => {
    api
      .patch(`/partner/connect/1234567890`)
      .matchHeader('accept', PARTNER_CONNECT_ACCEPT_HEADER)
      .matchHeader('content-type', /multipart\/form-data/)
      .reply(422, {id: 'invalid_params', message: 'id not a uuid.'})

    try {
      await runCommand(Cmd, ['1234567890', '--description', 'New description'])
      expect.fail('Expected command to throw')
    } catch (error: unknown) {
      const err = error as Error
      expect(stripAnsi(err.message)).to.contain('Unable to update partner integration')
    }
  })

  it('sends empty FormData when no optional flags provided', async () => {
    api
      .patch(`/partner/connect/${id}`)
      .matchHeader('accept', PARTNER_CONNECT_ACCEPT_HEADER)
      .matchHeader('content-type', /multipart\/form-data/)
      .reply(200, partnerConnectUpdateResponse)

    await runCommand(Cmd, [id])

    expect(stdout.output).to.contain('Partner integration updated')
    expect(stderr.output).to.equal('')
  })
})
