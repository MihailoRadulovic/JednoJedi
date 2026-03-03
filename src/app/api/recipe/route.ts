import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { name, mealTypes, difficulty, prepTime, calories, protein, fat, carbs, steps, tags } = body

  if (!name?.trim()) return NextResponse.json({ error: 'Naziv je obavezan' }, { status: 400 })
  if (!mealTypes?.length) return NextResponse.json({ error: 'Izaberi bar jedan tip obroka' }, { status: 400 })
  if (!difficulty) return NextResponse.json({ error: 'Težina je obavezna' }, { status: 400 })
  if (!prepTime || prepTime < 1) return NextResponse.json({ error: 'Vreme pripreme mora biti > 0' }, { status: 400 })
  if (!calories || calories < 1) return NextResponse.json({ error: 'Kalorije moraju biti > 0' }, { status: 400 })
  if (!steps?.length || steps.every((s: string) => !s.trim())) {
    return NextResponse.json({ error: 'Dodaj bar jedan korak pripreme' }, { status: 400 })
  }

  const recipe = await prisma.recipe.create({
    data: {
      name: name.trim(),
      mealTypes,
      difficulty,
      prepTime: Number(prepTime),
      calories: Number(calories),
      protein: Number(protein ?? 0),
      fat: Number(fat ?? 0),
      carbs: Number(carbs ?? 0),
      steps: steps.filter((s: string) => s.trim()).map((s: string) => s.trim()),
      tags: tags ?? [],
      isCustom: true,
      createdBy: session.user.id,
    },
  })

  return NextResponse.json({ id: recipe.id })
}
