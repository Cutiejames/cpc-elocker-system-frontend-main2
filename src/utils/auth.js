// utils/auth.js - Vue Authentication utilities
import axios from 'axios'

const API_BASE_URL = 'http://localhost:3001'

/**
 * Clear all authentication data from localStorage
 */
export const clearAuthData = () => {
  localStorage.removeItem('authToken')
  localStorage.removeItem('userData')
  localStorage.removeItem('userRole')
  localStorage.removeItem('refreshToken')
  localStorage.removeItem('tokenExpiry')
  sessionStorage.clear()
}

/**
 * Simple logout - clear local data and redirect
 */
export const logoutLocal = (router) => {
  try {
    clearAuthData()
    router.push('/login')
    console.log('Logged out successfully')
    return { success: true, message: 'Logged out successfully' }
  } catch (error) {
    console.error('Error during local logout:', error)
    return { success: false, message: 'Error during logout' }
  }
}

/**
 * Server-side logout with API call
 */
export const logoutWithServer = async (router) => {
  try {
    const token = localStorage.getItem('authToken')
    
    if (token) {
      await axios.post(`${API_BASE_URL}/user/logout`, {}, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        timeout: 5000
      })
    }
  } catch (error) {
    console.error('Server logout failed:', error)
  } finally {
    clearAuthData()
    router.push('/login')
  }
  
  return { success: true, message: 'Logged out successfully' }
}

/**
 * Check if user is authenticated
 */
export const isAuthenticated = () => {
  const token = localStorage.getItem('authToken')
  const userData = localStorage.getItem('userData')
  return !!(token && userData)
}

/**
 * Get current user data
 */
export const getCurrentUser = () => {
  try {
    const userData = localStorage.getItem('userData')
    const userRole = localStorage.getItem('userRole')
    
    return userData ? {
      ...JSON.parse(userData),
      role: userRole
    } : null
  } catch (error) {
    console.error('Error parsing user data:', error)
    return null
  }
}

/**
 * Auto logout when token expires
 */
export const autoLogout = (router, message = 'Session expired. Please login again.') => {
  clearAuthData()
  router.push('/login')
  console.warn(message)
  return { success: true, message }
}

/**
 * Setup axios interceptors for Vue
 */
export const setupAxiosInterceptors = (router) => {
  // Request interceptor - add token to requests
  axios.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('authToken')
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
      return config
    },
    (error) => Promise.reject(error)
  )

  // Response interceptor - handle token expiration
  axios.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        autoLogout(router, 'Session expired. Please login again.')
      }
      return Promise.reject(error)
    }
  )
}