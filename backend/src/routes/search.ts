import { Router, Request, Response, NextFunction } from 'express'
import { prisma } from '../lib/prisma'

const router = Router()

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const q = String(req.query.q ?? '').trim()

    if (!q || q.length < 2) {
      res.json([])
      return
    }

    const results = await prisma.moment.findMany({
      where: {
        OR: [
          { title: { contains: q, mode: 'insensitive' } },
          { description: { contains: q, mode: 'insensitive' } },
          { tags: { has: q } },
        ],
      },
      include: { category: true },
      orderBy: { viralScore: 'desc' },
      take: 20,
    })

    res.json(results)
  } catch (err) {
    next(err)
  }
})

export default router
