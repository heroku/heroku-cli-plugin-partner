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

```sh-session
$ heroku plugins:install @heroku-cli/plugin-partner
$ heroku partner:COMMAND
running command...
$ heroku partner --help [COMMAND]
USAGE
  $ heroku partner:COMMAND
...
```

# Commands
<!-- commands -->
* [`heroku partner:connect:info ID`](#heroku-partnerconnectinfo-id)
* [`heroku partner:hello PERSON`](#heroku-partnerhello-person)

## `heroku partner:connect:info ID`

Show Partner Connect integration info

```
USAGE
  $ heroku partner:connect:info ID [--json]

ARGUMENTS
  ID  Partner Connect integration ID

FLAGS
  --json  Output in JSON format

DESCRIPTION
  Show Partner Connect integration info
```

_See code: [src/commands/partner/connect/info/index.ts](https://github.com/heroku/heroku-cli-plugin-partner/blob/v0.0.0/src/commands/partner/connect/info/index.ts)_

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
