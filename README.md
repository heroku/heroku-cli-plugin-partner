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
* [`heroku partner:connect:info IDORSLUG`](#heroku-partnerconnectinfo-idorslug)

## `heroku partner:connect:create SLUG`

Creates a new partner integration record for Heroku Connect and stores ISV metadata used in Heroku Connect and Salesforce setup flows.

```
USAGE
  $ heroku partner:connect:create SLUG --team <value> --isvName <value> --description <value> --contactEmail <value>
    [--docsUrl <value>] [--logoFile <value>]

ARGUMENTS
  SLUG  Label used to uniquely identify the ISV

FLAGS
  --contactEmail=<value>  (required) Contact email for integration support. Must be a valid email address.
  --description=<value>   (required) Description of the integration (up to 500 characters).
  --docsUrl=<value>       Optional link to partner’s documentation or onboarding guide. Must be a valid URL.
  --isvName=<value>       (required) Name of the ISV or partner publishing the integration.
  --logoFile=<value>      Optional image URL for the ISV logo. Must be path to a valid image file.
  --team=<value>          (required) The Heroku team that owns this partner integration.

DESCRIPTION
  Creates a new partner integration record for Heroku Connect and stores ISV metadata used in Heroku Connect and
  Salesforce setup flows.

EXAMPLES
  $ heroku partner:connect:create acme-integration --team acme-team --isv-name "Acme Integrations"
```

_See code: [src/commands/partner/connect/create/index.ts](https://github.com/heroku/heroku-cli-plugin-partner/blob/v0.0.0/src/commands/partner/connect/create/index.ts)_

## `heroku partner:connect:info IDORSLUG`

display all metadata fields for a Heroku Connect partner integration

```
USAGE
  $ heroku partner:connect:info IDORSLUG [--json]

ARGUMENTS
  IDORSLUG  Partner Connect integration ID or integration name

FLAGS
  --json  output in JSON format

DESCRIPTION
  display all metadata fields for a Heroku Connect partner integration

EXAMPLES
  $ heroku partner:connect:info herokuconnect
```

_See code: [src/commands/partner/connect/info/index.ts](https://github.com/heroku/heroku-cli-plugin-partner/blob/v0.0.0/src/commands/partner/connect/info/index.ts)_
<!-- commandsstop -->

# Development

## Setup

```
mise install
npm install
```

## Generate the docs
```
yarn build
```

## Run eslint
```
yarn lint
```
