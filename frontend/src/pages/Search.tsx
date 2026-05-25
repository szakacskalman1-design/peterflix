import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSearch } from '../hooks/useSearch'
import MomentModal from '../components/MomentModal'
import type { Moment } from '../types'

function formatDuration(s: number) {
  const m = Math.floor(s / 60)
  const sec = s % 60
  return `${m}:${String(sec).padStart(2, '0')}`
}

function ResultCard({ moment, onClick }: { moment: Moment; onClick: () => void }) {
  const thumb = `https://img.youtube.com/vi/${moment.youtubeId}/mqdefault.jpg`
  return (
    <motion.button
      onClick={onClick}
      className="w-full flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/8 hover:border-white/20 transition-all text-left"
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="relative flex-shrink-0 w-20 h-14 rounded-lg overflow-hidden bg-gray-900">
        <img src={thumb} alt={moment.title} className="w-full h-full object-cover" />
        {moment.viralScore >= 90 && (
          <div className="absolute top-1 left-1 bg-red-600/80 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full">
            🔥
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="text-white text-sm font-bold line-clamp-2 leading-snug mb-1">
          {moment.title}
        </h3>
        <div className="flex items-center gap-1.5 text-[11px] text-gray-400">
          {moment.category && (
            <span
              className="font-medium px-1.5 py-0.5 rounded-full text-[10px]"
              style={{
                background: moment.category.color + '25',
                color: moment.category.color,
              }}
            >
              {moment.category.name}
            </span>
          )}
          <span>{moment.year}</span>
          <span className="text-gray-600">·</span>
          <span>{formatDuration(moment.duration)}</span>
          <span className="text-gray-600">·</span>
          <span className="text-green-400 font-medium">{moment.viralScore}%</span>
        </div>
      </div>
    </motion.button>
  )
}

export default function Search() {
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState<Moment | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const { results, loading } = useSearch(query)

  // Auto-focus az input mezőre
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  return (
    <>
      <div
        className="min-h-screen bg-[#0a0a0a] pb-20"
        style={{ minHeight: '100dvh' }}
      >
        {/* Header */}
        <div className="sticky top-0 z-30 bg-[#0a0a0a]/95 backdrop-blur-md border-b border-white/8 px-4 pt-4 pb-3">
          <h1 className="text-center text-sm font-black text-[#e50914] tracking-widest uppercase mb-3">
            PÉTERFLIX
          </h1>

          {/* Keresőmező */}
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 text-lg pointer-events-none">
              🔍
            </span>
            <input
              ref={inputRef}
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Keress videókat, tageket…"
              className="w-full bg-white/8 border border-white/12 text-white rounded-full pl-10 pr-10 py-2.5 text-sm outline-none focus:border-white/30 focus:bg-white/12 placeholder-gray-500 transition-all"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white text-sm"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Tartalom */}
        <div className="px-4 pt-4">
          <AnimatePresence mode="wait">
            {!query ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-center pt-16 text-gray-600"
              >
                <div className="text-5xl mb-4">🎬</div>
                <p className="text-base font-medium text-gray-500">Keress Magyar Péter videókra!</p>
                <p className="text-sm text-gray-600 mt-1">Cím, tag, leírás alapján</p>
              </motion.div>
            ) : loading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center pt-16 text-gray-500"
              >
                <div className="text-3xl mb-3 animate-spin inline-block">⏳</div>
                <p className="animate-pulse">Keresés…</p>
              </motion.div>
            ) : results.length === 0 ? (
              <motion.div
                key="noresult"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-center pt-16 text-gray-500"
              >
                <div className="text-5xl mb-4">😕</div>
                <p className="text-base font-medium text-gray-400">
                  Nincs találat: <span className="text-white">„{query}"</span>
                </p>
                <p className="text-sm text-gray-600 mt-1">Próbálj más kulcsszót!</p>
              </motion.div>
            ) : (
              <motion.div
                key="results"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <p className="text-gray-500 text-xs mb-3 font-medium">
                  {results.length} találat
                </p>
                <div className="flex flex-col gap-2">
                  {results.map((m, i) => (
                    <motion.div
                      key={m.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04 }}
                    >
                      <ResultCard moment={m} onClick={() => setSelected(m)} />
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Modal */}
      {selected && (
        <MomentModal moment={selected} onClose={() => setSelected(null)} />
      )}
    </>
  )
}
