import { useMoments } from '../hooks/useMoments'
import TikTokFeed from '../components/TikTokFeed'
import { motion } from 'framer-motion'

export default function Home() {
  const { moments, loading } = useMoments()

  // Betöltés képernyő
  if (loading) {
    return (
      <div
        className="flex items-center justify-center bg-black"
        style={{ height: '100dvh' }}
      >
        <div className="text-center">
          <motion.div
            className="text-[#e50914] text-4xl font-black mb-4 tracking-tight"
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
          >
            PÉTER<span className="text-white">FLIX</span>
          </motion.div>
          <div className="flex gap-1.5 justify-center">
            {[0, 1, 2].map(i => (
              <motion.div
                key={i}
                className="w-2 h-2 rounded-full bg-[#e50914]"
                animate={{ scale: [1, 1.5, 1], opacity: [0.4, 1, 0.4] }}
                transition={{ repeat: Infinity, duration: 0.9, delay: i * 0.2 }}
              />
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Virális score szerint rendezve — legjobb tartalom elöl
  const sorted = [...moments].sort((a, b) => b.viralScore - a.viralScore)

  return <TikTokFeed moments={sorted} />
}
