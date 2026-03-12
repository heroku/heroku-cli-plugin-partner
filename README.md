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
* [`heroku partner:connect:info ID_OR_SLUG`](#heroku-partnerconnectinfo-id_or_slug)

## `heroku partner:connect:info ID_OR_SLUG`

display all metadata fields for a Heroku Connect partner integration

```
USAGE
  $ heroku partner:connect:info ID_OR_SLUG [--json]

ARGUMENTS
  ID_OR_SLUG  Partner Connect integration ID or slug

FLAGS
  --json  output in JSON format

DESCRIPTION
  display all metadata fields for a Heroku Connect partner integration

EXAMPLES
  $ heroku partner:connect:info herokuconnect
```

_See code: [src/commands/partner/connect/info/index.ts](https://github.com/heroku/heroku-cli-plugin-partner/blob/v0.0.0/src/commands/partner/connect/info/index.ts)_
<!-- commandsstop -->
