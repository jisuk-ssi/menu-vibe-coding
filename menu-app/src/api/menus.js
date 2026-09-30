import http from './http.js'
import { normalizeApiError } from './errors.js'

export async function getMenus(options = {}) {
  try {
    const response = await http.get('/api/menus', options)

    return response.data.result
  } catch (error) {
    throw normalizeApiError(error)
  }
}

export async function getMenuPage(page, options = {}) {
  try {
    const response = await http.get('/api/menus/pages', {
      ...options,
      params: {
        ...options.params,
        page,
      },
    })

    return response.data.result
  } catch (error) {
    throw normalizeApiError(error)
  }
}

export async function searchMenusByPrice(menuPrice, options = {}) {
  try {
    const response = await http.get('/api/menus/search', {
      ...options,
      params: {
        ...options.params,
        menuPrice,
      },
    })

    return response.data.result
  } catch (error) {
    throw normalizeApiError(error)
  }
}

export async function getMenuByCode(menuCode, options = {}) {
  try {
    const response = await http.get(`/api/menus/${menuCode}`, options)

    return response.data.result
  } catch (error) {
    throw normalizeApiError(error)
  }
}

export async function createMenu(menu, options = {}) {
  try {
    const response = await http.post('/api/menus', menu, options)

    return response.data.result
  } catch (error) {
    throw normalizeApiError(error)
  }
}

export async function updateMenu(menuCode, menu, options = {}) {
  try {
    const response = await http.put(`/api/menus/${menuCode}`, menu, options)

    return response.data.result
  } catch (error) {
    throw normalizeApiError(error)
  }
}

export async function deleteMenu(menuCode, options = {}) {
  try {
    const response = await http.delete(`/api/menus/${menuCode}`, options)

    return response.data.result
  } catch (error) {
    throw normalizeApiError(error)
  }
}
