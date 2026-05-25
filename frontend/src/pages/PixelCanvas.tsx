import { useRef, useEffect, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
// Navbar removed — TopHeader + BottomNav via App.tsx
import { isLoggedIn } from '../lib/api'
import api from '../lib/api'
import { usePixelSocket } from '../hooks/usePixelSocket'

// ── Konstansok ────────────────────────────────────────────────────────────────
const BOARD_SIZE    = 100
const COOLDOWN_MS   = 10_000
const COOLDOWN_KEY  = 'peterflix_pixel_cooldown'
const DEFAULT_COLOR = '#141414'

const PALETTE = [
  '#ffffff', '#e50914', '#ff6b35', '#ffd700',
  '#4ade80', '#22d3ee', '#3b82f6', '#a855f7',
  '#ec4899', '#f97316', '#000000', '#6b7280',
]

function sparseToArray(sparse: Record<string, string>): string[] {
  const arr = new Array<string>(BOARD_SIZE * BOARD_SIZE).fill(DEFAULT_COLOR)
  for (const [key, color] of Object.entries(sparse)) {
    const [xs, ys] = key.split(',')
    const x = parseInt(xs), y = parseInt(ys)
    if (x >= 0 && x < BOARD_SIZE && y >= 0 && y < BOARD_SIZE)
      arr[y * BOARD_SIZE + x] = color
  }
  return arr
}

export default function PixelCanvas() {
  const canvasRef    = useRef<HTMLCanvasElement>(null)
  const pixelsRef    = useRef<string[]>(new Array(BOARD_SIZE * BOARD_SIZE).fill(DEFAULT_COLOR))
  // A scrollozható konténer (canvas körüli doboz)
  const containerRef = useRef<HTMLDivElement>(null)
  // A "szabad terület" mérésére — EGYETLEN wrapper, mindig látható
  const wrapperRef   = useRef<HTMLDivElement>(null)

  const [loaded,        setLoaded]        = useState(false)
  const [selectedColor, setSelectedColor] = useState('#e50914')
  const [zoom,          setZoom]          = useState(1)
  // squareSize: az aktuálisan mért négyzet oldalhossza px-ben
  const [squareSize,    setSquareSize]    = useState(300)
  const [hoverCoord,    setHoverCoord]    = useState<{ x: number; y: number } | null>(null)
  const [cooldownLeft,  setCooldownLeft]  = useState(0)
  const [drawTick,      setDrawTick]      = useState(0)
  const [justPlaced,    setJustPlaced]    = useState(false)
  const [wsStatus,      setWsStatus]      = useState<'connected' | 'disconnected'>('disconnected')
  const adminLoggedIn = isLoggedIn()

  // Stale-closure-safe refek
  const zoomRef          = useRef(zoom)
  const squareSizeRef    = useRef(squareSize)
  const cooldownLeftRef  = useRef(cooldownLeft)
  const selectedColorRef = useRef(selectedColor)
  useEffect(() => { zoomRef.current = zoom },             [zoom])
  useEffect(() => { squareSizeRef.current = squareSize }, [squareSize])
  useEffect(() => { cooldownLeftRef.current = cooldownLeft }, [cooldownLeft])
  useEffect(() => { selectedColorRef.current = selectedColor }, [selectedColor])

  // ── ResizeObserver — egyetlen wrapperRef mérése ───────────────────────────
  useEffect(() => {
    function measure() {
      const el = wrapperRef.current
      if (!el) return
      const { width, height } = el.getBoundingClientRect()
      const s = Math.floor(Math.min(width, height))
      if (s > 20) {
        squareSizeRef.current = s
        setSquareSize(s)
      }
    }
    // Rövid delay, hogy a flex layout teljesen lerendeződjön
    const t = setTimeout(measure, 30)
    const ro = new ResizeObserver(measure)
    if (wrapperRef.current) ro.observe(wrapperRef.current)
    return () => { clearTimeout(t); ro.disconnect() }
  }, [])

  // pixel mérete CSS px-ben
  const pixelSize = (squareSize / BOARD_SIZE) * zoom

  // ── Canvas rajzolás ───────────────────────────────────────────────────────
  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas || squareSizeRef.current < 20) return
    const ctx = canvas.getContext('2d')!
    const dim = Math.round(BOARD_SIZE * pixelSize)
    canvas.width  = dim
    canvas.height = dim

    const px = pixelsRef.current
    for (let y = 0; y < BOARD_SIZE; y++) {
      for (let x = 0; x < BOARD_SIZE; x++) {
        ctx.fillStyle = px[y * BOARD_SIZE + x]
        ctx.fillRect(
          Math.round(x * pixelSize),
          Math.round(y * pixelSize),
          Math.ceil(pixelSize),
          Math.ceil(pixelSize),
        )
      }
    }
    if (zoom >= 2) {
      ctx.beginPath()
      ctx.strokeStyle = 'rgba(255,255,255,0.07)'
      ctx.lineWidth = 0.5
      for (let i = 0; i <= BOARD_SIZE; i++) {
        const p = Math.round(i * pixelSize)
        ctx.moveTo(p, 0); ctx.lineTo(p, dim)
        ctx.moveTo(0, p); ctx.lineTo(dim, p)
      }
      ctx.stroke()
    }
  }, [pixelSize, zoom])

  useEffect(() => { drawCanvas() }, [drawCanvas, drawTick])

  // ── Board betöltése ───────────────────────────────────────────────────────
  const fetchBoard = useCallback(async () => {
    try {
      const res = await api.get<{ pixels: Record<string, string> }>('/pixelboard')
      pixelsRef.current = sparseToArray(res.data.pixels)
      setDrawTick(t => t + 1)
    } catch {}
  }, [])

  useEffect(() => {
    fetchBoard().finally(() => setLoaded(true))
  }, [fetchBoard])

  // ── WebSocket ─────────────────────────────────────────────────────────────
  usePixelSocket({
    onPixel: ({ x, y, color }) => {
      const newPx = [...pixelsRef.current]
      newPx[y * BOARD_SIZE + x] = color
      pixelsRef.current = newPx
      setDrawTick(t => t + 1)
    },
    onReset: () => {
      pixelsRef.current = new Array(BOARD_SIZE * BOARD_SIZE).fill(DEFAULT_COLOR)
      setDrawTick(t => t + 1)
    },
    onStatus: setWsStatus,
  })

  // ── Cooldown ──────────────────────────────────────────────────────────────
  useEffect(() => {
    const tick = () => {
      const last = parseInt(localStorage.getItem(COOLDOWN_KEY) || '0')
      setCooldownLeft(Math.max(0, COOLDOWN_MS - (Date.now() - last)))
    }
    tick()
    const id = setInterval(tick, 200)
    return () => clearInterval(id)
  }, [])

  // ── Koordináta (canvas rect alapján — DPR/scale független) ────────────────
  function getCoord(clientX: number, clientY: number) {
    const rect = canvasRef.current!.getBoundingClientRect()
    const ps   = rect.width / BOARD_SIZE
    return {
      x: Math.max(0, Math.min(BOARD_SIZE - 1, Math.floor((clientX - rect.left) / ps))),
      y: Math.max(0, Math.min(BOARD_SIZE - 1, Math.floor((clientY - rect.top)  / ps))),
    }
  }

  // ── Pixel lehelyezés ──────────────────────────────────────────────────────
  async function placePixel(x: number, y: number, color: string) {
    const idx = y * BOARD_SIZE + x
    if (pixelsRef.current[idx] === color) return
    const newPx = [...pixelsRef.current]
    newPx[idx] = color
    pixelsRef.current = newPx
    setDrawTick(t => t + 1)
    localStorage.setItem(COOLDOWN_KEY, String(Date.now()))
    setCooldownLeft(COOLDOWN_MS)
    setJustPlaced(true)
    setTimeout(() => setJustPlaced(false), 600)
    try { await api.post('/pixelboard/pixel', { x, y, color }) } catch {}
  }

  // ── Desktop: kattintás + húzás ────────────────────────────────────────────
  // Kattintás (mozgás nélkül) → pixel lehelyezés
  // Húzás → pásztázás (pan)
  const mouseDownRef = useRef<{ x: number; y: number; sl: number; st: number } | null>(null)
  const mouseDraggedRef = useRef(false)
  const [isDragging, setIsDragging] = useState(false)

  function handleMouseDown(e: React.MouseEvent<HTMLCanvasElement>) {
    if (e.button !== 0) return   // csak bal gomb
    mouseDraggedRef.current = false
    mouseDownRef.current = {
      x: e.clientX,
      y: e.clientY,
      sl: containerRef.current?.scrollLeft ?? 0,
      st: containerRef.current?.scrollTop  ?? 0,
    }
  }

  function handleMouseMove(e: React.MouseEvent<HTMLCanvasElement>) {
    // Hover koordináta frissítése (ha nem húzunk)
    if (!mouseDraggedRef.current) {
      setHoverCoord(getCoord(e.clientX, e.clientY))
    }

    if (!mouseDownRef.current || !(e.buttons & 1)) return

    const dx = e.clientX - mouseDownRef.current.x
    const dy = e.clientY - mouseDownRef.current.y

    // 4px threshold után indítjuk a pant (véletlen el ne mozduljon)
    if (!mouseDraggedRef.current && (Math.abs(dx) > 4 || Math.abs(dy) > 4)) {
      mouseDraggedRef.current = true
      setIsDragging(true)
    }

    if (mouseDraggedRef.current && containerRef.current) {
      containerRef.current.scrollLeft = mouseDownRef.current.sl - dx
      containerRef.current.scrollTop  = mouseDownRef.current.st - dy
    }
  }

  function handleMouseUp(e: React.MouseEvent<HTMLCanvasElement>) {
    if (e.button !== 0) return
    // Ha nem volt húzás → pixel lehelyezés
    if (!mouseDraggedRef.current && cooldownLeftRef.current === 0) {
      const { x, y } = getCoord(e.clientX, e.clientY)
      placePixel(x, y, selectedColorRef.current)
    }
    mouseDownRef.current    = null
    mouseDraggedRef.current = false
    setIsDragging(false)
  }

  function handleMouseLeave() {
    setHoverCoord(null)
    // Ha a kurzor elhagyja a canvast húzás közben → húzást befejezzük
    if (mouseDraggedRef.current) {
      mouseDownRef.current    = null
      mouseDraggedRef.current = false
      setIsDragging(false)
    }
  }

  // ── Mobil: pinch zoom + egy- és kétujjas pan + tap ────────────────────────
  // 1 ujj tap (mozgás nélkül) → pixel lehelyezés
  // 1 ujj húzás               → pásztázás
  // 2 ujj csípés              → zoom
  // 2 ujj húzás               → pásztázás
  const pinchRef     = useRef<{ dist: number; startZoom: number } | null>(null)
  const multiPanRef  = useRef<{ cx: number; cy: number; sl: number; st: number } | null>(null)
  const singleTouchRef = useRef<{ x: number; y: number; sl: number; st: number; moved: boolean } | null>(null)

  function pinchDist(t: React.TouchList) {
    return Math.hypot(t[1].clientX - t[0].clientX, t[1].clientY - t[0].clientY)
  }

  function handleTouchStart(e: React.TouchEvent<HTMLCanvasElement>) {
    if (e.touches.length === 1) {
      // Egyujjas: tap vagy pan
      singleTouchRef.current = {
        x:     e.touches[0].clientX,
        y:     e.touches[0].clientY,
        sl:    containerRef.current?.scrollLeft ?? 0,
        st:    containerRef.current?.scrollTop  ?? 0,
        moved: false,
      }
      pinchRef.current    = null
      multiPanRef.current = null
    } else if (e.touches.length === 2) {
      // Kétujjas: pinch + pan
      singleTouchRef.current = null
      pinchRef.current = { dist: pinchDist(e.touches), startZoom: zoomRef.current }
      multiPanRef.current = {
        cx: (e.touches[0].clientX + e.touches[1].clientX) / 2,
        cy: (e.touches[0].clientY + e.touches[1].clientY) / 2,
        sl: containerRef.current?.scrollLeft ?? 0,
        st: containerRef.current?.scrollTop  ?? 0,
      }
    }
  }

  function handleTouchMove(e: React.TouchEvent<HTMLCanvasElement>) {
    e.preventDefault()

    if (e.touches.length === 1 && singleTouchRef.current) {
      // Egyujjas pan
      const t  = e.touches[0]
      const dx = t.clientX - singleTouchRef.current.x
      const dy = t.clientY - singleTouchRef.current.y

      if (!singleTouchRef.current.moved && (Math.abs(dx) > 5 || Math.abs(dy) > 5)) {
        singleTouchRef.current.moved = true
      }
      if (singleTouchRef.current.moved && containerRef.current) {
        containerRef.current.scrollLeft = singleTouchRef.current.sl - dx
        containerRef.current.scrollTop  = singleTouchRef.current.st - dy
      }

    } else if (e.touches.length === 2 && pinchRef.current) {
      // Kétujjas: zoom
      const ratio   = pinchDist(e.touches) / pinchRef.current.dist
      const snapped = Math.max(1, Math.min(6, Math.round(pinchRef.current.startZoom * ratio)))
      if (snapped !== zoomRef.current) setZoom(snapped)
      // Kétujjas: pan
      if (multiPanRef.current && containerRef.current) {
        const cx = (e.touches[0].clientX + e.touches[1].clientX) / 2
        const cy = (e.touches[0].clientY + e.touches[1].clientY) / 2
        containerRef.current.scrollLeft = multiPanRef.current.sl + (multiPanRef.current.cx - cx)
        containerRef.current.scrollTop  = multiPanRef.current.st + (multiPanRef.current.cy - cy)
      }
    }
  }

  function handleTouchEnd(e: React.TouchEvent<HTMLCanvasElement>) {
    if (e.touches.length < 2) { pinchRef.current = null; multiPanRef.current = null }

    // Tap (egyujjas, nem mozdult) → pixel lehelyezés
    if (
      singleTouchRef.current &&
      !singleTouchRef.current.moved &&
      e.changedTouches.length === 1 &&
      cooldownLeftRef.current === 0
    ) {
      const t = e.changedTouches[0]
      const { x, y } = getCoord(t.clientX, t.clientY)
      placePixel(x, y, selectedColorRef.current)
    }
    if (e.touches.length === 0) singleTouchRef.current = null
  }

  // ── Admin ─────────────────────────────────────────────────────────────────
  async function handleReset() {
    if (!window.confirm('Törlöd a teljes vásznat?')) return
    try { await api.delete('/pixelboard') } catch {}
  }

  const canPlace     = cooldownLeft === 0
  const cooldownSecs = Math.ceil(cooldownLeft / 1000)
  const pct          = ((COOLDOWN_MS - cooldownLeft) / COOLDOWN_MS) * 100

  // ── Paletta ───────────────────────────────────────────────────────────────
  function PaletteGrid({ cols }: { cols: number }) {
    return (
      <div className="grid gap-1.5" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
        {PALETTE.map(color => (
          <motion.button
            key={color}
            onClick={() => setSelectedColor(color)}
            className="rounded-full border-2 aspect-square"
            style={{
              background:  color,
              borderColor: selectedColor === color ? '#fff' : 'rgba(255,255,255,0.12)',
            }}
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.85 }}
            title={color}
          />
        ))}
        <label className="relative cursor-pointer aspect-square" title="Egyéni szín">
          <input
            type="color"
            value={selectedColor}
            onChange={e => setSelectedColor(e.target.value)}
            className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
          />
          <motion.div
            className="w-full h-full rounded-full border-2 flex items-center justify-center text-[10px] text-white/60 font-bold"
            style={{
              background:  PALETTE.includes(selectedColor) ? '#2a2a2a' : selectedColor,
              borderColor: !PALETTE.includes(selectedColor) ? '#fff' : 'rgba(255,255,255,0.12)',
            }}
            whileHover={{ scale: 1.15 }}
          >✏</motion.div>
        </label>
      </div>
    )
  }

  // ── Canvas konténer (közös) ───────────────────────────────────────────────
  const canvasContainer = (
    <div
      ref={containerRef}
      className="rounded-xl border border-white/10 bg-[#0d0d0d] flex-shrink-0"
      style={{
        width:    squareSize,
        height:   squareSize,
        overflow: zoom > 1 ? 'auto' : 'hidden',
      }}
    >
      {!loaded ? (
        <div
          className="flex items-center justify-center text-gray-600 text-sm"
          style={{ width: squareSize * zoom, height: squareSize * zoom }}
        >
          ⏳ Betöltés…
        </div>
      ) : (
        <canvas
          ref={canvasRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          style={{
            display: 'block',
            cursor: isDragging
              ? 'grabbing'
              : zoom > 1
                ? 'grab'
                : canPlace ? 'crosshair' : 'not-allowed',
            touchAction: 'none',
            imageRendering: 'pixelated',
            userSelect: 'none',
          }}
        />
      )}
    </div>
  )

  // ══════════════════════════════════════════════════════════════════════════
  // RENDER
  // ══════════════════════════════════════════════════════════════════════════
  return (
    <div
      className="bg-[#0a0a0a] flex flex-col select-none"
      style={{ height: '100dvh', overflow: 'hidden' }}
    >
      {/* TopHeader spacer */}
      <div style={{ height: 50, flexShrink: 0 }} />

      <div className="flex flex-col flex-1 min-h-0 px-3 sm:px-4" style={{ overflow: 'hidden' }}>

        {/* Fejléc */}
        <div className="flex-shrink-0 pt-1 pb-2">
          <h1 className="text-lg font-black text-white leading-tight">
            🎨 Pixel<span className="text-[#e50914]">Csata</span>
          </h1>
          <p className="text-gray-600 text-[10px]">
            Közösségi vászon · {BOARD_SIZE}×{BOARD_SIZE} · valós idejű szinkron
          </p>
        </div>

        {/* ═══ Fő terület — col mobilon, row desktopon ═══ */}
        <div className="flex-1 min-h-0 flex flex-col md:flex-row gap-3 overflow-hidden">

          {/* ── Mobil kontrollok (felül, csak mobilon) ── */}
          <div className="md:hidden flex-shrink-0 flex flex-col gap-2">

            {/* Sor 1: státusz + cooldown + zoom + szín */}
            <div className="flex flex-wrap items-center gap-2">
              <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${
                wsStatus === 'connected'
                  ? 'text-green-400 border-green-500/25 bg-green-500/8'
                  : 'text-gray-500 border-white/10'
              }`}>
                {wsStatus === 'connected' ? '🟢 Élő' : '⚪ Offline'}
              </span>

              <motion.span
                className={`text-xs px-2.5 py-0.5 rounded-full font-semibold border ${
                  canPlace
                    ? 'bg-green-500/15 text-green-400 border-green-500/30'
                    : 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30'
                }`}
                animate={justPlaced ? { scale: [1, 1.12, 1] } : {}}
                transition={{ duration: 0.3 }}
              >
                {canPlace ? '✓ Rajzolhatsz!' : `⏳ ${cooldownSecs}mp`}
              </motion.span>

              <div className="flex items-center gap-1 ml-auto">
                <button onClick={() => setZoom(z => Math.max(1, z - 1))} disabled={zoom <= 1}
                  className="w-6 h-6 rounded bg-white/8 hover:bg-white/15 text-white text-sm font-bold disabled:opacity-25">−</button>
                <span className="text-gray-300 text-xs font-mono w-6 text-center">{zoom}×</span>
                <button onClick={() => setZoom(z => Math.min(6, z + 1))} disabled={zoom >= 6}
                  className="w-6 h-6 rounded bg-white/8 hover:bg-white/15 text-white text-sm font-bold disabled:opacity-25">+</button>
              </div>

              <div className="flex items-center gap-1.5">
                <div className="w-4 h-4 rounded-full border border-white/20 flex-shrink-0" style={{ background: selectedColor }} />
                <span className="text-gray-400 text-[10px] font-mono">{selectedColor}</span>
              </div>
            </div>

            {/* Cooldown progress */}
            {cooldownLeft > 0 && (
              <div className="h-0.5 bg-gray-800 rounded-full overflow-hidden">
                <div className="h-full bg-yellow-400 rounded-full transition-[width]" style={{ width: `${pct}%` }} />
              </div>
            )}

            {/* Paletta — teljes szélességben, 13 oszlop */}
            <PaletteGrid cols={13} />
          </div>

          {/* ── Canvas wrapper (EGYETLEN, mindig megjelenik) ── */}
          {/*
            flex-1 + min-h-0 = tölti a maradék helyet (mobilon: magasság, desktopon: szélesség)
            items-center justify-center = a négyzetes konténer középre kerül
          */}
          <div
            ref={wrapperRef}
            className="flex-1 min-h-0 flex items-center justify-center md:justify-start"
          >
            {canvasContainer}
          </div>

          {/* ── Desktop sidebar (csak desktopon, jobbra) ── */}
          <div className="hidden md:flex flex-col gap-3 flex-shrink-0 overflow-y-auto pb-2" style={{ width: 212 }}>

            <div className={`text-xs px-2.5 py-1.5 rounded-full text-center border font-medium ${
              wsStatus === 'connected'
                ? 'text-green-400 border-green-500/25 bg-green-500/8'
                : 'text-gray-500 border-white/10'
            }`}>
              {wsStatus === 'connected' ? '🟢 Valós idejű szinkron' : '⚪ Csatlakozás…'}
            </div>

            <div>
              <motion.div
                className={`px-3 py-2 rounded-xl text-sm font-semibold border text-center ${
                  canPlace
                    ? 'bg-green-500/15 text-green-400 border-green-500/30'
                    : 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30'
                }`}
                animate={justPlaced ? { scale: [1, 1.1, 1] } : {}}
                transition={{ duration: 0.3 }}
              >
                {canPlace ? '✓ Rajzolhatsz!' : `⏳ ${cooldownSecs}mp`}
              </motion.div>
              {cooldownLeft > 0 && (
                <div className="mt-1.5 h-1 bg-gray-800 rounded-full overflow-hidden">
                  <div className="h-full bg-yellow-400 rounded-full transition-[width]" style={{ width: `${pct}%` }} />
                </div>
              )}
            </div>

            <div>
              <p className="text-gray-600 text-[10px] uppercase tracking-wider mb-1">Szín</p>
              <div className="flex items-center gap-2 bg-white/5 rounded-lg px-2.5 py-2 border border-white/8">
                <div className="w-4 h-4 rounded-full border border-white/20" style={{ background: selectedColor }} />
                <span className="text-gray-400 text-xs font-mono">{selectedColor}</span>
              </div>
            </div>

            <div>
              <p className="text-gray-600 text-[10px] uppercase tracking-wider mb-1">Paletta</p>
              <PaletteGrid cols={4} />
            </div>

            <div>
              <p className="text-gray-600 text-[10px] uppercase tracking-wider mb-1">Zoom</p>
              <div className="flex items-center gap-2">
                <button onClick={() => setZoom(z => Math.max(1, z - 1))} disabled={zoom <= 1}
                  className="w-8 h-8 rounded bg-white/8 hover:bg-white/15 text-white flex items-center justify-center font-bold text-lg disabled:opacity-25">−</button>
                <span className="text-gray-300 text-sm font-mono flex-1 text-center">{zoom}×</span>
                <button onClick={() => setZoom(z => Math.min(6, z + 1))} disabled={zoom >= 6}
                  className="w-8 h-8 rounded bg-white/8 hover:bg-white/15 text-white flex items-center justify-center font-bold text-lg disabled:opacity-25">+</button>
              </div>
            </div>

            <div className="bg-white/5 rounded-lg px-2.5 py-2 border border-white/8 text-xs font-mono text-gray-500 min-h-[34px]">
              {hoverCoord
                ? <><span className="text-gray-300">X:</span> {hoverCoord.x}  <span className="text-gray-300">Y:</span> {hoverCoord.y}</>
                : <span className="text-gray-700">Vidd a kurzort…</span>}
            </div>

            {adminLoggedIn && (
              <button onClick={handleReset}
                className="text-xs text-red-400 border border-red-500/25 hover:bg-red-500/10 rounded-lg px-3 py-2 transition-colors text-center">
                🗑 Vászon törlése
              </button>
            )}
          </div>

        </div>

        {/* Admin gomb mobilon (alul) */}
        {adminLoggedIn && (
          <div className="md:hidden flex-shrink-0 py-2">
            <button onClick={handleReset}
              className="w-full text-xs text-red-400 border border-red-500/25 hover:bg-red-500/10 rounded-lg px-3 py-1.5 transition-colors">
              🗑 Vászon törlése (admin)
            </button>
          </div>
        )}

      </div>

      {/* BottomNav spacer */}
      <div style={{ height: 64, flexShrink: 0 }} />
    </div>
  )
}
