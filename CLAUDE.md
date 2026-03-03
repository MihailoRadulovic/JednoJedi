# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Projekat

Srpska web app za planiranje ishrane i kontrolu troškova hrane. Next.js 16 App Router, Prisma v7, Supabase PostgreSQL, NextAuth v4.

## Komande

```bash
npm run dev                               # lokalni server :3000
npm run build                            # TypeScript build (koristiti za proveru grešaka)
npm run lint                             # ESLint
npx prisma migrate dev --name naziv      # nova migracija
npx prisma generate                      # regeneracija klijenta – OBAVEZNO nakon svake migracije
npx prisma db seed                       # seed baze (idempotent)
```

Nema test frameworka – `npm run build` je jedina provera ispravnosti.

---

## Kritične arhitekturalne napomene

### Prisma v7 – driver adapter (NE klasičan setup!)

`url` i `directUrl` **ne idu** u `schema.prisma`. Datasource ima samo `provider = "postgresql"`.

Runtime zahteva driver adapter:
```typescript
// src/lib/prisma.ts
import { PrismaPg } from '@prisma/adapter-pg'
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
export const prisma = new PrismaClient({ adapter })
```

CLI (migracije, seed) koristi `prisma.config.ts` → `datasource.url = DIRECT_URL`.
`PrismaClientOptions` nema `datasourceUrl` ni `datasources` – samo `adapter`.
**Posle svake migracije obavezno pokrenuti `npx prisma generate`** – bez toga TypeScript ne vidi novi model.

### Next.js 16 – Proxy umesto Middleware

`src/middleware.ts` je deprecated. Zaštita ruta ide kroz `src/proxy.ts` koji mora eksportovati funkciju:
```typescript
export default withAuth(function proxy() { return NextResponse.next() }, { ... })
```

### NextAuth v4 – JWT strategija

Koristi `strategy: 'jwt'` (ne `database`) jer `CredentialsProvider` ne može kreirati DB sesije kroz PrismaAdapter.
Dev login: email-only `CredentialsProvider` aktivan samo kad `NODE_ENV !== 'production'`.
`session.user.id` je augmentovan u `src/types/next-auth.d.ts` (i Session i JWT interface).

---

## Arhitektura

### Data flow

Server komponente direktno pozivaju `prisma` i prosleđuju podatke kao props client komponentama. Nema state management biblioteke – lokalni `useState` + SWR-like pattern (fetch pa `router.refresh()`).

Mutacije iz client komponenti idu na API routes, zatim se UI osvežava kroz `router.refresh()` ili lokalni state update.

### Auth tok

`proxy.ts` → `getServerSession(authOptions)` u svakom server page-u → redirect na `/login` ako nema sesije. API routes rade isto i vraćaju `401`.

### Plan generisanje algoritam

`/api/plan` POST gradi `MealPlan` + `PlanMeal` redove. Recepti se biraju scoring funkcijom koja favorizuje globalno nekorišćene recepte (Set `usedGlobal` za celu nedelju), zatim dnevno nekorišćene, zatim kalorijski najbliže `targetCals / broj_obroka`. Mala random varijansa sprečava determinizam.

### Cene namirnica

Tri sloja: `nationalPrice` (na `Ingredient` – default), `UserPrice` (override po korisniku), `RegionalPrice` (weighted prosjek po gradu). Plan detalj i recept detalj trenutno koriste `nationalPrice`; `UserPrice` se upisuje kroz `PriceInput` komponentu na stranici recepta.

---

## DB šema – ključne napomene

| Model | Napomena |
|---|---|
| `Recipe` | `isCustom: Boolean`, `createdBy: String?` – za korisničke recepte; seed recepti imaju `createdBy = null` |
| `UserPrice` | `@@unique([userId, ingredientId])` – upsert pattern |
| `FavoriteRecipe` | `@@unique([userId, recipeId])` – toggle (delete ako postoji, create ako ne) |
| `MealPlan` | `status: String` – `"active"` \| `"completed"` \| `"archived"` |
| `PlanMeal` | `day: Int?` – null za DAILY/SINGLE, 1–7 za WEEKLY |

---

## Konvencije

- **Toast feedback** – sve client akcije sa side-effectom koriste `useToast()` iz `src/components/toast.tsx`
- **API responses** – greška: `{ error: string }` + odgovarajući HTTP status; uspeh: domenski objekat
- **Env varijable** – `DATABASE_URL` (Supabase pooler port 6543, runtime), `DIRECT_URL` (port 5432, migracije)

---

## Sledeći koraci

1. **Deploy na Vercel** – env vars: `DATABASE_URL`, `DIRECT_URL`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL` + dodati produkcijski domain u Google Cloud Console
2. **Kreiranje sopstvenog recepta** – schema ima `isCustom`/`createdBy` na `Recipe`, `DeleteRecipeButton` na recept stranici; nedostaje forma za kreiranje
3. **Napredna statistika** – grafikon kalorija kroz vreme, makro distribucija
