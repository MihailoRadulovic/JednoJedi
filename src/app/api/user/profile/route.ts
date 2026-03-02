import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { height: true, weight: true, birthYear: true, mode: true, region: true },
  })
  return NextResponse.json(user)
}

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const { height, weight, birthYear, mode, region } = body

  const user = await prisma.user.update({
    where: { id: session.user.id },
    data: {
      height: height ? Number(height) : undefined,
      weight: weight ? Number(weight) : undefined,
      birthYear: birthYear ? Number(birthYear) : undefined,
      mode: mode ?? undefined,
      region: region ?? undefined,
    },
    select: { id: true, height: true, weight: true, birthYear: true, mode: true, region: true },
  })

  // Log weight if provided
  if (weight) {
    await prisma.weightLog.create({
      data: { userId: session.user.id, weight: Number(weight) },
    })
  }

  return NextResponse.json(user)
}
