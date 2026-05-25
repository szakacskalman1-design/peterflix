import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'

const tabs = [
  { to: '/', icon: '🏠', label: 'Feed', exact: true },
  { to: '/search', icon: '🔍', label: 'Keresés', exact: false },
  { to: '/pixel', icon: '🎨', label: 'Pixel', exact: false },
  { to: '/meme', icon: '😂', label: 'Mém', exact: false },
]

export default function BottomNav() {
  const { pathname } = useLocation()

  function isActive(tab: typeof tabs[0]) {
    if (tab.exact) return pathname === tab.to
    return pathname.startsWith(tab.to)
  }

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50"
      style={{
        background: 'linear-gradient(to top, rgba(0,0,0,0.97) 0%, rgba(0,0,0,0.88) 100%)',
        backdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(255,255,255,0.08)',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
    >
      <div className="flex items-stretch max-w-lg mx-auto">
        {tabs.map(tab => {
          const active = isActive(tab)
          return (
            <Link
              key={tab.to}
              to={tab.to}
              className="flex-1 flex flex-col items-center justify-center py-2.5 gap-0.5 relative transition-colors"
            >
              {/* Active indicator */}
              {active && (
                <motion.div
                  layoutId="nav-indicator"
                  className="absolute top-0 left-1/4 right-1/4 h-0.5 bg-white rounded-full"
                  transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                />
              )}

              <motion.span
                className={`text-2xl leading-none transition-all ${active ? 'scale-110' : 'scale-100 opacity-60'}`}
                animate={{ scale: active ? 1.1 : 1 }}
                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              >
                {tab.icon}
              </motion.span>

              <span className={`text-[10px] font-semibold mt-0.5 tracking-wide transition-colors ${
                active ? 'text-white' : 'text-gray-500'
              }`}>
                {tab.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
