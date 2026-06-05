/**
 * apiClient.js
 * Axios instance with JWT injection and global error handling.
 * All API calls go through this client — never call SNS or AWS directly from React.
 */
import axios from 'axios'

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
})

/* ── Request interceptor: attach JWT from sessionStorage ── */
apiClient.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem('token')
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
  },
  (error) => Promise.reject(error)
)

/* ── Response interceptor: handle 401 globally ── */
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      sessionStorage.clear()
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default apiClient
