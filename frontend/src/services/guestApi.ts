import axios from 'axios'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'

const guestApi = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
})

guestApi.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('guest_token')
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
      
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

export default guestApi
