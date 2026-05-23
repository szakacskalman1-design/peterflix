import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import momentsRouter from './routes/moments'
import categoriesRouter from './routes/categories'
import searchRouter from './routes/search'
import authRouter from './routes/auth'
import { errorHandler } from './middleware/errorHandler'

const app = express()
const PORT = process.env.PORT ?? 3001

// ── Middleware ──────────────────────────────────────────────────────────────
app.use(cors({ origin: process.env.FRONTEND_URL ?? 'http://localhost:5173' }))
app.use(express.json())

// ── Routes ──────────────────────────────────────────────────────────────────
app.use('/api/moments', momentsRouter)
app.use('/api/categories', categoriesRouter)
app.use('/api/search', searchRouter)
app.use('/api/auth', authRouter)

// ── Health check ─────────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'PéterFlix API', time: new Date().toISOString() })
})

// ── Error handler (legyen az utolsó!) ────────────────────────────────────────
app.use(errorHandler)

app.listen(PORT, () => {
  console.log(`🎬 PéterFlix API fut: http://localhost:${PORT}/api`)
  console.log(`   Health check: http://localhost:${PORT}/api/health`)
})
