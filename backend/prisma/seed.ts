// prisma/seed.ts
// Futtasd: npm run db:seed

import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Kategóriák törlése és újralétrehozása
  await prisma.moment.deleteMany()
  await prisma.category.deleteMany()

  // --- KATEGÓRIÁK ---
  const categories = await Promise.all([
    prisma.category.create({
      data: {
        name: 'Abszolút Filmszínház',
        slug: 'abszolut-filmszinhaz',
        description: 'A legikonikusabb Magyar Péter pillanatok',
        color: '#e50914',
        order: 1,
      },
    }),
    prisma.category.create({
      data: {
        name: 'Mémek & Vicces',
        slug: 'memek-vicces',
        description: 'TikTok-ready vírusos pillanatok',
        color: '#f5a623',
        order: 2,
      },
    }),
    prisma.category.create({
      data: {
        name: 'Nagy pillanatok',
        slug: 'nagy-pillanatok',
        description: 'Történelmi és meghatározó momentumok',
        color: '#46d369',
        order: 3,
      },
    }),
    prisma.category.create({
      data: {
        name: 'Brüsszel & Diplomácia',
        slug: 'brusszel-diplomacia',
        description: 'Európai kalandok és külföldi találkozók',
        color: '#0080ff',
        order: 4,
      },
    }),
  ])

  const [filmszinhaz, memek, nagy, brusszel] = categories

  // --- MOMENTUMOK ---
  const moments = [
    {
      title: 'Osztálykirándulósokat fogad az osztrák kancellár',
      description: 'Magyar Péter és csapata Bécsben az osztrák kancellárnál — a fogadtatás kissé osztálykirándulós hangulatot idéz.',
      youtubeId: 'ciplNx-MkWc',
      platform: 'shorts',
      duration: 60,
      year: 2025,
      viralScore: 92,
      viewCount: 850000,
      isHero: false,
      tags: ['brüsszel', 'diplomácia', 'ausztria', 'vicces'],
      categoryId: brusszel.id,
    },
    {
      title: 'Magyar Peti a vasutas',
      description: 'Péter vonaton, vasutasok között — mém-potenciál maximumon.',
      youtubeId: 'X4fnJJrBW6Y',
      platform: 'shorts',
      duration: 45,
      year: 2025,
      viralScore: 88,
      viewCount: 620000,
      isHero: false,
      tags: ['vasút', 'közlekedés', 'lázár', 'vicces'],
      categoryId: memek.id,
    },
    {
      title: 'Bromance Donald Tuskal – Part 1',
      description: 'Magyar Péter és Donald Tusk találkozója — a kémia azonnal megvolt.',
      youtubeId: 'R6Y7X7nIi-g',
      platform: 'shorts',
      duration: 55,
      year: 2025,
      viralScore: 95,
      viewCount: 1100000,
      isHero: true,
      tags: ['tusk', 'lengyelország', 'diplomácia', 'bromance'],
      categoryId: brusszel.id,
    },
    {
      title: 'Magyar Peti letörli a Netflixet és átvált a PéterFlixre',
      description: 'A pillanat ami miatt ez az app létezik. Péter maga törli le a Netflixet.',
      youtubeId: 'JgFz1z0q83U',
      platform: 'shorts',
      duration: 30,
      year: 2025,
      viralScore: 99,
      viewCount: 2400000,
      isHero: false,
      tags: ['netflix', 'péterflix', 'meta', 'vicces', 'mém'],
      categoryId: filmszinhaz.id,
    },
    {
      title: 'A sportfan',
      description: 'Magyar Péter sportesemények között — emberi oldal, maxikifejezések.',
      youtubeId: 'GleCgcX-fYI',
      platform: 'shorts',
      duration: 40,
      year: 2025,
      viralScore: 84,
      viewCount: 490000,
      isHero: false,
      tags: ['sport', 'emberi', 'reakció'],
      categoryId: memek.id,
    },
    {
      title: 'MP Sherlock Holmes',
      description: 'Péter nyomozó módban — a dedukció bajnoka.',
      youtubeId: 'YE4SYGSuViU',
      platform: 'shorts',
      duration: 50,
      year: 2025,
      viralScore: 91,
      viewCount: 780000,
      isHero: false,
      tags: ['sherlock', 'nyomozás', 'vicces', 'mém'],
      categoryId: filmszinhaz.id,
    },
    {
      title: 'A tárlatvezető',
      description: 'Magyar Péter tárlatot vezet — műtárgyak, magyarázatok, arcreakciók.',
      youtubeId: 'fbUPs7DjgUA',
      platform: 'shorts',
      duration: 55,
      year: 2025,
      viralScore: 87,
      viewCount: 560000,
      isHero: false,
      tags: ['kultúra', 'múzeum', 'vicces'],
      categoryId: filmszinhaz.id,
    },
    {
      title: 'A kordonbontó',
      description: 'A Karmelita kordonjainak lebontása — szimbolikus és abszolút filmszínházi pillanat.',
      youtubeId: 'rYHdO-KY8FI',
      platform: 'shorts',
      duration: 60,
      year: 2026,
      viralScore: 97,
      viewCount: 1800000,
      isHero: false,
      tags: ['karmelita', 'kordon', 'rendszerváltás', 'ikonikus'],
      categoryId: nagy.id,
    },
    {
      title: 'Tovarisi konyec elvtársak',
      description: 'A NER vége — Péter jelszava amivel lezárta az Orbán-korszakot.',
      youtubeId: 'S9R1UyeOwRM',
      platform: 'shorts',
      duration: 45,
      year: 2026,
      viralScore: 98,
      viewCount: 2100000,
      isHero: false,
      tags: ['tovarisi', 'konyec', 'rendszerváltás', 'ikonikus', 'mém'],
      categoryId: nagy.id,
    },
    {
      title: 'Rakpart',
      description: 'A rakparti pillanat — Budapest, Duna, Péter.',
      youtubeId: 'xDhALu5JBVk',
      platform: 'shorts',
      duration: 35,
      year: 2025,
      viralScore: 86,
      viewCount: 540000,
      isHero: false,
      tags: ['budapest', 'duna', 'hangulat'],
      categoryId: filmszinhaz.id,
    },
    {
      title: 'MP a DJ',
      description: 'Magyar Péter DJ pultban — ezt senki nem várta.',
      youtubeId: 'Zj_w7IvQm0c',
      platform: 'shorts',
      duration: 40,
      year: 2025,
      viralScore: 93,
      viewCount: 920000,
      isHero: false,
      tags: ['dj', 'zene', 'meglepő', 'vicces', 'mém'],
      categoryId: memek.id,
    },
    {
      title: 'Let it happen',
      description: 'A győzelem pillanata — let it happen.',
      youtubeId: 'ZfUOXLCHQzw',
      platform: 'shorts',
      duration: 50,
      year: 2026,
      viralScore: 96,
      viewCount: 1650000,
      isHero: false,
      tags: ['győzelem', 'választás', 'ikonikus', 'érzelmek'],
      categoryId: nagy.id,
    },
    {
      title: 'Fideszes golyó',
      description: 'A golyó amit a Fidesz lőtt ki — visszajött.',
      youtubeId: '3FnNHKwU_5U',
      platform: 'shorts',
      duration: 45,
      year: 2025,
      viralScore: 90,
      viewCount: 710000,
      isHero: false,
      tags: ['fidesz', 'visszavágás', 'vicces', 'mém'],
      categoryId: memek.id,
    },
  ]

  for (const moment of moments) {
    await prisma.moment.create({ data: moment })
    console.log(`✅ Létrehozva: ${moment.title}`)
  }

  // Admin user upsert
  const hash = await bcrypt.hash(process.env.ADMIN_PASSWORD ?? 'changeme123', 10)
  await prisma.user.upsert({
    where: { email: process.env.ADMIN_EMAIL ?? 'admin@peterflix.hu' },
    update: { passwordHash: hash },
    create: {
      email: process.env.ADMIN_EMAIL ?? 'admin@peterflix.hu',
      passwordHash: hash,
      role: 'ADMIN',
    },
  })

  console.log(`\n🎬 ${moments.length} moment sikeresen beseedelve!`)
  console.log(`📁 ${categories.length} kategória létrehozva!`)
  console.log(`✅ Admin: ${process.env.ADMIN_EMAIL ?? 'admin@peterflix.hu'}`)
}

main()
  .catch((e) => {
    console.error('❌ Seed hiba:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
