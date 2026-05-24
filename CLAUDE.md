# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Backend (`/backend`)
```powershell
npm run dev          # tsx watch src/index.ts → http://localhost:3001
npm run build        # tsc compile to dist/
npm run db:migrate   # prisma migrate dev (requires .env with DATABASE_URL)
npm run db:seed      # populate DB with starter data
npm run db:studio    # open Prisma Studio UI
npm run db:reset     # migrate reset + seed
```

### Frontend (`/frontend`)
```powershell
npm run dev          # vite → http://localhost:5173
npm run build        # tsc + vite build
npx vite --host      # expose to local network (mobile testing)
```

### Setup (first time)
Both `backend` and `frontend` need their own `.env` / dependencies:
```powershell
# root
Copy-Item .env.example .env
Copy-Item .env.example backend/.env

cd backend && npm install
npm run db:migrate
npm run db:seed

cd ../frontend && npm install
```

`.env` required variables: `DATABASE_URL`, `JWT_SECRET`, `PORT` (3001), `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `VITE_API_URL`.

---

## Architecture

### Overview
Full-stack Magyar Netflix clone. Two independent apps that must run simultaneously:
- **Frontend** → Vite + React 18 + TypeScript + Tailwind CSS + Framer Motion, port 5173
- **Backend** → Express + TypeScript + Prisma ORM, port 3001
- **Database** → PostgreSQL (local) / Supabase (prod)

### Backend (`backend/src/`)
- `index.ts` — Express app setup, CORS (`FRONTEND_URL` env or `localhost:5173`), routes mounted at `/api/*`
- `routes/` — thin routers (`moments`, `categories`, `search`, `auth`) that delegate to controllers
- `controllers/` — all business logic; `momentsController` handles CRUD + async viewCount increment
- `middleware/auth.ts` — JWT verification middleware used on protected routes (POST/PUT/DELETE moments)
- `middleware/errorHandler.ts` — global error handler, must be last middleware
- `lib/prisma.ts` — singleton Prisma client

### Frontend (`frontend/src/`)
- `lib/api.ts` — central Axios instance (`VITE_API_URL` env); JWT auto-attached via request interceptor; 401 → redirect to `/`
- `hooks/useMoments.ts` — `useMoments(params?)` and `useCategories()` React hooks wrapping API calls
- `hooks/useSearch.ts` — debounced search hook
- `types/index.ts` — shared TypeScript interfaces (`Moment`, `Category`, `LoginResponse`)

### Key data flow
1. `Home.tsx` fetches all moments + categories, groups them by category, extracts `topViral` (sorted by `viralScore` desc, top 10)
2. `MomentRow` renders a horizontally scrollable row with chevron buttons
3. `MomentCard` → click opens `MomentModal` inline (state lifted to card level)
4. `MomentModal` detects `platform === 'shorts'` and renders 9:16 iframe instead of 16:9

### Data model highlights
- `Moment.platform`: `'regular'` | `'shorts'` — controls player aspect ratio
- `Moment.viralScore`: 0–100 — used for sorting and badge display (`>= 90` shows 🔥 VIRAL)
- `Moment.isHero`: boolean — first `isHero` moment becomes the Hero banner on Home
- `Moment.tags`: `String[]` (PostgreSQL array)

### Auth
- Admin-only operations require `Authorization: Bearer <JWT>` header
- Token stored in `localStorage` as `peterflix_token`
- Admin credentials come from `.env` (`ADMIN_EMAIL` / `ADMIN_PASSWORD`)
- `/admin` route is unguarded on frontend — security is enforced by the API

### Styling conventions
- Dark theme constants defined as CSS variables in `index.css` (`--netflix-red: #e50914`, `--netflix-dark: #0a0a0a`, etc.) and as Tailwind custom colors
- Reusable Tailwind component classes: `.btn-primary`, `.btn-secondary`, `.card-hover`, `.admin-input`, `.viral-bar`
- Framer Motion used for: Hero entrance, MomentCard hover scale, MomentModal spring entrance, viral score bar animation
