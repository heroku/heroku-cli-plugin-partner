import * as Heroku from '@heroku-cli/schema'

import type {PartnerConnect} from '../../src/lib/partner/types.js'

export const app: Heroku.App = {
  id: '89abcdef-0123-4567-89ab-cdef01234567',
  name: 'my-app',
}

export const partnerConnectInfo = {
  contact_email: 'support@example.com',
  created_at: '2021-01-01T00:00:00Z',
  description: 'Example integration for testing',
  docs_url: 'https://docs.example.com',
  id: '3c0b2b51-8431-4ce8-8e5f-b4a76e509b36',
  logo_url: 'https://example.com/logo.png',
  name: 'Example Integration',
  slug: 'example',
  status: 'active',
  team: {
    id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    name: 'acme-team',
  },
  updated_at: '2021-01-01T00:00:00Z',
}

export const partnerConnectInfoWithoutOptionalFields: PartnerConnect = {
  id: 'd9e459d0-6563-478f-87d1-eb485cea91b9',
  name: 'Basic Integration',
  slug: 'basic',
  team: {
    id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    name: 'acme-team',
  },
}

export const deactivateResponse = {
  isv_guid: '3c0b2b51-8431-4ce8-8e5f-b4a76e509b36',
  isv_status: 'inactive',
  message: 'Integration deactivated',
  responses: [],
  summary: {
    failed: 0,
    succeeded: 1,
    total: 1,
  },
}

export const enrollResponse = {
  addon_uuid: '01234567-89ab-cdef-0123-456789abcdef',
  isv_guid: '3c0b2b51-8431-4ce8-8e5f-b4a76e509b36',
  isv_slug: 'example',
  message: 'Add-on enrolled successfully',
}
