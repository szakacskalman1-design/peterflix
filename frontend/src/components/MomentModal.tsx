import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Moment } from '../types'
import { useLikes } from '../hooks/useLikes'

interface Props {
  moment: Moment
  onClose: () => void
}

function formatDuration(s: number) {
  const m = Math.floor(s / 60)
  const sec = s % 60
  return `${m}:${String(sec).padStart(2, '0')}`
}

// ── Vízjeles kép generálás ────────────────────────────────────────────────────
async function downloadShareCard(moment: Moment) {
  const W = 1080, H = 1080
  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')!

  const bg = ctx.createLinearGradient(0, 0, W, H)
  bg.addColorStop(0, '#0a0a0a')
  bg.addColorStop(1, '#1a1a1a')
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, W, H)

  const thumbUrl = `https://img.youtube.com/vi/${moment.youtubeId}/maxresdefault.jpg`
  await new Promise<void>(resolve => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      const imgH = Math.round(W * 9 / 16)
      ctx.drawImage(img, 0, 0, W, imgH)
      const fade = ctx.createLinearGradient(0, imgH - 200, 0, imgH)
      fade.addColorStop(0, 'rgba(10,10,10,0)')
      fade.addColorStop(1, 'rgba(10,10,10,1)')
      ctx.fillStyle = fade
      ctx.fillRect(0, imgH - 200, W, 200)
      resolve()
    }
    img.onerror = () => resolve()
    img.src = thumbUrl
  })

  const catColor = moment.category?.color ?? '#e50914'
  ctx.fillStyle = catColor
  ctx.fillRect(0, 580, W, 6)

  ctx.fillStyle = '#ffffff'
  ctx.font = 'bold 64px system-ui, sans-serif'
  ctx.textBaseline = 'top'
  const words = moment.title.split(' ')
  let line = '', y = 620
  for (const word of words) {
    const test = line ? `${line} ${word}` : word
    if (ctx.measureText(test).width > W - 80 && line) {
      ctx.fillText(line, 40, y); line = word; y += 76
    } else { line = test }
  }
  if (line) ctx.fillText(line, 40, y)
  y += 96

  ctx.font = 'bold 48px system-ui, sans-serif'
  ctx.fillStyle = '#4ade80'
  ctx.fillText(`${moment.viralScore}% virális`, 40, y)

  ctx.font = '36px system-ui, sans-serif'
  ctx.fillStyle = '#9ca3af'
  ctx.fillText(`${moment.year}  ·  ${formatDuration(moment.duration)}`, 40, y + 60)

  ctx.font = 'bold 42px system-ui, sans-serif'
  ctx.fillStyle = '#e50914'
  ctx.textAlign = 'right'
  ctx.fillText('PÉTERFLIX', W - 40, 40)

  ctx.textAlign = 'left'
  ctx.font = 'bold 32px system-ui, sans-serif'
  ctx.fillStyle = 'rgba(255,255,255,0.35)'
  ctx.fillText('péterflix.hu', 40, H - 50)

  canvas.toBlob(blob => {
    if (!blob) return
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `peterflix-${moment.youtubeId}.png`
    a.click()
    URL.revokeObjectURL(url)
  }, 'image/png')
}

// ── Share gombok ──────────────────────────────────────────────────────────────
function ShareButtons({ moment }: { moment: Moment }) {
  const [copied, setCopied] = useState(false)
  const [downloading, setDownloading] = useState(false)

  const momentUrl = `${window.location.origin}/moment/${moment.id}`
  const tweetText = `„${moment.title}" 🔥 ${moment.viralScore}% virális\n\n#PéterFlix #MagyarPéter`
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}&url=${encodeURIComponent(momentUrl)}`
  const tiktokText = `${moment.title} 🔥 Nézd meg: péterflix.hu #PéterFlix #MagyarPéter`

  async function copyLink() {
    await navigator.clipboard.writeText(momentUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  async function copyTikTok() {
    await navigator.clipboard.writeText(tiktokText)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  async function handleDownload() {
    setDownloading(true)
    await downloadShareCard(moment)
    setDownloading(false)
  }

  return (
    <div className="mt-4 pt-4 border-t border-white/8">
      <p className="text-gray-500 text-xs mb-2.5 uppercase tracking-wide font-medium">Megosztás</p>
      <div className="flex flex-wrap gap-2">
        <a
          href={twitterUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 bg-black border border-white/15 hover:border-white/30 text-white text-xs font-medium px-3 py-1.5 rounded-full transition-colors"
        >
          <span className="font-black text-sm">𝕏</span> Tweet
        </a>
        <button
          onClick={copyTikTok}
          className="flex items-center gap-1.5 bg-[#010101] border border-white/15 hover:border-white/30 text-white text-xs font-medium px-3 py-1.5 rounded-full transition-colors"
        >
          <span>🎵</span> TikTok szöveg
        </button>
        <button
          onClick={copyLink}
          className="flex items-center gap-1.5 bg-white/8 hover:bg-white/12 text-white text-xs font-medium px-3 py-1.5 rounded-full transition-colors"
        >
          {copied ? <><span>✓</span> Másolva!</> : <><span>🔗</span> Link</>}
        </button>
        <button
          onClick={handleDownload}
          disabled={downloading}
          className="flex items-center gap-1.5 bg-[#e50914]/15 hover:bg-[#e50914]/25 text-[#e50914] text-xs font-medium px-3 py-1.5 rounded-full transition-colors disabled:opacity-50"
        >
          {downloading ? <><span>⏳</span> Generálás…</> : <><span>💾</span> Kép letöltése</>}
        </button>
      </div>
    </div>
  )
}

// ── Fő modal ──────────────────────────────────────────────────────────────────
export default function MomentModal({ moment, onClose }: Props) {
  const { liked, toggle: toggleLike } = useLikes(moment.id)
  const isShorts = moment.platform === 'shorts'

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [onClose])

  return (
    <AnimatePresence>
      {/* Teljes képernyős overlay — scrollozható ha szükséges */}
      <motion.div
        className="fixed inset-0 z-50 overflow-y-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
      >
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black/85 backdrop-blur-md"
          onClick={onClose}
        />

        {/* Tartalom — navbar alatt kezdődik, középre igazítva */}
        <div className="relative min-h-full flex items-start justify-center p-4 pt-20 pb-8">

          {/* Modal kártya */}
          <motion.div
            className={`relative w-full bg-[#141414] rounded-2xl shadow-2xl ${
              isShorts ? 'max-w-sm' : 'max-w-2xl'
            }`}
            initial={{ opacity: 0, scale: 0.88, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 30 }}
            transition={{ type: 'spring', damping: 22, stiffness: 280, mass: 0.8 }}
            onClick={e => e.stopPropagation()}
          >
            {/* ── Bezárás gomb — mindig látható, a modal jobb felső sarkán ── */}
            <motion.button
              onClick={onClose}
              className="absolute top-3 right-3 z-30 w-9 h-9 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-sm border border-white/10 flex items-center justify-center text-white text-sm font-bold transition-colors shadow-lg"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              title="Bezárás (Esc)"
            >
              ✕
            </motion.button>

            {/* ── Video player ── */}
            <div className="overflow-hidden rounded-t-2xl">
              {isShorts ? (
                // Shorts: 9:16 portré — magasság viewport alapján, max 52vh
                // A szélesség a magasságból jön (9:16 arány), középre igazítva
                <div className="flex justify-center bg-black">
                  <div
                    className="relative"
                    style={{
                      height: 'min(52vh, calc((100vw - 2rem) * 16 / 9))',
                      aspectRatio: '9 / 16',
                    }}
                  >
                    <iframe
                      className="absolute inset-0 w-full h-full"
                      src={`https://www.youtube.com/embed/${moment.youtubeId}?rel=0&autoplay=1`}
                      title={moment.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                </div>
              ) : (
                // Regular: 16:9 fekvő
                <div className="relative w-full" style={{ paddingTop: '56.25%' }}>
                  <iframe
                    className="absolute inset-0 w-full h-full"
                    src={`https://www.youtube.com/embed/${moment.youtubeId}?rel=0&autoplay=1`}
                    title={moment.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              )}
            </div>

            {/* ── Info panel ── */}
            <div className="p-4 sm:p-5">
              {/* Fejléc: cím + like gomb */}
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <h2 className="text-white text-lg sm:text-xl font-bold leading-tight pr-2">
                    {moment.title}
                  </h2>
                  <div className="flex flex-wrap items-center gap-2 mt-1.5 text-sm">
                    <span className="text-green-400 font-semibold">{moment.viralScore}% virális</span>
                    <span className="text-gray-600">·</span>
                    <span className="text-gray-400">{moment.year}</span>
                    <span className="text-gray-600">·</span>
                    <span className="text-gray-400">{formatDuration(moment.duration)}</span>
                    {isShorts && (
                      <>
                        <span className="text-gray-600">·</span>
                        <span className="bg-[#e50914]/20 text-[#e50914] text-xs font-bold px-2 py-0.5 rounded">
                          SHORTS
                        </span>
                      </>
                    )}
                    <span
                      className="px-2 py-0.5 rounded text-xs font-medium"
                      style={{ background: moment.category?.color + '22', color: moment.category?.color }}
                    >
                      {moment.category?.name}
                    </span>
                  </div>
                </div>

                {/* Like gomb */}
                <motion.button
                  onClick={toggleLike}
                  className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                    liked
                      ? 'bg-red-500/15 border-red-500/40 text-red-400'
                      : 'bg-white/8 border-white/15 text-gray-300 hover:border-white/30 hover:text-white'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <span>{liked ? '❤️' : '🤍'}</span>
                  <span>{liked ? 'Kedvelt' : 'Kedvelés'}</span>
                </motion.button>
              </div>

              <p className="text-gray-300 text-sm mt-3 leading-relaxed">
                {moment.description}
              </p>

              {/* Viral score sáv */}
              <div className="mt-4">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>Virális pontszám</span>
                  <span className="text-gray-300 font-medium">{moment.viralScore}/100</span>
                </div>
                <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: `linear-gradient(90deg, #f59e0b, #ef4444 ${moment.viralScore}%)` }}
                    initial={{ width: 0 }}
                    animate={{ width: `${moment.viralScore}%` }}
                    transition={{ duration: 0.9, delay: 0.25, ease: 'easeOut' }}
                  />
                </div>
              </div>

              {/* Tagek */}
              {moment.tags?.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {moment.tags.map(tag => (
                    <span
                      key={tag}
                      className="text-xs bg-white/8 text-gray-400 px-2 py-0.5 rounded-full border border-white/10"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Share gombok */}
              <ShareButtons moment={moment} />
            </div>
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
