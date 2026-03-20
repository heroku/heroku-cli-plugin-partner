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
  updated_at?: string
}

interface connectionError extends Error {
  body?: {
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

export type PartnerConnect = partnerConnect
export type ConnectionError = connectionError
export type CreatePartnerConnect = createPartnerConnect
export type DeactivateResponse = deactivateResponse