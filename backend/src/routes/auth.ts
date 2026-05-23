import { Router, Request, Response, NextFunction } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { prisma } from '../lib/prisma'

const router = Router()

router.post('/login', async (req: Request, res: Response, next: NextFunction) => {
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
