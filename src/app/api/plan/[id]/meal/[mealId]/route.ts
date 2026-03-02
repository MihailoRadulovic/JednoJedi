import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// PATCH – zameni obrok sa novim receptom istog tipa
export async function PATCH(
  _req: Request,
  { params }: { params: Promise<{ id: string; mealId: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id: planId, mealId } = await params

  // Provjeri da plan pripada korisniku
  const meal = await prisma.planMeal.findUnique({
    where: { id: mealId },
    include: { plan: { select: { userId: true } } },
  })

  if (!meal || meal.plan.userId !== session.user.id || meal.planId !== planId) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  // Nađi sve recepte istog tipa, isključi trenutni
  const candidates = await prisma.recipe.findMany({
    where: {
      mealTypes: { has: meal.mealType },
      id: { not: meal.recipeId },
    },
    select: { id: true },
  })

  if (!candidates.length) {
    return NextResponse.json({ error: 'Nema dostupnih zamena' }, { status: 409 })
  }

  const newRecipe = candidates[Math.floor(Math.random() * candidates.length)]

  const updated = await prisma.planMeal.update({
    where: { id: mealId },
    data: { recipeId: newRecipe.id },
    include: {
      recipe: { select: { id: true, name: true, calories: true, prepTime: true } },
    },
  })

  return NextResponse.json(updated)
}
