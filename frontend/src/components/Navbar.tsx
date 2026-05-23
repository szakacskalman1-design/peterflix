import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { isLoggedIn, logout } from '../lib/api'
import SearchBar from './SearchBar'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [loggedIn, setLoggedIn] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    setLoggedIn(isLoggedIn())
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  function handleLogout() {
    logout()
    setLoggedIn(false)
    navigate('/')
  }

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-6 py-3 flex items-center gap-6 ${
        scrolled ? 'bg-[#0a0a0a]' : 'bg-gradient-to-b from-black/80 to-transparent'
      }`}
    >
      {/* Logo */}
      <Link to="/" className="flex-shrink-0">
        <span className="text-2xl font-black text-[#e50914] tracking-tight">
          PÉTER<span className="text-white">FLIX</span>
        </span>
      </Link>

      {/* Nav links */}
      <div className="hidden md:flex items-center gap-5 text-sm text-gray-300">
        <Link to="/" className="hover:text-white transition-colors">Főoldal</Link>
        <Link to="/category/ikonikus-pillanatok" className="hover:text-white transition-colors">Ikonikus</Link>
        <Link to="/category/legjobb-idezetek" className="hover:text-white transition-colors">Idézetek</Link>
        <Link to="/category/brusszeli-kalandok" className="hover:text-white transition-colors">Brüsszel</Link>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Search */}
      <SearchBar />

      {/* Admin link */}
      {loggedIn ? (
        <div className="flex items-center gap-3 text-sm">
          <Link to="/admin" className="text-gray-300 hover:text-white transition-colors">Admin</Link>
          <button
            onClick={handleLogout}
            className="text-gray-400 hover:text-white transition-colors"
          >
            Kilépés
          </button>
        </div>
      ) : (
        <Link
          to="/admin"
          className="text-sm text-gray-400 hover:text-white transition-colors"
        >
          Bejelentkezés
        </Link>
      )}
    </nav>
  )
}
