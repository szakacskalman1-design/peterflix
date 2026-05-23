import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import Navbar from '../components/Navbar'
import { getMomentById } from '../lib/api'
import type { Moment } from '../types'

function formatDuration(s: number) {
  const m = Math.floor(s / 60)
  const sec = s % 60
  return `${m}:${String(sec).padStart(2, '0')}`
}

export default function MomentPage() {
  const { id } = useParams<{ id: string }>()
  const [moment, setMoment] = useState<Moment | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    getMomentById(id)
      .then(setMoment)
      .catch(() => setError('A pillanat nem található.'))
      .finally(() => setLoading(false))
  }, [id])

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Navbar />

      <div className="pt-20 max-w-4xl mx-auto px-6 pb-16">
        {loading && (
          <div className="text-gray-400 text-center pt-20 animate-pulse">Töltés…</div>
        )}
        {error && (
          <div className="text-center pt-20">
            <p className="text-red-400 mb-4">{error}</p>
            <Link to="/" className="text-[#e50914] hover:underline">← Vissza a főoldalra</Link>
          </div>
        )}
        {moment && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            {/* Video — Shorts: portré 9:16, regular: 16:9 */}
            {moment.platform === 'shorts' ? (
              <div className="flex justify-center bg-black rounded-xl overflow-hidden mb-6">
                <div className="relative w-[320px]" style={{ paddingTop: 'calc(320px * 16/9)' }}>
                  <iframe
                    className="absolute inset-0 w-full h-full"
                    src={`https://www.youtube.com/embed/${moment.youtubeId}?rel=0`}
                    title={moment.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              </div>
            ) : (
              <div className="relative w-full rounded-xl overflow-hidden mb-6" style={{ paddingTop: '56.25%' }}>
                <iframe
                  className="absolute inset-0 w-full h-full"
                  src={`https://www.youtube.com/embed/${moment.youtubeId}?rel=0`}
                  title={moment.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            )}

            {/* Info */}
            <h1 className="text-white text-3xl font-bold mb-2">{moment.title}</h1>
            <div className="flex flex-wrap items-center gap-3 mb-4 text-sm">
              <span className="text-green-400 font-bold">{moment.viralScore}% virális</span>
              <span className="text-gray-500">•</span>
              <span className="text-gray-400">{moment.year}</span>
              <span className="text-gray-500">•</span>
              <span className="text-gray-400">{formatDuration(moment.duration)}</span>
              <span className="text-gray-500">•</span>
              <span className="text-gray-400">👁 {moment.viewCount?.toLocaleString('hu')}</span>
              {moment.category && (
                <>
                  <span className="text-gray-500">•</span>
                  <Link
                    to={`/category/${moment.category.slug}`}
                    className="px-2 py-0.5 rounded text-xs font-medium hover:opacity-80"
                    style={{ background: moment.category.color + '33', color: moment.category.color }}
                  >
                    {moment.category.name}
                  </Link>
                </>
              )}
            </div>

            <p className="text-gray-300 leading-relaxed mb-5">{moment.description}</p>

            {/* Viral bar */}
            <div className="mb-5">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>Virális pontszám</span><span>{moment.viralScore}/100</span>
              </div>
              <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-[#e50914] rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${moment.viralScore}%` }}
                  transition={{ duration: 1 }}
                />
              </div>
            </div>

            {/* Tags */}
            {moment.tags?.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {moment.tags.map(tag => (
                  <span key={tag} className="bg-white/10 text-gray-300 text-xs px-2.5 py-1 rounded-full">
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            <div className="mt-8">
              <Link to="/" className="text-[#e50914] hover:underline text-sm">← Vissza a főoldalra</Link>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
