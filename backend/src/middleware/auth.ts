import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

export interface AuthRequest extends Request {
  userId?: string
  userRole?: string
}

export function requireAuth(req: AuthRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization

  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Hiányzó hitelesítési token' })
    return
  }

  const token = authHeader.slice(7)
  const secret = process.env.JWT_SECRET

  if (!secret) {
    res.status(500).json({ error: 'JWT_SECRET nincs beállítva' })
    return
  }

  try {
    const payload = jwt.verify(token, secret) as { userId: string; role: string }
    req.userId = payload.userId
    req.userRole = payload.role
    next()
  } catch {
    res.status(401).json({ error: 'Érvénytelen vagy lejárt token' })
  }
}

export function requireAdmin(req: AuthRequest, res: Response, next: NextFunction): void {
  requireAuth(req, res, () => {
    if (req.userRole !== 'ADMIN') {
      res.status(403).json({ error: 'Admin jogosultság szükséges' })
      return
    }
    next()
  })
}
