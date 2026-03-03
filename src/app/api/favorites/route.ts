import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

// GET /api/favorites – lista omiljenih recepata
export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const favorites = await prisma.favoriteRecipe.findMany({
    where: { userId: session.user.id },
    select: { recipeId: true },
  })

  return NextResponse.json({ recipeIds: favorites.map(f => f.recipeId) })
}

// POST /api/favorites – toggle omiljenog recepta
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { recipeId } = await req.json()
  if (!recipeId) return NextResponse.json({ error: 'recipeId required' }, { status: 400 })

  const existing = await prisma.favoriteRecipe.findUnique({
    where: { userId_recipeId: { userId: session.user.id, recipeId } },
  })

  if (existing) {
    await prisma.favoriteRecipe.delete({ where: { id: existing.id } })
    return NextResponse.json({ favorited: false })
  } else {
    await prisma.favoriteRecipe.create({
      data: { userId: session.user.id, recipeId },
    })
    return NextResponse.json({ favorited: true })
  }
}
