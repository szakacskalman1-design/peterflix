import { Request, Response, NextFunction } from 'express'
import { prisma } from '../lib/prisma'

export async function getAllMoments(req: Request, res: Response, next: NextFunction) {
  try {
    const { category, sort = 'viral', limit } = req.query

    const moments = await prisma.moment.findMany({
      where: category ? { category: { slug: String(category) } } : undefined,
      include: { category: true },
      orderBy:
        sort === 'recent'
          ? { createdAt: 'desc' }
          : sort === 'views'
            ? { viewCount: 'desc' }
            : { viralScore: 'desc' },
      take: limit ? parseInt(String(limit), 10) : undefined,
    })

    res.json(moments)
  } catch (err) {
    next(err)
  }
}

export async function getMomentById(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params

    const moment = await prisma.moment.findUnique({
      where: { id },
      include: { category: true },
    })

    if (!moment) {
      res.status(404).json({ error: 'Pillanat nem található' })
      return
    }

    // Nézettség növelése aszinkron (nem blokkolja a választ)
    prisma.moment.update({ where: { id }, data: { viewCount: { increment: 1 } } }).catch(() => {})

    res.json(moment)
  } catch (err) {
    next(err)
  }
}

export async function createMoment(req: Request, res: Response, next: NextFunction) {
  try {
    const data = req.body

    if (!data.title || !data.youtubeId || !data.categoryId) {
      res.status(400).json({ error: 'title, youtubeId és categoryId kötelező' })
      return
    }

    const moment = await prisma.moment.create({
      data: {
        title: data.title,
        description: data.description ?? '',
        youtubeId: data.youtubeId,
        thumbnailUrl:
          data.thumbnailUrl ?? `https://img.youtube.com/vi/${data.youtubeId}/maxresdefault.jpg`,
        duration: data.duration ?? 0,
        year: data.year ?? new Date().getFullYear(),
        viralScore: data.viralScore ?? 50,
        isHero: data.isHero ?? false,
        tags: data.tags ?? [],
        categoryId: data.categoryId,
      },
      include: { category: true },
    })

    res.status(201).json(moment)
  } catch (err) {
    next(err)
  }
}

export async function updateMoment(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params

    const moment = await prisma.moment.update({
      where: { id },
      data: req.body,
      include: { category: true },
    })

    res.json(moment)
  } catch (err) {
    next(err)
  }
}

export async function deleteMoment(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params
    await prisma.moment.delete({ where: { id } })
    res.status(204).send()
  } catch (err) {
    next(err)
  }
}
