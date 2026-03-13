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

export type PartnerConnect = partnerConnect
export type ConnectionError = connectionError