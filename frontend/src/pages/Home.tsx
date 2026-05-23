import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Hero from '../components/Hero'
import MomentRow from '../components/MomentRow'
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

  // Group moments by category
  const byCategory: Record<string, { name: string; color: string; moments: Moment[] }> = {}
  for (const cat of categories) {
    byCategory[cat.id] = { name: cat.name, color: cat.color, moments: [] }
  }
  for (const m of moments) {
    if (m.categoryId && byCategory[m.categoryId]) {
      byCategory[m.categoryId].moments.push(m)
    }
  }

  // Top viral row
  const topViral = [...moments].sort((a, b) => b.viralScore - a.viralScore).slice(0, 10)

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

  // Search results view
  if (q) {
    return (
      <div className="min-h-screen bg-[#0a0a0a]">
        <Navbar />
        <div className="pt-24 px-6">
          <h1 className="text-white text-2xl font-bold mb-2">
            Keresési eredmények: <span className="text-[#e50914]">„{q}"</span>
          </h1>
          <p className="text-gray-400 text-sm mb-8">
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
            <div className="flex flex-wrap gap-3">
              {searchResults.map(m => <MomentCard key={m.id} moment={m} />)}
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Navbar />

      {/* Hero */}
      {heroMoment && <Hero moment={heroMoment} />}

      {/* Content rows */}
      <div className="pb-16 -mt-4 relative z-10">
        {/* Top viral */}
        <MomentRow title="🔥 Legjobb pillanatok" moments={topViral} accentColor="#e50914" />

        {/* By category */}
        {Object.values(byCategory).map(cat =>
          cat.moments.length > 0 ? (
            <MomentRow
              key={cat.name}
              title={cat.name}
              moments={cat.moments}
              accentColor={cat.color}
            />
          ) : null
        )}
      </div>
    </div>
  )
}
