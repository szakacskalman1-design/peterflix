import { Request, Response, NextFunction } from 'express'
import { prisma } from '../lib/prisma'

export async function getAllCategories(_req: Request, res: Response, next: NextFunction) {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { order: 'asc' },
      include: {
        _count: { select: { moments: true } },
      },
    })

    res.json(
      categories.map((c) => ({
        ...c,
        momentCount: c._count.moments,
        _count: undefined,
      }))
    )
  } catch (err) {
    next(err)
  }
}

export async function getCategoryWithMoments(req: Request, res: Response, next: NextFunction) {
  try {
    const { slug } = req.params

    const category = await prisma.category.findUnique({
      where: { slug },
      include: {
        moments: {
          orderBy: { viralScore: 'desc' },
        },
      },
    })

    if (!category) {
      res.status(404).json({ error: 'Kategória nem található' })
      return
    }

    res.json(category)
  } catch (err) {
    next(err)
  }
}
