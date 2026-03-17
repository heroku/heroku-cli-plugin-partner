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
* [`heroku partner:connect:info ID_OR_SLUG`](#heroku-partnerconnectinfo-id_or_slug)

## `heroku partner:connect:create SLUG`

Creates a new partner integration record for Heroku Connect and stores ISV metadata used in Heroku Connect and Salesforce setup flows.

```
USAGE
  $ heroku partner:connect:create SLUG --team <value> --isv-name <value> [--description <value>] [--docs-url <value>]
    [--contact-email <value>] [--logo-file <value>]

ARGUMENTS
  SLUG  Label used to uniquely identify the ISV

FLAGS
  --contact-email=<value>  Optional contact email for integration support. Must be a valid email address.
  --description=<value>    Optional description of the integration (up to 500 characters).
  --docs-url=<value>       Optional link to partner’s documentation or onboarding guide. Must be a valid HTTP/HTTPS URL.
  --isv-name=<value>       (required) Name of the ISV or partner publishing the integration.
  --logo-file=<value>      Optional image path for the ISV logo. Must be a path to a valid image file.
  --team=<value>           (required) The Heroku team that owns this partner integration.

DESCRIPTION
  Creates a new partner integration record for Heroku Connect and stores ISV metadata used in Heroku Connect and
  Salesforce setup flows.

EXAMPLES
  $ heroku partner:connect:create acme-integration --team acme-team --isv-name "Acme Integrations"
```

_See code: [src/commands/partner/connect/create/index.ts](https://github.com/heroku/heroku-cli-plugin-partner/blob/v0.0.0/src/commands/partner/connect/create/index.ts)_

## `heroku partner:connect:deactivate ID_OR_SLUG`

Deactivates a Heroku Connect partner integration.

```
USAGE
  $ heroku partner:connect:deactivate ID_OR_SLUG

ARGUMENTS
  ID_OR_SLUG  Partner Connect integration ID or integration name

DESCRIPTION
  Deactivates a Heroku Connect partner integration.
  Deactivation prevents new Heroku Connect add-ons from being associated with the partner integration.
  It also destroys any existing Heroku Connect add-ons that are associated with the partner integration.

EXAMPLES
  $ heroku partner:connect:deactivate acme-integrations
```

_See code: [src/commands/partner/connect/deactivate/index.ts](https://github.com/heroku/heroku-cli-plugin-partner/blob/v0.0.0/src/commands/partner/connect/deactivate/index.ts)_

## `heroku partner:connect:info ID_OR_SLUG`

display all metadata fields for a Heroku Connect partner integration

```
USAGE
  $ heroku partner:connect:info ID_OR_SLUG [--json]

ARGUMENTS
  ID_OR_SLUG  Partner Connect integration ID or integration name

FLAGS
  --json  output in JSON format

DESCRIPTION
  display all metadata fields for a Heroku Connect partner integration

EXAMPLES
  $ heroku partner:connect:info acme-integrations
```

_See code: [src/commands/partner/connect/info/index.ts](https://github.com/heroku/heroku-cli-plugin-partner/blob/v0.0.0/src/commands/partner/connect/info/index.ts)_
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
