import { useState, useEffect } from 'react'
import type { Moment, Category } from '../types'
import { getMoments, getCategories } from '../lib/api'

export function useMoments(params?: { category?: string; sort?: 'viral' | 'recent' | 'views'; limit?: number }) {
  const [moments, setMoments] = useState<Moment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    setError(null)
    getMoments(params)
      .then(setMoments)
      .catch(err => setError(err?.response?.data?.error ?? 'Hiba történt'))
      .finally(() => setLoading(false))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params?.category, params?.sort, params?.limit])

  return { moments, loading, error }
}

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getCategories()
      .then(setCategories)
      .catch(err => setError(err?.response?.data?.error ?? 'Hiba történt'))
      .finally(() => setLoading(false))
  }, [])

  return { categories, loading, error }
}
