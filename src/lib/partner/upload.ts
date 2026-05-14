import {vars} from '@heroku-cli/command'
import axios, {isAxiosError} from 'axios'
import FormData from 'form-data'
import {existsSync, readFileSync, statSync} from 'node:fs'
import path from 'node:path'
import tsheredoc from 'tsheredoc'

const heredoc = tsheredoc.default
export interface UploadOptions {
  auth: string | undefined
  endpoint: string
  fields: Record<string, string | undefined>
  logoFile?: string
  method?: 'PATCH' | 'POST'
}

/**
 * Validates a logo file
 * @throws Error if validation fails
 */
export function validateLogoFile(logoFile: string): void {
  if (!existsSync(logoFile)) {
    throw new Error(heredoc`
      We can't find the logo file: ${logoFile}
      Check the location of the logo file and try again.
    `)
  }

  const stats = statSync(logoFile)
  if (!stats.isFile()) {
    throw new Error(heredoc`
      Logo path isn't a valid file: ${logoFile}
      Make sure the logo path is valid and try again.
    `)
  }

  const maxSize = 5 * 1024 * 1024 // 5MB
  if (stats.size > maxSize) {
    throw new Error(heredoc`
      Logo file size exceeds 5 MB: ${(stats.size / (1024 * 1024)).toFixed(2)} MB
      Use a logo file under 5 MB and try again.
    `)
  }
}

/**
 * Upload partner integration data with optional logo file
 */
export async function uploadPartnerData<T>(options: UploadOptions): Promise<T> {
  const {auth, endpoint, fields, logoFile, method = 'POST'} = options

  // Create FormData with all fields
  const formData = new FormData()

  // Add non-empty fields
  for (const [key, value] of Object.entries(fields)) {
    if (value !== undefined && value !== null) {
      formData.append(key, value)
    }
  }

  // Add logo file if provided
  if (logoFile) {
    const fileBuffer = readFileSync(logoFile)
    formData.append('logo_image', fileBuffer, {
      filename: path.basename(logoFile),
    })
  }

  // Make request with axios
  const url = `${vars.apiUrl}${endpoint}`

  try {
    const response = await axios({
      data: formData,
      headers: {
        ...formData.getHeaders(),
        Accept: 'application/vnd.heroku+json; version=3.partner',
        Authorization: `Bearer ${auth}`,
      },
      method,
      url,
    })

    return response.data
  } catch (error: unknown) {
    // Transform axios error into ConnectionError format
    if (isAxiosError(error) && error.response) {
      const err = new Error(error.message) as Error & {
        body?: {
          errors?: Record<string, string[]>
          id: string
          message: string
        }
        http?: {
          statusCode?: number
        }
      }
      err.body = error.response.data
      err.http = {statusCode: error.response.status}
      throw err
    }

    throw error
  }
}
