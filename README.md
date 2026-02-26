heroku-cli-plugin-partner
=================

CLI for Heroku Partner/ISV Integrations


[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/heroku-cli-plugin-partner.svg)](https://npmjs.org/package/heroku-cli-plugin-partner)
[![Downloads/week](https://img.shields.io/npm/dw/heroku-cli-plugin-partner.svg)](https://npmjs.org/package/heroku-cli-plugin-partner)


<!-- toc -->
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->
# Usage
<!-- usage -->
```sh-session
$ npm install -g heroku-cli-plugin-partner
$ heroku COMMAND
running command...
$ heroku (--version)
heroku-cli-plugin-partner/0.0.0 darwin-arm64 node-v22.17.1
$ heroku --help [COMMAND]
USAGE
  $ heroku COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`heroku partner:hello PERSON`](#heroku-partnerhello-person)

## `heroku partner:hello PERSON`

Say hello

```
USAGE
  $ heroku partner:hello PERSON -f <value>

ARGUMENTS
  PERSON  Person to say hello to

FLAGS
  -f, --from=<value>  (required) Who is saying hello

DESCRIPTION
  Say hello

EXAMPLES
  $ heroku partner:hello friend --from oclif
  hello friend from oclif! (./src/commands/hello/index.ts)
```

_See code: [src/commands/partner/hello/index.ts](https://github.com/heroku/heroku-cli-plugin-partner/blob/v0.0.0/src/commands/partner/hello/index.ts)_
<!-- commandsstop -->
