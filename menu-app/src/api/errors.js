export function normalizeApiError(error) {
  const errorResponse = error.response?.data

  if (errorResponse?.code && errorResponse?.description) {
    const apiError = new Error(errorResponse.description)
    apiError.code = errorResponse.code
    apiError.detail = errorResponse.detail
    return apiError
  }

  return error
}
