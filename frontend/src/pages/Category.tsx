import { useParams } from 'react-router-dom'
import Navbar from '../components/Navbar'
import MomentCard from '../components/MomentCard'
import { useMoments } from '../hooks/useMoments'

export default function Category() {
  const { slug } = useParams<{ slug: string }>()
  const { moments, loading } = useMoments({ category: slug })

  const category = moments[0]?.category

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Navbar />

      <div className="pt-24 px-6 pb-16">
        {loading ? (
          <div className="text-gray-400 animate-pulse pt-20 text-center">Töltés…</div>
        ) : (
          <>
            <div className="mb-8">
              {category && (
                <span
                  className="inline-block w-1.5 h-8 rounded mr-3 align-middle"
                  style={{ background: category.color }}
                />
              )}
              <h1 className="text-white text-3xl font-bold inline-block align-middle">
                {category?.name ?? slug}
              </h1>
              <p className="text-gray-400 text-sm mt-1">{moments.length} pillanat</p>
            </div>

            {moments.length === 0 ? (
              <div className="text-gray-500 text-center py-20">
                <div className="text-5xl mb-4">📭</div>
                <p>Ebben a kategóriában még nincsenek pillanatok.</p>
              </div>
            ) : (
              <div className="flex flex-wrap gap-3">
                {moments.map(m => <MomentCard key={m.id} moment={m} />)}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
