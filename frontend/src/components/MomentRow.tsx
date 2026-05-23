import { useRef } from 'react'
import type { Moment } from '../types'
import MomentCard from './MomentCard'

interface Props {
  title: string
  moments: Moment[]
  accentColor?: string
}

export default function MomentRow({ title, moments, accentColor = '#e50914' }: Props) {
  const rowRef = useRef<HTMLDivElement>(null)

  function scroll(dir: 'left' | 'right') {
    if (!rowRef.current) return
    rowRef.current.scrollBy({ left: dir === 'right' ? 600 : -600, behavior: 'smooth' })
  }

  if (moments.length === 0) return null

  return (
    <section className="mb-8">
      <div className="flex items-center gap-3 px-6 mb-3">
        <span className="w-1 h-5 rounded" style={{ background: accentColor }} />
        <h2 className="text-white font-bold text-lg">{title}</h2>
        <span className="text-gray-500 text-sm">{moments.length} pillanat</span>
      </div>

      <div className="relative group/row">
        {/* Left chevron */}
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 top-0 bottom-0 z-10 w-10 bg-gradient-to-r from-black/70 to-transparent flex items-center justify-center opacity-0 group-hover/row:opacity-100 transition-opacity"
        >
          <span className="text-white text-lg">‹</span>
        </button>

        {/* Cards */}
        <div
          ref={rowRef}
          className="flex gap-2 overflow-x-auto scrollbar-hide px-6 scroll-smooth"
          style={{ scrollbarWidth: 'none' }}
        >
          {moments.map(m => (
            <MomentCard key={m.id} moment={m} />
          ))}
        </div>

        {/* Right chevron */}
        <button
          onClick={() => scroll('right')}
          className="absolute right-0 top-0 bottom-0 z-10 w-10 bg-gradient-to-l from-black/70 to-transparent flex items-center justify-center opacity-0 group-hover/row:opacity-100 transition-opacity"
        >
          <span className="text-white text-lg">›</span>
        </button>
      </div>
    </section>
  )
}
