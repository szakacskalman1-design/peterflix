import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { login, isLoggedIn, getMoments, createMoment, deleteMoment } from '../lib/api'
import { useCategories } from '../hooks/useMoments'
import type { Moment } from '../types'

// ── Login form ──────────────────────────────────────────────────────────────

function LoginForm({ onLogin }: { onLogin: () => void }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
      onLogin()
    } catch {
      setError('Hibás e-mail cím vagy jelszó.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-[#141414] rounded-xl p-8 shadow-2xl">
        <div className="text-center mb-6">
          <span className="text-2xl font-black text-[#e50914]">PÉTER<span className="text-white">FLIX</span></span>
          <p className="text-gray-400 text-sm mt-1">Admin bejelentkezés</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="E-mail"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full bg-[#333] text-white rounded px-4 py-2.5 text-sm outline-none focus:ring-1 focus:ring-[#e50914]"
            required
          />
          <input
            type="password"
            placeholder="Jelszó"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full bg-[#333] text-white rounded px-4 py-2.5 text-sm outline-none focus:ring-1 focus:ring-[#e50914]"
            required
          />
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#e50914] text-white font-bold py-2.5 rounded hover:bg-red-700 transition-colors disabled:opacity-60"
          >
            {loading ? 'Bejelentkezés…' : 'Bejelentkezés'}
          </button>
        </form>
      </div>
    </div>
  )
}

// ── Admin dashboard ─────────────────────────────────────────────────────────

interface NewMomentForm {
  title: string
  description: string
  youtubeId: string
  year: string
  duration: string
  viralScore: string
  isHero: boolean
  categoryId: string
  tags: string
}

const EMPTY_FORM: NewMomentForm = {
  title: '', description: '', youtubeId: '', year: String(new Date().getFullYear()),
  duration: '120', viralScore: '75', isHero: false, categoryId: '', tags: ''
}

function Dashboard() {
  const [moments, setMoments] = useState<Moment[]>([])
  const [form, setForm] = useState<NewMomentForm>(EMPTY_FORM)
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState('')
  const { categories } = useCategories()

  useEffect(() => {
    getMoments().then(setMoments).catch(console.error)
  }, [])

  function setField(field: keyof NewMomentForm, value: string | boolean) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setMessage('')
    try {
      const payload = {
        ...form,
        year: Number(form.year),
        duration: Number(form.duration),
        viralScore: Number(form.viralScore),
        tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
      }
      const created = await createMoment(payload)
      setMoments(prev => [created, ...prev])
      setForm(EMPTY_FORM)
      setMessage('✅ Pillanat sikeresen hozzáadva!')
    } catch {
      setMessage('❌ Hiba történt a mentés során.')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Biztosan törlöd?')) return
    await deleteMoment(id)
    setMoments(prev => prev.filter(m => m.id !== id))
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Navbar />
      <div className="pt-24 px-6 pb-16 max-w-4xl mx-auto">
        <h1 className="text-white text-2xl font-bold mb-8">Admin panel</h1>

        {/* Add form */}
        <div className="bg-[#141414] rounded-xl p-6 mb-10">
          <h2 className="text-white font-semibold mb-4">Új pillanat hozzáadása</h2>
          <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input className="admin-input md:col-span-2" placeholder="Cím*" value={form.title}
              onChange={e => setField('title', e.target.value)} required />
            <textarea className="admin-input md:col-span-2 h-20 resize-none" placeholder="Leírás"
              value={form.description} onChange={e => setField('description', e.target.value)} />
            <input className="admin-input" placeholder="YouTube ID (pl. -GWzL9j0hQs)*" value={form.youtubeId}
              onChange={e => setField('youtubeId', e.target.value)} required />
            <select className="admin-input" value={form.categoryId}
              onChange={e => setField('categoryId', e.target.value)} required>
              <option value="">Kategória*</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <input className="admin-input" type="number" placeholder="Év" value={form.year}
              onChange={e => setField('year', e.target.value)} />
            <input className="admin-input" type="number" placeholder="Időtartam (mp)" value={form.duration}
              onChange={e => setField('duration', e.target.value)} />
            <input className="admin-input" type="number" min="0" max="100" placeholder="Virális pontszám (0-100)"
              value={form.viralScore} onChange={e => setField('viralScore', e.target.value)} />
            <input className="admin-input" placeholder="Tagek (vesszővel elválasztva)" value={form.tags}
              onChange={e => setField('tags', e.target.value)} />
            <label className="flex items-center gap-2 text-gray-300 text-sm">
              <input type="checkbox" checked={form.isHero}
                onChange={e => setField('isHero', e.target.checked)}
                className="accent-[#e50914]" />
              Hero pillanat (főoldalon kiemelt)
            </label>
            <div className="md:col-span-2 flex items-center gap-4">
              <button type="submit" disabled={submitting}
                className="bg-[#e50914] text-white font-bold px-6 py-2 rounded hover:bg-red-700 disabled:opacity-60 transition-colors">
                {submitting ? 'Mentés…' : 'Hozzáadás'}
              </button>
              {message && <span className="text-sm">{message}</span>}
            </div>
          </form>
        </div>

        {/* Moments list */}
        <h2 className="text-white font-semibold mb-4">Pillanatok ({moments.length})</h2>
        <div className="space-y-2">
          {moments.map(m => (
            <div key={m.id} className="flex items-center gap-3 bg-[#141414] rounded-lg px-4 py-3">
              <img src={`https://img.youtube.com/vi/${m.youtubeId}/default.jpg`}
                className="w-16 h-9 object-cover rounded flex-shrink-0"
                onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium truncate">{m.title}</p>
                <p className="text-gray-500 text-xs">{m.year} · {m.viralScore}% virális · {m.category?.name}</p>
              </div>
              <button onClick={() => handleDelete(m.id)}
                className="text-gray-500 hover:text-red-400 transition-colors text-sm flex-shrink-0">
                Törlés
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Main export ─────────────────────────────────────────────────────────────

export default function Admin() {
  const [authed, setAuthed] = useState(isLoggedIn())
  const navigate = useNavigate()

  if (!authed) {
    return <LoginForm onLogin={() => setAuthed(true)} />
  }

  return <Dashboard />
}
