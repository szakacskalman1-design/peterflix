import { useRef } from 'react'
import type { Moment } from '../types'
import MomentCard from './MomentCard'

interface Props {
  title: string
  moments: Moment[]
  accentColor?: string
  showRanks?: boolean
  forceFormat?: 'shorts' | 'regular'  // ha kívülről kell felülírni
}

export default function MomentRow({ title, moments, accentColor = '#e50914', showRanks = false, forceFormat }: Props) {
  const rowRef = useRef<HTMLDivElement>(null)

  // Domináns formátum detektálása: ha a videók többsége Shorts → portrait sor
  const shortsCount = moments.filter(m => m.platform === 'shorts').length
  const rowFormat: 'shorts' | 'regular' = forceFormat ?? (shortsCount >= moments.length / 2 ? 'shorts' : 'regular')

  function scroll(dir: 'left' | 'right') {
    if (!rowRef.current) return
    rowRef.current.scrollBy({ left: dir === 'right' ? 500 : -500, behavior: 'smooth' })
  }

  if (moments.length === 0) return null

  return (
    <section className="mb-6 sm:mb-8">
      {/* Fejléc */}
      <div className="flex items-center gap-2 sm:gap-3 px-4 sm:px-6 mb-2 sm:mb-3">
        <span className="w-1 h-5 rounded flex-shrink-0" style={{ background: accentColor }} />
        <h2 className="text-white font-bold text-base sm:text-lg truncate">{title}</h2>
        <span className="text-gray-600 text-xs sm:text-sm flex-shrink-0">{moments.length} db</span>
      </div>

      <div className="relative group/row">
        {/* Bal chevron */}
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 top-0 bottom-0 z-10 w-8 sm:w-10 bg-gradient-to-r from-[#0a0a0a]/90 to-transparent
                     flex items-center justify-center opacity-0 group-hover/row:opacity-100 transition-opacity hidden sm:flex"
        >
          <span className="text-white text-xl font-bold">‹</span>
        </button>

        {/* Kártyák */}
        <div
          ref={rowRef}
          className="flex gap-2 sm:gap-2.5 overflow-x-auto px-4 sm:px-6 scroll-smooth py-4"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {moments.map((m, i) => (
            <MomentCard
              key={m.id}
              moment={m}
              rank={showRanks ? i + 1 : undefined}
              rowFormat={rowFormat}
            />
          ))}
        </div>

        {/* Jobb chevron */}
        <button
          onClick={() => scroll('right')}
          className="absolute right-0 top-0 bottom-0 z-10 w-8 sm:w-10 bg-gradient-to-l from-[#0a0a0a]/90 to-transparent
                     flex items-center justify-center opacity-0 group-hover/row:opacity-100 transition-opacity hidden sm:flex"
        >
          <span className="text-white text-xl font-bold">›</span>
        </button>
      </div>
    </section>
  )
}
