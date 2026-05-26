import { BrowserRouter, Routes, Route, useLocation, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import Home from './pages/Home'
import Search from './pages/Search'
import Category from './pages/Category'
import MomentPage from './pages/Moment'
import Admin from './pages/Admin'
import Meme from './pages/Meme'
import PixelCanvas from './pages/PixelCanvas'
import BottomNav from './components/BottomNav'

// ── Admin titkos URL ─────────────────────────────────────────────────────────
// Nem linkeljük sehonnan — csak aki tudja az URL-t, az éri el.
// Állítsd be: VITE_ADMIN_PATH=/valami-titkos az .env-ben (Netlify env vars)
const ADMIN_PATH =
  (import.meta as { env?: Record<string, string> }).env?.VITE_ADMIN_PATH ?? '/pf-studio'

// ── Top header ────────────────────────────────────────────────────────────────
// Csak a /, /search, /pixel, /meme oldalakon jelenik meg.
// A /category/:slug és /moment/:id oldalak saját Navbar-t használnak.
// Az admin oldalon nincs navigáció.
function TopHeader() {
  const { pathname } = useLocation()

  const skipTopHeader =
    pathname === ADMIN_PATH ||
    pathname.startsWith('/category/') ||
    pathname.startsWith('/moment/')

  if (skipTopHeader) return null

  const isHomeFeed = pathname === '/'

  return (
    <header
      className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4 py-3"
      style={{
        background: isHomeFeed
          ? 'linear-gradient(to bottom, rgba(0,0,0,0.8) 0%, transparent 100%)'
          : 'rgba(10,10,10,0.95)',
        backdropFilter: isHomeFeed ? 'none' : 'blur(20px)',
        borderBottom: isHomeFeed ? 'none' : '1px solid rgba(255,255,255,0.07)',
      }}
    >
      {/* Logo */}
      <Link to="/" className="flex-shrink-0">
        <span className="text-lg font-black tracking-tight select-none">
          <span className="text-[#e50914]">PÉTER</span>
          <span className="text-white">FLIX</span>
        </span>
      </Link>

      {/* Desktop navigáció — admin link sehol sem jelenik meg */}
      <nav className="hidden md:flex items-center gap-5 text-sm">
        <Link to="/" className="text-gray-400 hover:text-white transition-colors">Feed</Link>
        <Link to="/search" className="text-gray-400 hover:text-white transition-colors">🔍 Keresés</Link>
        <Link to="/pixel" className="text-gray-400 hover:text-white transition-colors">🎨 Pixel Csata</Link>
        <Link to="/meme" className="text-gray-400 hover:text-white transition-colors">😂 Mém Generátor</Link>
      </nav>

      {/* Jobb oldali spacer (szimmetria) */}
      <div style={{ width: 40 }} />
    </header>
  )
}

// ── Bottom nav wrapper ────────────────────────────────────────────────────────
function BottomNavWrapper() {
  const { pathname } = useLocation()
  if (pathname === ADMIN_PATH) return null
  return <BottomNav />
}

// ── Oldal fade-in wrapper ────────────────────────────────────────────────────
function PageWrapper({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18 }}
    >
      {children}
    </motion.div>
  )
}

// ── Belső layout (useLocation itt már elérhető) ───────────────────────────────
function AppLayout() {
  return (
    <div className="bg-black" style={{ minHeight: '100dvh' }}>
      <TopHeader />

      <Routes>
        {/* TikTok feed főoldal — nincs wrapper, maga kezeli a 100dvh-t */}
        <Route path="/" element={<Home />} />

        {/* Search oldal */}
        <Route path="/search" element={
          <PageWrapper><Search /></PageWrapper>
        } />

        {/* Pixel és Mém — saját tartalom, TopHeader-rel */}
        <Route path="/pixel" element={
          <PageWrapper><PixelCanvas /></PageWrapper>
        } />
        <Route path="/meme" element={
          <PageWrapper><Meme /></PageWrapper>
        } />

        {/* Kategória és pillanatnézet — saját Navbar-ral */}
        <Route path="/category/:slug" element={<Category />} />
        <Route path="/moment/:id" element={<MomentPage />} />

        {/* Admin — titkos URL, sehonnan nem linkeljük */}
        <Route path={ADMIN_PATH} element={<Admin />} />
      </Routes>

      <BottomNavWrapper />
    </div>
  )
}

// ── App root ──────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  )
}
