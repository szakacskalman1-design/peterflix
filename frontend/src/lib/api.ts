import axios, { AxiosError } from 'axios'
import type { Moment, Category, LoginResponse } from '../types'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? '/api',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
})

// Request interceptor — JWT token csatolása
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('peterflix_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Response interceptor — hibakezelés
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ error: string }>) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('peterflix_token')
      window.location.href = '/'
    }
    return Promise.reject(error)
  }
)

// ── Moments ──────────────────────────────────────────────────────────────────

export async function getMoments(params?: {
  category?: string
  sort?: 'viral' | 'recent' | 'views'
  limit?: number
}): Promise<Moment[]> {
  const { data } = await api.get<Moment[]>('/moments', { params })
  return data
}

export async function getMomentById(id: string): Promise<Moment> {
  const { data } = await api.get<Moment>(`/moments/${id}`)
  return data
}

export async function createMoment(payload: Partial<Moment>): Promise<Moment> {
  const { data } = await api.post<Moment>('/moments', payload)
  return data
}

export async function updateMoment(id: string, payload: Partial<Moment>): Promise<Moment> {
  const { data } = await api.put<Moment>(`/moments/${id}`, payload)
  return data
}

export async function deleteMoment(id: string): Promise<void> {
  await api.delete(`/moments/${id}`)
}

// ── Categories ───────────────────────────────────────────────────────────────

export async function getCategories(): Promise<Category[]> {
  const { data } = await api.get<Category[]>('/categories')
  return data
}

export async function getCategoryBySlug(slug: string): Promise<Category & { moments: Moment[] }> {
  const { data } = await api.get(`/categories/${slug}`)
  return data
}

// ── Search ───────────────────────────────────────────────────────────────────

export async function searchMoments(q: string): Promise<Moment[]> {
  if (!q || q.length < 2) return []
  const { data } = await api.get<Moment[]>('/search', { params: { q } })
  return data
}

// ── Auth ─────────────────────────────────────────────────────────────────────

export async function login(email: string, password: string): Promise<LoginResponse> {
  const { data } = await api.post<LoginResponse>('/auth/login', { email, password })
  localStorage.setItem('peterflix_token', data.token)
  return data
}

export function logout(): void {
  localStorage.removeItem('peterflix_token')
}

export function isLoggedIn(): boolean {
  return !!localStorage.getItem('peterflix_token')
}

export default api
