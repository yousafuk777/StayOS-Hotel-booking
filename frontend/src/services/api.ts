import axios from 'axios'
import apiClient from './apiClient'

/**
 * Legacy API Export
 * Re-exports the central apiClient with additional token refresh logic.
 */
const api = apiClient

// Adding the complex refresh logic to the central client
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        const { data } = await axios.post(
          `${API_BASE_URL}/api/v1/auth/refresh`,
          {},
          { withCredentials: true }
        )

        if (data.access_token) {
          localStorage.setItem('access_token', data.access_token)
          originalRequest.headers.Authorization = `Bearer ${data.access_token}`
          return api(originalRequest)
        }
      } catch {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('access_token')
          localStorage.removeItem('super_admin_user')
          window.location.href = '/super-admin/login'
        }
      }
    }
    return Promise.reject(error)
  }
)

export default api
