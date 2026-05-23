import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export default function SearchBar() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()

  useEffect(() => {
    if (open) inputRef.current?.focus()
  }, [open])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (query.trim().length >= 2) {
      navigate(`/?q=${encodeURIComponent(query.trim())}`)
      setOpen(false)
      setQuery('')
    }
  }

  return (
    <div className="flex items-center">
      {open ? (
        <form onSubmit={handleSubmit} className="flex items-center border border-white/40 bg-black/60 backdrop-blur-sm">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Keresés…"
            className="bg-transparent text-white text-sm px-3 py-1.5 outline-none w-48 placeholder-gray-500"
            onBlur={() => { if (!query) setOpen(false) }}
          />
          <button type="submit" className="px-2 text-gray-400 hover:text-white">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
        </form>
      ) : (
        <button
          onClick={() => setOpen(true)}
          className="text-white/70 hover:text-white transition-colors p-1"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </button>
      )}
    </div>
  )
}
