import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { weight } = await req.json()
  if (!weight || isNaN(Number(weight))) {
    return NextResponse.json({ error: 'Nevalidna vrednost' }, { status: 400 })
  }

  const kg = Number(weight)

  const [log] = await Promise.all([
    prisma.weightLog.create({
      data: { userId: session.user.id, weight: kg },
    }),
    prisma.user.update({
      where: { id: session.user.id },
      data: { weight: kg },
    }),
  ])

  return NextResponse.json(log)
}

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const logs = await prisma.weightLog.findMany({
    where: { userId: session.user.id },
    orderBy: { loggedAt: 'asc' },
    take: 90,
    select: { weight: true, loggedAt: true },
  })

  return NextResponse.json(logs)
}
