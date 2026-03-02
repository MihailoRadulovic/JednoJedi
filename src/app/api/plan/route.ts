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

function pickRecipe(
  recipes: RecipeRow[],
  mealType: MealType,
  goal: Goal,
  usedToday: Set<string>,
  usedGlobal: Set<string>,
  targetPerMeal?: number
): RecipeRow | null {
  const candidates = recipes.filter(r => r.mealTypes.includes(mealType))
  if (!candidates.length) return null

  const score = (r: RecipeRow): number => {
    let s = 0
    if (!usedGlobal.has(r.id)) s += 100
    if (!usedToday.has(r.id)) s += 50
    if (targetPerMeal) {
      const diff = Math.abs(r.calories - targetPerMeal)
      s += Math.max(0, 40 - diff / 10)
    } else {
      if (goal === 'DEFICIT') s += (500 - r.calories) / 10
      if (goal === 'SURPLUS') s += (r.calories - 300) / 10
    }
    return s + Math.random() * 15
  }

  return [...candidates].sort((a, b) => score(b) - score(a))[0]
}

function buildMeals(
  recipes: RecipeRow[],
  type: PlanType,
  goal: Goal,
  mealType?: MealType,
  targetCals?: number
): { day?: number; mealType: string; recipeId: string }[] {
  const meals: { day?: number; mealType: string; recipeId: string }[] = []
  const targetPerMeal = targetCals ? targetCals / MEAL_TYPES.length : undefined

  if (type === 'SINGLE') {
    const mt = mealType ?? 'rucak'
    const recipe = pickRecipe(recipes, mt as MealType, goal, new Set(), new Set(), targetCals)
    if (recipe) meals.push({ mealType: mt, recipeId: recipe.id })
    return meals
  }

  const days = type === 'WEEKLY' ? 7 : 1
  const usedGlobal = new Set<string>()

  for (let day = 1; day <= days; day++) {
    const usedToday = new Set<string>()
    for (const mt of MEAL_TYPES) {
      const recipe = pickRecipe(recipes, mt, goal, usedToday, usedGlobal, targetPerMeal)
      if (recipe) {
        usedToday.add(recipe.id)
        usedGlobal.add(recipe.id)
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

  const meals = buildMeals(recipes, type, goal, mealType, targetCals ? Number(targetCals) : undefined)

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
