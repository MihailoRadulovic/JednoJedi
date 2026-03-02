import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const { status } = await req.json()

  if (!['active', 'completed', 'archived'].includes(status)) {
    return NextResponse.json({ error: 'Nevalidan status' }, { status: 400 })
  }

  const plan = await prisma.mealPlan.findUnique({ where: { id }, select: { userId: true } })
  if (!plan || plan.userId !== session.user.id) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const updated = await prisma.mealPlan.update({
    where: { id },
    data: { status },
    select: { id: true, status: true },
  })

  return NextResponse.json(updated)
}
