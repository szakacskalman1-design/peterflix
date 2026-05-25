import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
// Navbar removed — TopHeader + BottomNav used via App.tsx layout
import { useMoments } from '../hooks/useMoments'
import type { Moment } from '../types'

// ── Betűtípus opciók ──────────────────────────────────────────────────────────
const FONTS = [
  { label: 'Impact (mém)', value: 'Impact, Arial Black, sans-serif' },
  { label: 'Arial Black', value: 'Arial Black, sans-serif' },
  { label: 'Comic Sans', value: '"Comic Sans MS", cursive' },
  { label: 'Bebas (modern)', value: 'system-ui, sans-serif' },
]

const COLORS = [
  { label: 'Fehér', value: '#ffffff' },
  { label: 'Sárga', value: '#FFE600' },
  { label: 'Piros', value: '#e50914' },
  { label: 'Fekete', value: '#000000' },
  { label: 'Zöld', value: '#4ade80' },
  { label: 'Kék', value: '#60a5fa' },
]

const STROKE_COLORS = [
  { label: 'Fekete', value: '#000000' },
  { label: 'Fehér', value: '#ffffff' },
  { label: 'Nincs', value: '' },
]

// ── Canvas rajzolás ───────────────────────────────────────────────────────────
function drawMeme(
  canvas: HTMLCanvasElement,
  img: HTMLImageElement | null,
  topText: string,
  bottomText: string,
  fontFamily: string,
  textColor: string,
  strokeColor: string,
  fontSize: number,
  _thumbUrl: string,
) {
  const ctx = canvas.getContext('2d')!
  const W = canvas.width
  const H = canvas.height

  // Háttér
  ctx.fillStyle = '#111'
  ctx.fillRect(0, 0, W, H)

  // Kép
  if (img && img.complete && img.naturalWidth > 0) {
    // Középre crop (object-cover stílus)
    const imgRatio = img.naturalWidth / img.naturalHeight
    const canvasRatio = W / H
    let sx = 0, sy = 0, sw = img.naturalWidth, sh = img.naturalHeight
    if (imgRatio > canvasRatio) {
      sw = img.naturalHeight * canvasRatio
      sx = (img.naturalWidth - sw) / 2
    } else {
      sh = img.naturalWidth / canvasRatio
      sy = (img.naturalHeight - sh) / 2
    }
    ctx.drawImage(img, sx, sy, sw, sh, 0, 0, W, H)
  } else {
    // Fallback háttér ha nincs kép
    const grad = ctx.createLinearGradient(0, 0, W, H)
    grad.addColorStop(0, '#1a1a2e')
    grad.addColorStop(1, '#16213e')
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, W, H)
  }

  // Sötét gradient overlay (tetején és alján a szöveghez)
  if (topText) {
    const topGrad = ctx.createLinearGradient(0, 0, 0, H * 0.35)
    topGrad.addColorStop(0, 'rgba(0,0,0,0.6)')
    topGrad.addColorStop(1, 'rgba(0,0,0,0)')
    ctx.fillStyle = topGrad
    ctx.fillRect(0, 0, W, H * 0.35)
  }
  if (bottomText) {
    const botGrad = ctx.createLinearGradient(0, H * 0.65, 0, H)
    botGrad.addColorStop(0, 'rgba(0,0,0,0)')
    botGrad.addColorStop(1, 'rgba(0,0,0,0.6)')
    ctx.fillStyle = botGrad
    ctx.fillRect(0, H * 0.65, W, H * 0.35)
  }

  // Szöveg rajzolás segédfüggvény (automatikus sortörés)
  function drawText(text: string, y: number, align: 'top' | 'bottom') {
    if (!text.trim()) return

    const size = Math.round(fontSize * (W / 500))
    ctx.font = `900 ${size}px ${fontFamily}`
    ctx.textAlign = 'center'
    ctx.textBaseline = align === 'top' ? 'top' : 'bottom'

    // Szó szerinti törés ha túl hosszú
    const maxW = W * 0.9
    const words = text.toUpperCase().split(' ')
    const lines: string[] = []
    let current = ''
    for (const word of words) {
      const test = current ? `${current} ${word}` : word
      if (ctx.measureText(test).width > maxW && current) {
        lines.push(current)
        current = word
      } else {
        current = test
      }
    }
    if (current) lines.push(current)

    const lineH = size * 1.2
    lines.forEach((line, i) => {
      const lineY = align === 'top'
        ? y + i * lineH
        : y - (lines.length - 1 - i) * lineH

      // Körvonal
      if (strokeColor) {
        ctx.strokeStyle = strokeColor
        ctx.lineWidth = size * 0.12
        ctx.lineJoin = 'round'
        ctx.strokeText(line, W / 2, lineY)
      }
      // Szöveg
      ctx.fillStyle = textColor
      ctx.fillText(line, W / 2, lineY)
    })
  }

  // Felső szöveg
  drawText(topText, H * 0.04, 'top')

  // Alsó szöveg
  drawText(bottomText, H * 0.96, 'bottom')

  // péterflix.hu vízjel (jobb alsó sarok)
  const wSize = Math.round(16 * (W / 500))
  ctx.font = `bold ${wSize}px system-ui, sans-serif`
  ctx.textAlign = 'right'
  ctx.textBaseline = 'bottom'
  ctx.fillStyle = 'rgba(255,255,255,0.45)'
  ctx.fillText('péterflix.hu', W - 10, H - 8)
}

// ── Klip választó ─────────────────────────────────────────────────────────────
function MomentPicker({ onSelect }: { onSelect: (m: Moment) => void }) {
  const { moments, loading } = useMoments()
  const [filter, setFilter] = useState('')

  const filtered = moments.filter(m =>
    m.title.toLowerCase().includes(filter.toLowerCase())
  )

  if (loading) return (
    <div className="text-center py-16 text-gray-400 animate-pulse">Betöltés…</div>
  )

  return (
    <div>
      <input
        type="text"
        placeholder="🔍 Keresés a klipek között…"
        value={filter}
        onChange={e => setFilter(e.target.value)}
        className="w-full bg-[#222] text-white rounded-xl px-4 py-3 text-sm outline-none focus:ring-1 focus:ring-[#e50914] placeholder-gray-600 mb-4"
      />
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 max-h-72 overflow-y-auto pr-1">
        {filtered.map(m => (
          <motion.button
            key={m.id}
            className="relative rounded-lg overflow-hidden group cursor-pointer"
            style={{ aspectRatio: m.platform === 'shorts' ? '9/16' : '16/9' }}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onSelect(m)}
          >
            <img
              src={`https://img.youtube.com/vi/${m.youtubeId}/mqdefault.jpg`}
              alt={m.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <span className="text-white text-xs font-bold text-center px-1 line-clamp-2">{m.title}</span>
            </div>
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-1">
              <p className="text-white text-[9px] font-medium line-clamp-1">{m.title}</p>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  )
}

// ── Fő oldal ──────────────────────────────────────────────────────────────────
export default function Meme() {
  const [selectedMoment, setSelectedMoment] = useState<Moment | null>(null)
  const [topText, setTopText] = useState('')
  const [bottomText, setBottomText] = useState('')
  const [fontFamily, setFontFamily] = useState(FONTS[0].value)
  const [textColor, setTextColor] = useState('#ffffff')
  const [strokeColor, setStrokeColor] = useState('#000000')
  const [fontSize, setFontSize] = useState(52)
  const [step, setStep] = useState<'pick' | 'edit'>('pick')
  const [copied, setCopied] = useState(false)

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const imgRef = useRef<HTMLImageElement | null>(null)
  const [imgLoaded, setImgLoaded] = useState(false)

  // Kép betöltése
  useEffect(() => {
    if (!selectedMoment) return
    setImgLoaded(false)
    const img = new Image()
    img.crossOrigin = 'anonymous'
    const thumbUrl = `https://img.youtube.com/vi/${selectedMoment.youtubeId}/maxresdefault.jpg`
    img.onload = () => {
      imgRef.current = img
      setImgLoaded(true)
    }
    img.onerror = () => {
      // Fallback alacsonyabb minőségű thumb
      const img2 = new Image()
      img2.crossOrigin = 'anonymous'
      img2.onload = () => { imgRef.current = img2; setImgLoaded(true) }
      img2.onerror = () => { imgRef.current = null; setImgLoaded(true) }
      img2.src = `https://img.youtube.com/vi/${selectedMoment.youtubeId}/hqdefault.jpg`
    }
    img.src = thumbUrl
  }, [selectedMoment])

  // Canvas újrarajzolás
  const redraw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas || !selectedMoment) return
    drawMeme(
      canvas,
      imgRef.current,
      topText,
      bottomText,
      fontFamily,
      textColor,
      strokeColor,
      fontSize,
      `https://img.youtube.com/vi/${selectedMoment.youtubeId}/maxresdefault.jpg`,
    )
  }, [selectedMoment, topText, bottomText, fontFamily, textColor, strokeColor, fontSize, imgLoaded])

  useEffect(() => { redraw() }, [redraw])

  // Letöltés
  function download() {
    const canvas = canvasRef.current
    if (!canvas) return
    canvas.toBlob(blob => {
      if (!blob) return
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `peterflix-mem-${Date.now()}.png`
      a.click()
      URL.revokeObjectURL(url)
    }, 'image/png')
  }

  // TikTok szöveg másolás
  async function copyTikTok() {
    const text = `${selectedMoment?.title ?? ''} 😂 Készítsd el te is: péterflix.hu #PéterFlix #MagyarPéter #Mém`
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  // Canvas méret (16:9 fix)
  const CANVAS_W = 1000
  const CANVAS_H = 562

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <div className="pt-14 pb-20 px-4 sm:px-6 max-w-5xl mx-auto">
        {/* Fejléc */}
        <div className="mb-8">
          <h1 className="text-white text-3xl sm:text-4xl font-black mb-1">
            😂 Mém <span className="text-[#e50914]">Generátor</span>
          </h1>
          <p className="text-gray-400 text-sm">Válassz egy klipet, írj szöveget, töltsd le és oszd meg!</p>
        </div>

        {/* Lépés jelző */}
        <div className="flex items-center gap-3 mb-8">
          {(['pick', 'edit'] as const).map((s, i) => (
            <div key={s} className="flex items-center gap-3">
              {i > 0 && <div className="w-8 h-px bg-gray-700" />}
              <button
                onClick={() => s === 'pick' && setStep('pick')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  step === s
                    ? 'bg-[#e50914] text-white'
                    : s === 'edit' && !selectedMoment
                      ? 'text-gray-600 cursor-not-allowed'
                      : 'text-gray-400 hover:text-white'
                }`}
              >
                <span className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold">
                  {i + 1}
                </span>
                {s === 'pick' ? 'Klip választás' : 'Szerkesztés'}
              </button>
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* ── 1. LÉPÉS: Klip választás ── */}
          {step === 'pick' && (
            <motion.div
              key="pick"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <div className="bg-[#141414] rounded-2xl p-5">
                <h2 className="text-white font-bold mb-4">Válassz egy klipet alapnak</h2>
                <MomentPicker onSelect={m => {
                  setSelectedMoment(m)
                  setStep('edit')
                }} />
              </div>
            </motion.div>
          )}

          {/* ── 2. LÉPÉS: Szerkesztő ── */}
          {step === 'edit' && selectedMoment && (
            <motion.div
              key="edit"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-6"
            >
              {/* Bal: Canvas előnézet */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-white font-bold">Előnézet</h2>
                  <button
                    onClick={() => setStep('pick')}
                    className="text-xs text-gray-400 hover:text-white transition-colors"
                  >
                    ← Másik klip
                  </button>
                </div>

                {/* Canvas */}
                <div className="relative rounded-xl overflow-hidden bg-black shadow-2xl">
                  <canvas
                    ref={canvasRef}
                    width={CANVAS_W}
                    height={CANVAS_H}
                    className="w-full h-auto block"
                  />
                  {!imgLoaded && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                      <div className="text-gray-400 text-sm animate-pulse">Kép betöltése…</div>
                    </div>
                  )}
                </div>

                {/* Letöltés + TikTok */}
                <div className="flex gap-3 mt-4">
                  <motion.button
                    onClick={download}
                    className="flex-1 flex items-center justify-center gap-2 bg-[#e50914] hover:bg-red-700 text-white font-bold py-3 rounded-xl transition-colors text-sm"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span>💾</span> Letöltés (PNG)
                  </motion.button>
                  <motion.button
                    onClick={copyTikTok}
                    className={`flex-1 flex items-center justify-center gap-2 font-bold py-3 rounded-xl transition-colors text-sm border ${
                      copied
                        ? 'bg-green-500/15 border-green-500/40 text-green-400'
                        : 'bg-white/8 border-white/15 text-white hover:bg-white/12'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span>{copied ? '✓' : '🎵'}</span>
                    {copied ? 'Szöveg másolva!' : 'TikTok szöveg'}
                  </motion.button>
                </div>
              </div>

              {/* Jobb: Szerkesztő panel */}
              <div className="space-y-5">
                {/* Szövegek */}
                <div className="bg-[#141414] rounded-2xl p-5">
                  <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wide">Szöveg</h3>

                  <div className="space-y-3">
                    <div>
                      <label className="text-gray-400 text-xs mb-1.5 block">Felső szöveg</label>
                      <input
                        type="text"
                        placeholder="pl. AMIKOR PÉTER..."
                        value={topText}
                        onChange={e => setTopText(e.target.value)}
                        className="w-full bg-[#222] text-white rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-1 focus:ring-[#e50914] placeholder-gray-600"
                      />
                    </div>
                    <div>
                      <label className="text-gray-400 text-xs mb-1.5 block">Alsó szöveg</label>
                      <input
                        type="text"
                        placeholder="pl. AZ EGÉSZ ORSZÁG:"
                        value={bottomText}
                        onChange={e => setBottomText(e.target.value)}
                        className="w-full bg-[#222] text-white rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-1 focus:ring-[#e50914] placeholder-gray-600"
                      />
                    </div>
                  </div>
                </div>

                {/* Betűméret */}
                <div className="bg-[#141414] rounded-2xl p-5">
                  <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wide">Betűméret</h3>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min={24}
                      max={96}
                      value={fontSize}
                      onChange={e => setFontSize(Number(e.target.value))}
                      className="flex-1 accent-[#e50914]"
                    />
                    <span className="text-white text-sm font-bold w-8 text-right">{fontSize}</span>
                  </div>
                </div>

                {/* Betűtípus */}
                <div className="bg-[#141414] rounded-2xl p-5">
                  <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wide">Betűtípus</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {FONTS.map(f => (
                      <button
                        key={f.value}
                        onClick={() => setFontFamily(f.value)}
                        className={`px-3 py-2 rounded-xl text-sm transition-colors text-left ${
                          fontFamily === f.value
                            ? 'bg-[#e50914] text-white font-bold'
                            : 'bg-[#222] text-gray-300 hover:bg-[#2a2a2a]'
                        }`}
                        style={{ fontFamily: f.value }}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Szín */}
                <div className="bg-[#141414] rounded-2xl p-5">
                  <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wide">Szöveg színe</h3>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {COLORS.map(c => (
                      <button
                        key={c.value}
                        onClick={() => setTextColor(c.value)}
                        title={c.label}
                        className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${
                          textColor === c.value ? 'border-white scale-110' : 'border-transparent'
                        }`}
                        style={{ background: c.value }}
                      />
                    ))}
                    {/* Egyedi szín */}
                    <label className="w-8 h-8 rounded-full border-2 border-dashed border-gray-600 hover:border-white transition-colors cursor-pointer flex items-center justify-center overflow-hidden" title="Egyedi szín">
                      <span className="text-gray-400 text-xs">+</span>
                      <input
                        type="color"
                        value={textColor}
                        onChange={e => setTextColor(e.target.value)}
                        className="absolute opacity-0 w-0 h-0"
                      />
                    </label>
                  </div>

                  <h3 className="text-white font-semibold mb-3 text-sm uppercase tracking-wide">Körvonal</h3>
                  <div className="flex gap-2">
                    {STROKE_COLORS.map(c => (
                      <button
                        key={c.value + c.label}
                        onClick={() => setStrokeColor(c.value)}
                        className={`px-3 py-1.5 rounded-lg text-xs transition-colors ${
                          strokeColor === c.value
                            ? 'bg-[#e50914] text-white font-bold'
                            : 'bg-[#222] text-gray-300 hover:bg-[#2a2a2a]'
                        }`}
                      >
                        {c.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
