import {expect} from 'chai'
import {stderr, stdout} from 'stdout-stderr'

import Cmd from '../../../src/commands/partner/hello'
import stripAnsi from '../../helpers/strip-ansi'
import {runCommand} from '../../run-command'

describe('partner:hello', () => {
  it('runs hello command with required arguments', async () => {
    await runCommand(Cmd, ['friend', '--from', 'oclif'])

    expect(stripAnsi(stdout.output)).to.contain('hello friend from oclif!')
    expect(stderr.output).to.equal('')
  })
})
