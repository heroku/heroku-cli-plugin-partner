import {Command as HerokuCommand} from '@heroku-cli/command'
import {Config, Command as OclifCommand} from '@oclif/core'
import {createRequire} from 'node:module'
import {stderr, stdout} from 'stdout-stderr'

const require = createRequire(import.meta.url)

type CmdConstructorParams = [string[], Config]
export type GenericCmd = new (..._args: CmdConstructorParams) => HerokuCommand | OclifCommand

const stopMock = () => {
  stdout.stop()
  stderr.stop()
}

const getConfig = async () => {
  const pjsonPath = require.resolve('../package.json')
  const conf = new Config({root: pjsonPath})
  await conf.load()
  return conf
}

export const runCommand = async (Cmd: GenericCmd, args: string[] = [], printStd = false) => {
  const conf = await getConfig()
  const instance = new Cmd(args, conf)
  if (printStd) {
    stdout.print = true
    stderr.print = true
  } else {
    stdout.print = false
    stderr.print = false
  }

  stdout.start()
  stderr.start()

  return instance
    .run()
    .then(args => {
      stopMock()
      return args
    })
    .catch(error => {
      stopMock()
      throw error
    })
}
