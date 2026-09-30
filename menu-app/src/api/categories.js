import http from './http.js'
import { normalizeApiError } from './errors.js'

export async function getCategories(options = {}) {
  try {
    const response = await http.get('/api/categories', options)

    return response.data.result
  } catch (error) {
    throw normalizeApiError(error)
  }
}
