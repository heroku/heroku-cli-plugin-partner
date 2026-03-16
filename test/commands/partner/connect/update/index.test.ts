import {expect} from 'chai'
import nock from 'nock'
import * as sinon from 'sinon'
import {stderr, stdout} from 'stdout-stderr'

import Cmd from '../../../../../src/commands/partner/connect/update'
import * as huxWrapper from '../../../../../src/lib/hux-wrapper'
import {runCommand} from '../../../../run-command'

const PARTNER_CONNECT_ACCEPT_HEADER = 'application/vnd.heroku+json; version=3.partner'

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

const partnerConnectUpdateResponse = {
  id: '3c0b2b51-8431-4ce8-8e5f-b4a76e509b36',
  isvName: 'Example ISV',
  description: 'Updated description',
  docsUrl: 'https://example.com/docs',
  contactEmail: 'partner@example.com',
  logoFile: '/path/to/logo.png',
  updatedAt: '2021-06-01T00:00:00Z',
}

describe('partner:connect:update', () => {
  let api: nock.Scope
  let huxStub: sinon.SinonStub
  const {env} = process
  const id = '3c0b2b51-8431-4ce8-8e5f-b4a76e509b36'

  beforeEach(() => {
    process.env = {}
    api = nock('https://api.heroku.com')
    huxStub = sinon.stub(huxWrapper, 'getHux').resolves(mockHux as never)
  })

  afterEach(() => {
    process.env = env
    huxStub.restore()
    api.done()
    nock.cleanAll()
  })

  it('sends a PATCH request with the correct accept header', async () => {
    api
      .patch(`/partner/connect/${id}`)
      .matchHeader('accept', PARTNER_CONNECT_ACCEPT_HEADER)
      .reply(200, partnerConnectUpdateResponse)

    await runCommand(Cmd, [id])

    expect(stdout.output).to.contain('Partner integration created')
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

    expect(stdout.output).to.contain('ISV Name: Example ISV')
    expect(stdout.output).to.contain('Description: Updated description')
    expect(stdout.output).to.contain('Documentation: https://example.com/docs')
    expect(stdout.output).to.contain('Contact Email: partner@example.com')
    expect(stderr.output).to.equal('')
  })

  it('sends optional flags in the request body', async () => {
    const expectedBody = {
      description: 'New description',
      docsUrl: 'https://example.com/docs',
      contactEmail: 'partner@example.com',
      logoFile: '/path/to/logo.png',
    }

    api
      .patch(`/partner/connect/${id}`, expectedBody)
      .matchHeader('accept', PARTNER_CONNECT_ACCEPT_HEADER)
      .reply(200, {
        ...partnerConnectUpdateResponse,
        description: 'New description',
        docsUrl: 'https://example.com/docs',
        contactEmail: 'partner@example.com',
        logoFile: '/path/to/logo.png',
      })

    await runCommand(Cmd, [
      id,
      '--description', 'New description',
      '--docsUrl', 'https://example.com/docs',
      '--contactEmail', 'partner@example.com',
      '--logoFile', '/path/to/logo.png',
    ])

    expect(stdout.output).to.contain('Partner integration created')
    expect(stdout.output).to.contain('ISV Name: Example ISV')
    expect(stdout.output).to.contain('Description: New description')
    expect(stdout.output).to.contain('Documentation: https://example.com/docs')
    expect(stdout.output).to.contain('Contact Email: partner@example.com')
    expect(stdout.output).to.contain('Logo: /path/to/logo.png')
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

    expect(stdout.output).to.contain('Partner integration created')
    expect(stderr.output).to.equal('')
  })
})
