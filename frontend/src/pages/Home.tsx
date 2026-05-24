import { useSearchParams } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Hero from '../components/Hero'
import MomentRow from '../components/MomentRow'
import TrendingRow from '../components/TrendingRow'
import MomentCard from '../components/MomentCard'
import { useMoments, useCategories } from '../hooks/useMoments'
import { useSearch } from '../hooks/useSearch'
import type { Moment } from '../types'

export default function Home() {
  const [searchParams] = useSearchParams()
  const q = searchParams.get('q') ?? ''

  const { moments, loading: momentsLoading } = useMoments()
  const { categories } = useCategories()
  const { results: searchResults, loading: searchLoading } = useSearch(q)

  const heroMoment = moments.find(m => m.isHero) ?? moments[0]

  // Kategóriánkénti csoportosítás
  const byCategory: Record<string, { name: string; color: string; moments: Moment[] }> = {}
  for (const cat of categories) {
    byCategory[cat.id] = { name: cat.name, color: cat.color, moments: [] }
  }
  for (const m of moments) {
    if (m.categoryId && byCategory[m.categoryId]) {
      byCategory[m.categoryId].moments.push(m)
    }
  }

  // Top viral (trending)
  const topViral = [...moments].sort((a, b) => b.viralScore - a.viralScore).slice(0, 10)

  // ── Betöltés ───────────────────────────────────────────────────────────────
  if (momentsLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-center">
          <div className="text-[#e50914] text-4xl font-black mb-3">PÉTERFLIX</div>
          <div className="text-gray-400 animate-pulse">Töltés…</div>
        </div>
      </div>
    )
  }

  // ── Keresési nézet ────────────────────────────────────────────────────────
  if (q) {
    return (
      <div className="min-h-screen bg-[#0a0a0a]">
        <Navbar />
        <div className="pt-20 sm:pt-24 px-4 sm:px-6">
          <h1 className="text-white text-xl sm:text-2xl font-bold mb-1">
            Keresési eredmények: <span className="text-[#e50914]">„{q}"</span>
          </h1>
          <p className="text-gray-400 text-sm mb-6 sm:mb-8">
            {searchLoading ? 'Keresés…' : `${searchResults.length} találat`}
          </p>
          {searchLoading ? (
            <div className="text-gray-400 animate-pulse">Keresés folyamatban…</div>
          ) : searchResults.length === 0 ? (
            <div className="text-gray-500 text-center py-20">
              <div className="text-5xl mb-4">🔍</div>
              <p>Nincs találat erre: <strong className="text-white">{q}</strong></p>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2 sm:gap-3">
              {searchResults.map(m => <MomentCard key={m.id} moment={m} />)}
            </div>
          )}
        </div>
      </div>
    )
  }

  // ── Főoldal ───────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Navbar />

      {/* Hero */}
      {heroMoment && <Hero moment={heroMoment} />}

      {/* Tartalom sorok */}
      <div className="pb-16 -mt-4 relative z-10">

        {/* 🔥 Trending (vizuálisan kiemelt) */}
        <TrendingRow moments={topViral} />

        {/* Kategória sorok */}
        {categories.map(cat => {
          const catData = byCategory[cat.id]
          if (!catData || catData.moments.length === 0) return null
          return (
            <MomentRow
              key={cat.id}
              title={cat.name}
              moments={catData.moments}
              accentColor={cat.color}
            />
          )
        })}
      </div>
    </div>
  )
}
