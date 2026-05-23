import { useState, useEffect, useRef } from 'react'
import type { Moment } from '../types'
import { searchMoments } from '../lib/api'

export function useSearch(query: string) {
  const [results, setResults] = useState<Moment[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!query || query.length < 2) {
      setResults([])
      return
    }

    if (timerRef.current) clearTimeout(timerRef.current)

    timerRef.current = setTimeout(() => {
      setLoading(true)
      setError(null)
      searchMoments(query)
        .then(setResults)
        .catch(err => setError(err?.response?.data?.error ?? 'Keresési hiba'))
        .finally(() => setLoading(false))
    }, 400)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [query])

  return { results, loading, error }
}
