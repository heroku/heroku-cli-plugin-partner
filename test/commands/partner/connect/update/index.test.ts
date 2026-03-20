import {expect} from 'chai'
import nock from 'nock'
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

  beforeEach(() => {
    process.env = {}
    api = nock('https://api.heroku.com')
  })

  afterEach(() => {
    process.env = env
    nock.cleanAll()
  })

  it('sends a PATCH request with the correct accept header', async () => {
    api
      .patch(`/partner/connect/${id}`)
      .matchHeader('accept', PARTNER_CONNECT_ACCEPT_HEADER)
      .reply(200, partnerConnectUpdateResponse)

    await runCommand(Cmd, [id])

    expect(stdout.output).to.contain('Partner integration updated')
    expect(stderr.output).to.equal('')
  })

  it('returns JSON output with --json flag', async () => {
    api
      .patch(`/partner/connect/${id}`)
      .matchHeader('accept', PARTNER_CONNECT_ACCEPT_HEADER)
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

  it('sends optional flags in the request body', async () => {
    const expectedBody = {
      description: 'New description',
      docs_url: 'https://example.com/docs',
      contact_email: 'partner@example.com',
      logo_url: '/path/to/logo.png',
    }

    api
      .patch(`/partner/connect/${id}`, expectedBody)
      .matchHeader('accept', PARTNER_CONNECT_ACCEPT_HEADER)
      .reply(200, {
        ...partnerConnectUpdateResponse,
        ...expectedBody,
      })

    await runCommand(Cmd, [
      id,
      '--description', 'New description',
      '--docs-url', 'https://example.com/docs',
      '--contact-email', 'partner@example.com',
      '--logo-file', '/path/to/logo.png',
    ])

    const output = stripAnsi(stdout.output)
    expect(output).to.contain('Partner integration updated')
    expect(output).to.contain('Description')
    expect(output).to.contain('New description')
    expect(output).to.contain('Documentation URL')
    expect(output).to.contain('https://example.com/docs')
    expect(output).to.contain('Contact Email')
    expect(output).to.contain('partner@example.com')
    expect(output).to.contain('Logo URL')
    expect(output).to.contain('/path/to/logo.png')
    expect(stderr.output).to.equal('')
  })

  it('throws an error when the API returns a 404', async () => {
    api
      .patch(`/partner/connect/${id}`)
      .matchHeader('accept', PARTNER_CONNECT_ACCEPT_HEADER)
      .reply(404, {id: 'not_found', message: 'Couldn\'t find that integration.'})

    try {
      await runCommand(Cmd, [id])
      expect.fail('Expected command to throw')
    } catch (error: unknown) {
      expect((error as Error).message).to.contain('Couldn\'t find that integration.')
    }
  })

  it('throws an error when the API returns a 422', async () => {
    api
      .patch(`/partner/connect/1234567890`)
      .matchHeader('accept', PARTNER_CONNECT_ACCEPT_HEADER)
      .reply(422, {id: 'invalid_params', message: 'id not a uuid.'})

    try {
      await runCommand(Cmd, ['1234567890', '--description', 'New description'])
      expect.fail('Expected command to throw')
    } catch (error: unknown) {
      expect((error as Error).message).to.contain('id not a uuid.')
    }
  })

  it('omits unprovided optional flags from the request body', async () => {
    api
      .patch(`/partner/connect/${id}`, {})
      .matchHeader('accept', PARTNER_CONNECT_ACCEPT_HEADER)
      .reply(200, partnerConnectUpdateResponse)

    await runCommand(Cmd, [id])

    expect(stdout.output).to.contain('Partner integration updated')
    expect(stderr.output).to.equal('')
  })
})
