import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import type { Goal, PlanType } from '@prisma/client'

const MEAL_TYPES = ['dorucak', 'uzina', 'rucak', 'vecera'] as const
type MealType = typeof MEAL_TYPES[number]

type RecipeRow = {
  id: string
  mealTypes: string[]
  calories: number
}

function pickRecipe(recipes: RecipeRow[], mealType: MealType, goal: Goal, used: Set<string>): RecipeRow | null {
  const candidates = recipes.filter(r => r.mealTypes.includes(mealType))
  if (!candidates.length) return null

  // Sort by calories based on goal – prefer lower for deficit, higher for surplus
  const sorted = [...candidates].sort((a, b) =>
    goal === 'DEFICIT' ? a.calories - b.calories :
    goal === 'SURPLUS' ? b.calories - a.calories :
    0
  )

  // Take top half (goal-appropriate), shuffle to add variety
  const pool = sorted.slice(0, Math.max(1, Math.ceil(sorted.length / 2)))
  const shuffled = pool.sort(() => Math.random() - 0.5)

  // Prefer recipes not already used today
  return shuffled.find(r => !used.has(r.id)) ?? shuffled[0]
}

function buildMeals(
  recipes: RecipeRow[],
  type: PlanType,
  goal: Goal,
  mealType?: MealType
): { day?: number; mealType: string; recipeId: string }[] {
  const meals: { day?: number; mealType: string; recipeId: string }[] = []

  if (type === 'SINGLE') {
    const mt = mealType ?? 'rucak'
    const recipe = pickRecipe(recipes, mt as MealType, goal, new Set())
    if (recipe) meals.push({ mealType: mt, recipeId: recipe.id })
    return meals
  }

  const days = type === 'WEEKLY' ? 7 : 1

  for (let day = 1; day <= days; day++) {
    const usedToday = new Set<string>()
    for (const mt of MEAL_TYPES) {
      const recipe = pickRecipe(recipes, mt, goal, usedToday)
      if (recipe) {
        usedToday.add(recipe.id)
        meals.push({ day: type === 'WEEKLY' ? day : undefined, mealType: mt, recipeId: recipe.id })
      }
    }
  }

  return meals
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const {
    type,
    goal,
    persons = 1,
    budget,
    targetCals,
    mealType,
  }: {
    type: PlanType
    goal: Goal
    persons?: number
    budget?: number
    targetCals?: number
    mealType?: MealType
  } = body

  if (!type || !goal) {
    return NextResponse.json({ error: 'type i goal su obavezni' }, { status: 400 })
  }

  // Deactivate previous active plans
  await prisma.mealPlan.updateMany({
    where: { userId: session.user.id, status: 'active' },
    data: { status: 'archived' },
  })

  // Load all recipes (lightweight – only id, mealTypes, calories)
  const recipes = await prisma.recipe.findMany({
    select: { id: true, mealTypes: true, calories: true },
  })

  const meals = buildMeals(recipes, type, goal, mealType)

  const plan = await prisma.mealPlan.create({
    data: {
      userId: session.user.id,
      type,
      goal,
      persons: Number(persons),
      budget: budget ? Number(budget) : null,
      targetCals: targetCals ? Number(targetCals) : null,
      status: 'active',
      meals: {
        create: meals,
      },
    },
    select: { id: true },
  })

  return NextResponse.json({ id: plan.id })
}

export async function GET(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const plans = await prisma.mealPlan.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
    take: 10,
    select: {
      id: true,
      type: true,
      goal: true,
      persons: true,
      budget: true,
      targetCals: true,
      status: true,
      createdAt: true,
      _count: { select: { meals: true } },
    },
  })

  return NextResponse.json(plans)
}
