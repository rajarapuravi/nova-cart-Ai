import axios from 'axios'

// In production (Netlify), VITE_API_BASE_URL points to Render backend.
// In development, Vite proxy handles /api → localhost:8000.
const BASE = import.meta.env.VITE_API_BASE_URL
  ? `${import.meta.env.VITE_API_BASE_URL}/api`
  : '/api'

const api = axios.create({
  baseURL: BASE,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: false,
})

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Auto-refresh on 401
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true
      try {
        const refresh = localStorage.getItem('refresh')
        if (!refresh) throw new Error('No refresh token')
        const res = await axios.post(`${BASE}/auth/token/refresh/`, { refresh })
        localStorage.setItem('access', res.data.access)
        original.headers.Authorization = `Bearer ${res.data.access}`
        return api(original)
      } catch (_) {
        localStorage.removeItem('access')
        localStorage.removeItem('refresh')
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export default api
