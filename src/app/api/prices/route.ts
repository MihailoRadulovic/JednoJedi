import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

// POST /api/prices – upiši/ažuriraj korisničku cenu namirnice
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { ingredientId, price } = await req.json()
  if (!ingredientId || typeof price !== 'number' || price <= 0) {
    return NextResponse.json({ error: 'Neispravan zahtev' }, { status: 400 })
  }

  const userPrice = await prisma.userPrice.upsert({
    where: { userId_ingredientId: { userId: session.user.id, ingredientId } },
    update: { price },
    create: { userId: session.user.id, ingredientId, price },
  })

  return NextResponse.json({ ok: true, price: userPrice.price })
}

// GET /api/prices?recipeId=xxx – vrati korisničke cene za sve namirnice recepta
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const recipeId = req.nextUrl.searchParams.get('recipeId')
  if (!recipeId) return NextResponse.json({ error: 'recipeId required' }, { status: 400 })

  const userPrices = await prisma.userPrice.findMany({
    where: {
      userId: session.user.id,
      ingredient: { recipeIngredients: { some: { recipeId } } },
    },
    select: { ingredientId: true, price: true },
  })

  return NextResponse.json({ prices: Object.fromEntries(userPrices.map(p => [p.ingredientId, p.price])) })
}
