heroku-cli-plugin-partner
=================

CLI for Heroku Partner/ISV Integrations


[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/heroku-cli-plugin-partner.svg)](https://npmjs.org/package/heroku-cli-plugin-partner)
[![Downloads/week](https://img.shields.io/npm/dw/heroku-cli-plugin-partner.svg)](https://npmjs.org/package/heroku-cli-plugin-partner)


<!-- toc -->
* [Usage](#usage)
* [Commands](#commands)
* [Development](#development)
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
* [`heroku partner:connect:create SLUG`](#heroku-partnerconnectcreate-slug)
* [`heroku partner:connect:deactivate ID_OR_SLUG`](#heroku-partnerconnectdeactivate-id_or_slug)
* [`heroku partner:connect:enroll ID_OR_SLUG`](#heroku-partnerconnectenroll-id_or_slug)
* [`heroku partner:connect:info ID_OR_SLUG`](#heroku-partnerconnectinfo-id_or_slug)
* [`heroku partner:connect:update ID_OR_SLUG`](#heroku-partnerconnectupdate-id_or_slug)

## `heroku partner:connect:create SLUG`

create a partner integration record for Heroku Connect and store the ISV metadata used in Heroku Connect and Salesforce setup flows

```
USAGE
  $ heroku partner:connect:create SLUG --isv-name <value> --team <value> [--prompt] [--contact-email <value>] [--description
    <value>] [--docs-url <value>] [--json] [--logo-file <value>]

ARGUMENTS
  SLUG  name of the partner integration

FLAGS
  --contact-email=<value>  valid email for integration support
  --description=<value>    description of the integration (up to 500 characters)
  --docs-url=<value>       link to partner's documentation or onboarding guide
  --isv-name=<value>       (required) name of the ISV or partner publishing the integration
  --json                   output in JSON format
  --logo-file=<value>      image path for the ISV logo
  --team=<value>           (required) Heroku team that owns the partner integration

GLOBAL FLAGS
  --prompt  interactively prompt for command arguments and flags

DESCRIPTION
  create a partner integration record for Heroku Connect and store the ISV metadata used in Heroku Connect and
  Salesforce setup flows

EXAMPLES
  $ heroku partner:connect:create acme-integration --team acme-team --isv-name "Acme Integrations"
```

_See code: [src/commands/partner/connect/create.ts](https://github.com/heroku/heroku-cli-plugin-partner/blob/v0.0.0/src/commands/partner/connect/create.ts)_

## `heroku partner:connect:deactivate ID_OR_SLUG`

deactivate a Heroku Connect partner integration

```
USAGE
  $ heroku partner:connect:deactivate ID_OR_SLUG [--prompt] [--confirm <value>]

ARGUMENTS
  ID_OR_SLUG  ID or name of the partner integration

FLAGS
  --confirm=<value>  pass in the integration ID or slug to skip confirmation prompts

GLOBAL FLAGS
  --prompt  interactively prompt for command arguments and flags

DESCRIPTION
  deactivate a Heroku Connect partner integration
  Deactivation prevents associating new Heroku Connect add-ons with the partner integration.
  Deactivation also destroys any existing Heroku Connect add-ons associated with the partner integration.

EXAMPLES
  $ heroku partner:connect:deactivate acme-integrations
```

_See code: [src/commands/partner/connect/deactivate.ts](https://github.com/heroku/heroku-cli-plugin-partner/blob/v0.0.0/src/commands/partner/connect/deactivate.ts)_

## `heroku partner:connect:enroll ID_OR_SLUG`

enroll an existing add-on into a partner integration

```
USAGE
  $ heroku partner:connect:enroll ID_OR_SLUG --addon <value> [--prompt] [--json]

ARGUMENTS
  ID_OR_SLUG  ID or name of the partner integration

FLAGS
  --addon=<value>  (required) ID or name of the add-on to enroll
  --json           output in JSON format

GLOBAL FLAGS
  --prompt  interactively prompt for command arguments and flags

DESCRIPTION
  enroll an existing add-on into a partner integration

EXAMPLES
  $ heroku partner:connect:enroll acme-integrations --addon addon-id
```

_See code: [src/commands/partner/connect/enroll.ts](https://github.com/heroku/heroku-cli-plugin-partner/blob/v0.0.0/src/commands/partner/connect/enroll.ts)_

## `heroku partner:connect:info ID_OR_SLUG`

display details for a Heroku Connect partner integration

```
USAGE
  $ heroku partner:connect:info ID_OR_SLUG [--prompt] [--json]

ARGUMENTS
  ID_OR_SLUG  ID or name of the partner integration

FLAGS
  --json  output in JSON format

GLOBAL FLAGS
  --prompt  interactively prompt for command arguments and flags

DESCRIPTION
  display details for a Heroku Connect partner integration

EXAMPLES
  $ heroku partner:connect:info acme-integrations
```

_See code: [src/commands/partner/connect/info.ts](https://github.com/heroku/heroku-cli-plugin-partner/blob/v0.0.0/src/commands/partner/connect/info.ts)_

## `heroku partner:connect:update ID_OR_SLUG`

update a partner integration record for Heroku Connect and store the ISV metadata used in Heroku Connect and Salesforce setup flows

```
USAGE
  $ heroku partner:connect:update ID_OR_SLUG [--prompt] [--contact-email <value>] [--description <value>] [--docs-url
    <value>] [--json] [--logo-file <value>]

ARGUMENTS
  ID_OR_SLUG  ID or name of the partner integration

FLAGS
  --contact-email=<value>  valid email for integration support
  --description=<value>    description of the integration (up to 500 characters)
  --docs-url=<value>       link to partner's documentation or onboarding guide
  --json                   output in JSON format
  --logo-file=<value>      image path for the ISV logo

GLOBAL FLAGS
  --prompt  interactively prompt for command arguments and flags

DESCRIPTION
  update a partner integration record for Heroku Connect and store the ISV metadata used in Heroku Connect and
  Salesforce setup flows

EXAMPLES
  $ heroku partner:connect:update acme-integrations --description "Version 2 of the Acme integration"
```

_See code: [src/commands/partner/connect/update.ts](https://github.com/heroku/heroku-cli-plugin-partner/blob/v0.0.0/src/commands/partner/connect/update.ts)_
<!-- commandsstop -->

# Development

## Setup

```
mise install
yarn
```

## Generate the docs
```
yarn build
```

## Run eslint
```
yarn lint
```
