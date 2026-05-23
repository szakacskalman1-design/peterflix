# 🎬 PéterFlix

> Magyar Netflix-stílusú streaming platform, amely Magyar Péter legjobb és legviccesebb pillanatait gyűjti össze.

---

## 🛠️ Tech stack

| Réteg | Technológia |
|---|---|
| Frontend | React 18 + Vite + TypeScript + Tailwind CSS + Framer Motion |
| Backend | Node.js + Express + TypeScript |
| Adatbázis | PostgreSQL + Prisma ORM |
| Auth | JWT (email/jelszó az admin panelhez) |
| Hosting | Vercel (frontend) + Railway (backend) |

---

## ⚡ Gyors indítás

### Előfeltételek
- Node.js 18+
- PostgreSQL adatbázis

### 1. Környezeti változók beállítása

```bash
cp .env.example .env
# Töltsd ki a DATABASE_URL és JWT_SECRET mezőket!
```

### 2. Backend indítása

```bash
cd backend
npm install
npm run db:migrate    # adatbázis migrálása
npm run db:seed       # starter adatok betöltése
npm run dev           # → http://localhost:3001
```

### 3. Frontend indítása (új terminálban)

```bash
cd frontend
npm install
npm run dev           # → http://localhost:5173
```

---

## 📁 Projekt struktúra

```
peterflix/
├── frontend/          # React Vite alkalmazás
│   └── src/
│       ├── components/  # Navbar, Hero, MomentCard, MomentModal…
│       ├── pages/       # Home, Category, Moment, Admin
│       ├── hooks/       # useMoments, useSearch
│       ├── types/       # TypeScript típusok
│       └── lib/         # Axios API kliens
└── backend/           # Express API szerver
    ├── src/
    │   ├── routes/      # moments, categories, search, auth
    │   ├── controllers/ # üzleti logika
    │   └── middleware/  # JWT auth, hibakezelés
    └── prisma/
        ├── schema.prisma
        └── seed.ts
```

---

## 🔌 API végpontok

| Metódus | Útvonal | Leírás |
|---|---|---|
| GET | `/api/moments` | Összes pillanat (szűrés: `?category=&sort=viral\|recent&limit=`) |
| GET | `/api/moments/:id` | Egy pillanat (növeli a viewCount-ot) |
| POST | `/api/moments` | Új pillanat (admin) |
| PUT | `/api/moments/:id` | Pillanat szerkesztése (admin) |
| DELETE | `/api/moments/:id` | Pillanat törlése (admin) |
| GET | `/api/categories` | Kategóriák pillanatszámmal |
| GET | `/api/search?q=` | Teljes szöveges keresés |
| POST | `/api/auth/login` | Admin bejelentkezés → JWT |

---

## ➕ Hogyan adj hozzá új pillanatot?

### A) Admin panelen keresztül (ajánlott)

1. Nyisd meg: `http://localhost:5173/admin`
2. Jelentkezz be az `.env`-ben megadott `ADMIN_EMAIL` / `ADMIN_PASSWORD` adatokkal
3. Töltsd ki az űrlapot:
   - **YouTube ID**: a videó linkjéből, pl. `https://youtube.com/watch?v=`**`dQw4w9WgXcQ`**
   - **Virális pontszám**: 0–100 (becsüld meg a nézettség/visszhang alapján)
   - **Hero pillanat**: ha ezt bejelölöd, a főoldalon kiemelt sávban jelenik meg

### B) Közvetlen API hívással

```bash
# Először szerezz tokent
TOKEN=$(curl -s -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@peterflix.hu","password":"changeme"}' \
  | jq -r .token)

# Aztán add hozzá a pillanatot
curl -X POST http://localhost:3001/api/moments \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Az új pillanat neve",
    "description": "Rövid leírás magyarul",
    "youtubeId": "YOUTUBE_VIDEO_ID",
    "year": 2024,
    "duration": 180,
    "viralScore": 88,
    "categoryId": "CATEGORY_UUID",
    "tags": ["vicces", "parlamenti"]
  }'
```

### C) Seed fájl szerkesztése (`backend/prisma/seed.ts`)

Adj hozzá egy új bejegyzést a `moments` tömbhöz, majd futtasd:

```bash
cd backend && npm run db:seed
```

---

## 🚀 Deploy

### Frontend → Vercel
```bash
cd frontend && npm run build
# Vercel automatikusan detektálja a Vite projektet
# Állítsd be: VITE_API_URL=https://your-backend.railway.app/api
```

### Backend → Railway
```bash
# railway.toml már konfigurált
# Állítsd be a Railway env változókat:
# DATABASE_URL, JWT_SECRET, PORT, ADMIN_EMAIL, ADMIN_PASSWORD
```

---

*PéterFlix — Mert minden pillanat megörökítést érdemel* 🇭🇺
