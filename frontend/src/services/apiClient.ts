import axios from 'axios'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'

/**
 * StayOS Central API Client
 * Automatically injects Auth and Tenant tokens from storage.
 */
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  withCredentials: true,
})

// Request Interceptor: Global Header Injection
apiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      // 1. Inject Authorization Token
      const token = localStorage.getItem('access_token')
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }

      // 2. Inject Multi-Tenancy Token (X-Tenant-ID)
      // Check individual tenant_id key or extract from user object
      const directTenantId = localStorage.getItem('tenant_id')
      if (directTenantId) {
        config.headers['X-Tenant-ID'] = directTenantId
      } else {
        const userStr = localStorage.getItem('user') || localStorage.getItem('super_admin_user')
        if (userStr) {
          try {
            const user = JSON.parse(userStr)
            if (user?.tenant_id) {
              config.headers['X-Tenant-ID'] = user.tenant_id.toString()
            }
          } catch (e) {
            console.error('[StayOS] Failed to parse tenant context:', e)
          }
        }
      }
      
      // 3. Ensure Content-Type is set for POST/PUT requests
      if (['POST', 'PUT', 'PATCH'].includes(config.method?.toUpperCase() || '')) {
        if (!config.headers['Content-Type']) {
          config.headers['Content-Type'] = 'application/json'
        }
      }
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response Interceptor: Basic Error Handling
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    // 401 Handling (Token Expired) could be added here
    return Promise.reject(error)
  }
)

export default apiClient
