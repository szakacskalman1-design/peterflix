import { Router, Request, Response, NextFunction } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import rateLimit from 'express-rate-limit'
import { prisma } from '../lib/prisma'

const router = Router()

// ── Brute-force védelem a login endpointon ────────────────────────────────────
// Max 5 sikertelen kísérlet / 15 perc / IP — utána 15 percig blokkolva
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,   // 15 perc
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // sikeres login nem számít bele
  message: { error: 'Túl sok bejelentkezési kísérlet. Próbáld újra 15 perc múlva.' },
})

router.post('/login', loginLimiter, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      res.status(400).json({ error: 'Email és jelszó kötelező' })
      return
    }

    const user = await prisma.user.findUnique({ where: { email } })

    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      res.status(401).json({ error: 'Hibás email vagy jelszó' })
      return
    }

    const secret = process.env.JWT_SECRET
    if (!secret) {
      res.status(500).json({ error: 'JWT_SECRET nincs beállítva' })
      return
    }

    const token = jwt.sign({ userId: user.id, role: user.role }, secret, { expiresIn: '7d' })

    res.json({
      token,
      user: { id: user.id, email: user.email, role: user.role },
    })
  } catch (err) {
    next(err)
  }
})

export default router
