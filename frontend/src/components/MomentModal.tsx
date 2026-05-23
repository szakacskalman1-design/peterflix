import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Moment } from '../types'

interface Props {
  moment: Moment
  onClose: () => void
}

function formatDuration(s: number) {
  const m = Math.floor(s / 60)
  const sec = s % 60
  return `${m}:${String(sec).padStart(2, '0')}`
}

export default function MomentModal({ moment, onClose }: Props) {
  // Close on ESC
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [onClose])

  return (
    <AnimatePresence>
      {/* Backdrop */}
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <div
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Modal */}
        <motion.div
          className="relative w-full max-w-2xl bg-[#141414] rounded-xl overflow-hidden shadow-2xl"
          initial={{ y: 60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 60, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        >
          {/* YouTube embed — Shorts: portré 9:16, regular: 16:9 */}
          {moment.platform === 'shorts' ? (
            <div className="flex justify-center bg-black py-2">
              <div className="relative w-[280px]" style={{ paddingTop: 'calc(280px * 16/9)' }}>
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
            <div className="relative w-full" style={{ paddingTop: '56.25%' }}>
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
          <div className="p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-white text-xl font-bold">{moment.title}</h2>
                <div className="flex items-center gap-3 mt-1 text-sm">
                  <span className="text-green-400 font-semibold">{moment.viralScore}% virális</span>
                  <span className="text-gray-400">{moment.year}</span>
                  <span className="text-gray-400">{formatDuration(moment.duration)}</span>
                  <span
                    className="px-2 py-0.5 rounded text-xs font-medium"
                    style={{ background: moment.category?.color + '33', color: moment.category?.color }}
                  >
                    {moment.category?.name}
                  </span>
                </div>
              </div>
              <button
                onClick={onClose}
                className="flex-shrink-0 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
              >
                ✕
              </button>
            </div>

            <p className="text-gray-300 text-sm mt-3 leading-relaxed">{moment.description}</p>

            {/* Viral score bar */}
            <div className="mt-4">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>Virális pontszám</span>
                <span>{moment.viralScore}/100</span>
              </div>
              <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-[#e50914] rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${moment.viralScore}%` }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                />
              </div>
            </div>

            {/* Tags */}
            {moment.tags?.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-3">
                {moment.tags.map(tag => (
                  <span key={tag} className="text-xs bg-white/10 text-gray-300 px-2 py-0.5 rounded">
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
