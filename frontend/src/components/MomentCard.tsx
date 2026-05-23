import { useState } from 'react'
import { motion } from 'framer-motion'
import type { Moment } from '../types'
import MomentModal from './MomentModal'

interface Props {
  moment: Moment
}

function formatDuration(seconds: number) {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

export default function MomentCard({ moment }: Props) {
  const [modalOpen, setModalOpen] = useState(false)

  const thumb = moment.thumbnailUrl ||
    `https://img.youtube.com/vi/${moment.youtubeId}/mqdefault.jpg`

  return (
    <>
      <motion.div
        className="relative flex-shrink-0 w-52 cursor-pointer rounded overflow-hidden group"
        whileHover={{ scale: 1.08, zIndex: 10 }}
        transition={{ duration: 0.2 }}
        onClick={() => setModalOpen(true)}
      >
        {/* Thumbnail */}
        <img
          src={thumb}
          alt={moment.title}
          className="w-full h-[116px] object-cover"
          onError={e => {
            (e.target as HTMLImageElement).src =
              'https://placehold.co/208x116/1a1a1a/555?text=PéterFlix'
          }}
        />

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-end p-2">
          <button className="w-7 h-7 rounded-full bg-white text-black flex items-center justify-center mb-1.5 text-xs font-bold hover:bg-gray-200">
            ▶
          </button>
          <p className="text-white text-xs font-semibold line-clamp-1">{moment.title}</p>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-green-400 text-xs font-bold">{moment.viralScore}% virális</span>
            <span className="text-gray-400 text-xs">{formatDuration(moment.duration)}</span>
          </div>
        </div>

        {/* Viral badge */}
        {moment.viralScore >= 90 && (
          <div className="absolute top-1.5 left-1.5 bg-[#e50914] text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
            🔥 VIRAL
          </div>
        )}
      </motion.div>

      {modalOpen && (
        <MomentModal moment={moment} onClose={() => setModalOpen(false)} />
      )}
    </>
  )
}
