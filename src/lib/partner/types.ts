interface partnerConnect {
  contact_email?: string
  created_at?: string
  description?: string
  docs_url?: string
  id: string
  logo_url?: string
  name: string
  slug: string
  status?: string
  team: string
  team_name: string
  updated_at?: string
}

interface connectionError extends Error {
  body?: {
    errors?: Record<string, string[]>
    id: string
    message: string
  }
  http?: {
    statusCode?: number
  }
}

type createPartnerConnect = {
  contactEmail?: string
  description?: string
  docsUrl?: string
  isvName: string
  logoFile?: string
  slug: string
  team: string
}

interface deactivateResponse {
  id?: string
  isv_guid: string
  isv_status: string
  message: string
  responses: Array<{
    addon_guid: string
    error?: string
    message?: string
    status: number
  }>
  summary: {
    failed: number
    succeeded: number
    total: number
  }
}

interface enrollResponse {
  addon_uuid: string
  isv_guid: string
  isv_slug: string
  message: string
}

export type PartnerConnect = partnerConnect
export type ConnectionError = connectionError
export type CreatePartnerConnect = createPartnerConnect
export type DeactivateResponse = deactivateResponse
export type EnrollResponse = enrollResponse

/**
 * Format a ConnectionError with detailed validation errors if available
 */
export function formatConnectionError(error: ConnectionError): string {
  let message = error.body?.message || error.message || 'Unknown error'

  // Include detailed validation errors if available
  if (error.body?.errors) {
    const errorDetails = Object.entries(error.body.errors)
      .map(([field, messages]) => `  ${field}: ${messages.join(', ')}`)
      .join('\n')
    message = `${message}\n${errorDetails}`
  }

  return message
}
