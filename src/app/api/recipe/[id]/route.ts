import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const recipe = await prisma.recipe.findUnique({ where: { id } })
  if (!recipe) return NextResponse.json({ error: 'Recept nije pronađen' }, { status: 404 })
  if (recipe.createdBy !== session.user.id) {
    return NextResponse.json({ error: 'Nemaš pravo da obrišeš ovaj recept' }, { status: 403 })
  }

  await prisma.recipe.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
