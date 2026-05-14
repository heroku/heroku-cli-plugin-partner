import {runCommand} from '@heroku-cli/test-utils'
import {expect} from 'chai'
import nock from 'nock'
import path from 'node:path'
import {fileURLToPath} from 'node:url'

import Cmd from '../../../../src/commands/partner/connect/update.js'

const PARTNER_CONNECT_ACCEPT_HEADER = 'application/vnd.heroku+json; version=3.partner'

const partnerConnectUpdateResponse = {
  contact_email: 'partner@example.com',
  description: 'Updated description',
  docs_url: 'https://example.com/docs',
  id: '3c0b2b51-8431-4ce8-8e5f-b4a76e509b36',
  logo_url: '/path/to/logo.png',
  name: 'Example ISV',
  slug: 'example-isv',
  status: 'active',
  team: {
    id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    name: 'acme-team',
  },
  updated_at: '2021-06-01T00:00:00Z',
}

describe('partner:connect:update', () => {
  let api: nock.Scope
  const {env} = process
  const id = '3c0b2b51-8431-4ce8-8e5f-b4a76e509b36'
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

  it('sends a PATCH request with multipart/form-data', async () => {
    api
      .patch(`/partner/connect/${id}`)
      .matchHeader('accept', PARTNER_CONNECT_ACCEPT_HEADER)
      .matchHeader('content-type', /multipart\/form-data/)
      .reply(200, partnerConnectUpdateResponse)

    const {stderr, stdout} = await runCommand(Cmd, [id])

    expect(stdout).to.contain('Updated partner integration')
    expect(stderr).to.equal('')
  })

  it('returns JSON output with --json flag', async () => {
    api
      .patch(`/partner/connect/${id}`)
      .matchHeader('accept', PARTNER_CONNECT_ACCEPT_HEADER)
      .matchHeader('content-type', /multipart\/form-data/)
      .reply(200, partnerConnectUpdateResponse)

    const {stderr, stdout} = await runCommand(Cmd, [id, '--json'])

    expect(stdout).to.contain(`"id": "${id}"`)
    expect(stdout).to.contain('"description": "Updated description"')
    expect(stderr).to.equal('')
  })

  it('displays styled output for successful update', async () => {
    api
      .patch(`/partner/connect/${id}`)
      .matchHeader('accept', PARTNER_CONNECT_ACCEPT_HEADER)
      .matchHeader('content-type', /multipart\/form-data/)
      .reply(200, partnerConnectUpdateResponse)

    const {stderr, stdout} = await runCommand(Cmd, [id])

    expect(stdout).to.contain('Slug')
    expect(stdout).to.contain(partnerConnectUpdateResponse.slug)
    expect(stdout).to.contain('Partner Integration')
    expect(stdout).to.contain(partnerConnectUpdateResponse.name)
    expect(stdout).to.contain('Description')
    expect(stdout).to.contain(partnerConnectUpdateResponse.description)
    expect(stdout).to.contain('Documentation URL')
    expect(stdout).to.contain(partnerConnectUpdateResponse.docs_url)
    expect(stdout).to.contain('Contact Email')
    expect(stdout).to.contain(partnerConnectUpdateResponse.contact_email)
    expect(stdout).to.contain('Status')
    expect(stdout).to.contain(partnerConnectUpdateResponse.status)
    expect(stdout).to.contain('Updated At')
    expect(stdout).to.contain(partnerConnectUpdateResponse.updated_at)
    expect(stderr).to.equal('')
  })

  it('updates with optional fields', async () => {
    api
      .patch(`/partner/connect/${id}`)
      .matchHeader('accept', PARTNER_CONNECT_ACCEPT_HEADER)
      .matchHeader('content-type', /multipart\/form-data/)
      .reply(200, {
        ...partnerConnectUpdateResponse,
        contact_email: 'partner@example.com',
        description: 'New description',
        docs_url: 'https://example.com/docs',
      })

    const {stderr, stdout} = await runCommand(Cmd, [
      id,
      '--description',
      'New description',
      '--docs-url',
      'https://example.com/docs',
      '--contact-email',
      'partner@example.com',
    ])

    expect(stdout).to.contain('Updated partner integration')
    expect(stdout).to.contain('Description')
    expect(stdout).to.contain('New description')
    expect(stdout).to.contain('Documentation URL')
    expect(stdout).to.contain('https://example.com/docs')
    expect(stdout).to.contain('Contact Email')
    expect(stdout).to.contain('partner@example.com')
    expect(stderr).to.equal('')
  })

  it('uploads logo file when provided', async () => {
    api
      .patch(`/partner/connect/${id}`)
      .matchHeader('accept', PARTNER_CONNECT_ACCEPT_HEADER)
      .matchHeader('content-type', /multipart\/form-data/)
      .reply(200, {
        ...partnerConnectUpdateResponse,
        logo_url: 'https://example.com/logo.png',
      })

    const {stderr, stdout} = await runCommand(Cmd, [id, '--logo-file', logoFixture])

    expect(stdout).to.contain('Updated partner integration')
    expect(stdout).to.contain('Logo URL')
    expect(stdout).to.contain('https://example.com/logo.png')
    expect(stderr).to.equal('')
  })

  it('validates logo file exists', async () => {
    const logoFile = '/tmp/missing-' + Date.now() + '.png'

    const {error} = await runCommand(Cmd, [id, '--logo-file', logoFile])
    expect(error?.message).to.contain("We can't find the logo file")
  })

  it('throws an error when the API returns a 404', async () => {
    api
      .patch(`/partner/connect/${id}`)
      .matchHeader('accept', PARTNER_CONNECT_ACCEPT_HEADER)
      .matchHeader('content-type', /multipart\/form-data/)
      .reply(404, {
        id: 'not_found',
        message: "Couldn't find that integration.",
      })

    const {error} = await runCommand(Cmd, [id])
    expect(error?.message).to.contain("We can't update the partner integration")
  })

  it('throws an error when the API returns a 422', async () => {
    api
      .patch('/partner/connect/1234567890')
      .matchHeader('accept', PARTNER_CONNECT_ACCEPT_HEADER)
      .matchHeader('content-type', /multipart\/form-data/)
      .reply(422, {id: 'invalid_params', message: 'id not a uuid.'})

    const {error} = await runCommand(Cmd, ['1234567890', '--description', 'New description'])
    expect(error?.message).to.contain("We can't update the partner integration")
  })

  it('sends empty FormData when no optional flags provided', async () => {
    api
      .patch(`/partner/connect/${id}`)
      .matchHeader('accept', PARTNER_CONNECT_ACCEPT_HEADER)
      .matchHeader('content-type', /multipart\/form-data/)
      .reply(200, partnerConnectUpdateResponse)

    const {stderr, stdout} = await runCommand(Cmd, [id])

    expect(stdout).to.contain('Updated partner integration')
    expect(stderr).to.equal('')
  })
})
