# JednoJedi – Claude Instructions

## Projekat
Srpska web app za planiranje ishrane i kontrolu troškova hrane. Next.js 16, Prisma v7, Supabase PostgreSQL, NextAuth v4 Google OAuth.

## Kritične napomene – PROČITAJ PRE SVEGA

### Prisma v7 arhitektura (potpuno drugačija od v5!)
- `url` i `directUrl` **NE IDU** u `schema.prisma` – šema ima samo `provider = "postgresql"`
- Runtime klijent: **obavezno koristiti `@prisma/adapter-pg`**
- CLI (migracije, seed): URL ide u `prisma.config.ts` → `datasource.url = DIRECT_URL`
- Seed: mora imati `import 'dotenv/config'` i koristiti adapter

```typescript
// src/lib/prisma.ts – JEDINI ISPRAVNI NAČIN
import { PrismaPg } from '@prisma/adapter-pg'
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
export const prisma = new PrismaClient({ adapter })
```

```bash
npx prisma db seed      # pokretanje seeda
npx prisma migrate dev  # nova migracija
npx prisma generate     # regeneracija klijenta
```

### Next.js 16 – Proxy umesto Middleware
- `src/middleware.ts` je **deprecated** → koristi `src/proxy.ts`
- Mora eksportovati funkciju (ne samo re-export):
```typescript
export default withAuth(function proxy() { return NextResponse.next() }, { ... })
```

### PrismaClientOptions u v7
- Nema `datasourceUrl` ni `datasources` opcija u konstruktoru
- Jedino što se prihvata: `adapter` ili `accelerateUrl`

## Tech Stack
- **Next.js 16.1.6** – App Router, TypeScript, Tailwind CSS v4
- **Prisma 7.4.2** + `@prisma/adapter-pg` + `pg`
- **NextAuth v4** + `@auth/prisma-adapter`
- **Recharts** – grafikon težine
- **tsx** – pokretanje seed skripte

## Env varijable (`.env` – nije u gitu)
```
DATABASE_URL=       # Supabase session pooler (port 6543) – za runtime
DIRECT_URL=         # Supabase direktna konekcija (port 5432) – za migracije
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
NEXTAUTH_SECRET=
NEXTAUTH_URL=       # http://localhost:3000 lokalno
```

## Struktura projekta
```
src/
  app/
    (auth)/login/         – login stranica (Google OAuth)
    (app)/                – zaštićene rute (proxy.ts)
      layout.tsx          – nav sa linkovoma
      dashboard/          – today's plan + weight chart
      onboarding/         – 3-step forma (pri prvoj prijavi)
      plan/new/           – kreiranje plana (3-step)
      plan/[id]/          – detalji + lista kupovine
      plans/              – istorija planova
      recipe/[id]/        – recept sa koracima
    api/
      auth/[...nextauth]/ – NextAuth handler
      plan/               – POST kreiranje, GET lista
      user/profile/       – PATCH ažuriranje profila
      weight/             – POST/GET logovanje težine
  components/
    providers.tsx         – SessionProvider
    sign-out-button.tsx   – client component
    weight-chart.tsx      – Recharts area chart + forma
  lib/
    prisma.ts             – singleton sa PrismaPg adapterom
    auth.ts               – NextAuth config
  types/
    index.ts              – custom types
    next-auth.d.ts        – session.user.id augmentation
  proxy.ts                – zaštita /dashboard, /onboarding, /plan ruta
prisma/
  schema.prisma           – DB šema (BEZ url u datasource!)
  seed.ts                 – 29 namirnica, 12 recepata
prisma.config.ts          – CLI config (DIRECT_URL, seed komanda)
```

## DB šema – entiteti
`User`, `Recipe`, `Ingredient`, `RecipeIngredient`, `MealPlan`, `PlanMeal`, `UserPrice`, `RegionalPrice`, `WeightLog`
NextAuth: `Account`, `Session`, `VerificationToken`
Enumi: `Mode` (PRECISE/RELAXED), `PlanType` (WEEKLY/DAILY/SINGLE), `Goal` (DEFICIT/SURPLUS/MAINTAIN)

## Komande
```bash
npm run dev       # lokalni server na :3000
npm run build     # TypeScript build provjera
npx prisma db seed
npx prisma migrate dev --name naziv_migracije
```

## Workflow pravila
- Uvek pokreni `npm run build` nakon izmena da proveriš TypeScript greške
- Nakon novih Prisma modela: `npx prisma migrate dev` + `npx prisma generate`
- Seed je idempotent (koristi `upsert`) – može se pokretati više puta

## Šta je urađeno
- [x] Google login + onboarding
- [x] Dashboard (danas iz plana, weight chart)
- [x] Kreiranje plana (WEEKLY/DAILY/SINGLE, DEFICIT/MAINTAIN/SURPLUS)
- [x] Plan detalj + lista kupovine sa cenama u RSD
- [x] Istorija planova
- [x] Recept detalj sa koracima i makroima
- [x] Praćenje težine (Recharts + API)

## Sledeći koraci
1. Deploy na Vercel + env vars
2. Google OAuth kredencijali za produkciju
3. Ažuriranje profila stranica
4. Filtriranje recepata po tagovima
5. Prijava lokalnih cena od korisnika
