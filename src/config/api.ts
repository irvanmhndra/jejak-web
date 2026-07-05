import axios from 'axios'
import { useAuthStore } from '../store/authStore'

export const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:8087/api/v1'

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

let refreshPromise: Promise<string> | null = null

function forceLogout() {
  useAuthStore.getState().clearAuth()
  if (window.location.pathname !== '/login') {
    window.location.href = '/login'
  }
}

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config
    const status = error.response?.status
    const code = error.response?.data?.error_code
    const isAuthError = status === 401 && (code === 'TOKEN_EXPIRED' || code === 'UNAUTHORIZED')

    if (!isAuthError || !original || original._retry) {
      if (status === 401 && original?._retry) forceLogout()
      return Promise.reject(error)
    }

    original._retry = true
    if (!useAuthStore.getState().refreshToken) {
      forceLogout()
      return Promise.reject(error)
    }

    if (!refreshPromise) {
      refreshPromise = useAuthStore
        .getState()
        .refresh()
        .finally(() => {
          refreshPromise = null
        })
    }

    try {
      const token = await refreshPromise
      original.headers.Authorization = `Bearer ${token}`
      return api(original)
    } catch (e) {
      forceLogout()
      return Promise.reject(e)
    }
  },
)
