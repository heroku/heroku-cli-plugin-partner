import {expect} from 'chai'
import nock from 'nock'
import {stderr, stdout} from 'stdout-stderr'

import Cmd from '../../../../../src/commands/partner/connect/deactivate/index.js'
import {deactivateResponse} from '../../../../helpers/fixtures.js'
import stripAnsi from '../../../../helpers/strip-ansi.js'
import {runCommand} from '../../../../run-command.js'

const PARTNER_CONNECT_ACCEPT_HEADER = 'application/vnd.heroku+json; version=3.partner'

describe('partner:connect:deactivate', () => {
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
    
    context('when deactivating partner connect integration', () => {
        it('deactivates partner connect integration with correct accept header', async () => {
            const slug = 'test-integration'
            const team = 'test-team'

            api 
                .delete(`/partner/connect/${slug}`)
                .matchHeader('accept', PARTNER_CONNECT_ACCEPT_HEADER)
                .reply(202, deactivateResponse)

            await runCommand(Cmd, [slug, '--team', team])

            const output = stripAnsi(stdout.output)
            expect(output).to.contain('Partner integration deactivated')
            expect(output).to.contain('Team')
            expect(output).to.contain(team)
            expect(output).to.contain('Integration')
            expect(output).to.contain(slug)
            expect(output).to.contain('Status')
            expect(output).to.contain(deactivateResponse.isv_status)
            expect(stderr.output).to.equal('')
    })

    
    it('shows message when integration is already deactivated', async () => {
        const slug = 'test-integration'
        const team = 'test-team'

        api
            .delete(`/partner/connect/${slug}`)
            .matchHeader('accept', PARTNER_CONNECT_ACCEPT_HEADER)
            .reply(200, {id: 'inactive', message: 'ISV integration is already inactive'})
        
        await runCommand(Cmd, [slug, '--team', team])

        const output = stripAnsi(stdout.output)
        expect(output).to.contain(`Integration already deactivated for ${team}`)
        expect(output).to.contain(team)
        expect(stderr.output).to.equal('')
    })

    it('shows error when integration is not found', async () => {
        const slug = 'test-integration'
        const team = 'test-team'
        api
          .delete(`/partner/connect/${slug}`)
          .matchHeader('accept', PARTNER_CONNECT_ACCEPT_HEADER)
          .reply(404, {id: 'record_not_found', message: 'Record not found'})
        try {
          await runCommand(Cmd, [slug, '--team', team])
          expect.fail('Expected command to throw error')
        } catch (error: unknown) {
          const err = error as Error
          expect(stripAnsi(err.message)).to.contain(`No partner integration found for team ${team}`)
        }
      })


      it('shows error when some add-on deletions fail', async () => {
        const slug = 'nonexistent-integration'
        const team = 'test-team'
        api
          .delete(`/partner/connect/${slug}`)
          .matchHeader('accept', PARTNER_CONNECT_ACCEPT_HEADER)
          .reply(207, {
            isv_guid: '3c0b2b51-8431-4ce8-8e5f-b4a76e509b36',
            isv_status: 'active',
            message: 'ISV integration deactivation failed',
            summary: {total: 2, succeeded: 1, failed: 1},
            responses: [],
          })
        try {
          await runCommand(Cmd, [slug, '--team', team])
          expect.fail('Expected command to throw error')
        } catch (error: unknown) {
          const err = error as Error
          expect(stripAnsi(err.message)).to.contain(`Failed to deactivate partner integration for ${team}`)
        }
      })
    })
    })