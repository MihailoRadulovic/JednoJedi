import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { PlanActions } from '@/components/plan-actions'
import { MealSwapButton } from '@/components/meal-swap-button'
import { ShoppingList } from '@/components/shopping-list'

const GOAL_LABEL: Record<string, string> = { DEFICIT: 'Mršavljenje 🔥', MAINTAIN: 'Održavanje ⚖️', SURPLUS: 'Masa 💪' }
const TYPE_LABEL: Record<string, string> = { WEEKLY: 'Nedeljni plan', DAILY: 'Dnevni plan', SINGLE: 'Jedan obrok' }
const MEAL_LABEL: Record<string, string> = { dorucak: 'Doručak', uzina: 'Užina', rucak: 'Ručak', vecera: 'Večera' }
const DAY_NAMES = ['Ponedeljak', 'Utorak', 'Sreda', 'Četvrtak', 'Petak', 'Subota', 'Nedelja']

export default async function PlanDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect('/login')

  const plan = await prisma.mealPlan.findUnique({
    where: { id, userId: session.user.id },
    include: {
      meals: {
        include: {
          recipe: {
            include: {
              ingredients: {
                include: { ingredient: true },
              },
            },
          },
        },
        orderBy: [{ day: 'asc' }, { mealType: 'asc' }],
      },
    },
  })

  if (!plan) notFound()

  // ─── Izračunaj listu kupovine ──────────────────────────────────────────────

  // Agregiramo sve namirnice iz svih recepata (po imenu/jedinici)
  type ShoppingItem = {
    name: string
    unit: string
    category: string
    totalAmount: number
    nationalPrice: number
    estimatedCost: number
  }

  const ingredientMap = new Map<string, ShoppingItem>()

  for (const meal of plan.meals) {
    for (const ri of meal.recipe.ingredients) {
      const key = ri.ingredient.id
      const existing = ingredientMap.get(key)
      const amount = ri.amount * plan.persons

      if (existing) {
        existing.totalAmount += amount
        existing.estimatedCost = existing.totalAmount * existing.nationalPrice
      } else {
        ingredientMap.set(key, {
          name: ri.ingredient.name,
          unit: ri.ingredient.unit,
          category: ri.ingredient.category,
          totalAmount: amount,
          nationalPrice: ri.ingredient.nationalPrice,
          estimatedCost: amount * ri.ingredient.nationalPrice,
        })
      }
    }
  }

  const shoppingItems = Array.from(ingredientMap.values())
  const totalCost = shoppingItems.reduce((sum, i) => sum + i.estimatedCost, 0)

  // Grupiši po kategoriji
  const byCategory = shoppingItems.reduce<Record<string, ShoppingItem[]>>((acc, item) => {
    if (!acc[item.category]) acc[item.category] = []
    acc[item.category].push(item)
    return acc
  }, {})

  // Grupiši obroke po danima za nedeljni prikaz
  type MealRow = typeof plan.meals[number]
  const mealsByDay: Record<number, MealRow[]> = {}
  if (plan.type === 'WEEKLY') {
    for (const meal of plan.meals) {
      const day = meal.day ?? 1
      if (!mealsByDay[day]) mealsByDay[day] = []
      mealsByDay[day].push(meal)
    }
  }

  // Ukupne kalorije i proteini po danu (za WEEKLY) ili ukupno
  const totalCals = plan.meals.reduce((sum, m) => sum + m.recipe.calories, 0)
  const totalProtein = plan.meals.reduce((sum, m) => sum + m.recipe.protein, 0)
  const days = plan.type === 'WEEKLY' ? 7 : 1
  const dailyCals = Math.round(totalCals / days)
  const dailyProtein = Math.round(totalProtein / days)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
            <Link href="/plans" className="hover:text-gray-700">← Planovi</Link>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">{TYPE_LABEL[plan.type]}</h1>
          <p className="text-gray-500 text-sm">{GOAL_LABEL[plan.goal]} · {plan.persons} {plan.persons === 1 ? 'osoba' : 'osobe'}</p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <Link href="/plan/new" className="text-sm text-green-600 hover:text-green-700 font-medium">
            + Novi plan
          </Link>
          <PlanActions planId={plan.id} currentStatus={plan.status} />
        </div>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-xl border border-gray-100 p-4 text-center">
          <div className="text-xl font-bold text-gray-900">{dailyCals.toLocaleString('sr')}</div>
          <div className="text-xs text-gray-500 mt-0.5">kcal/dan</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 text-center">
          <div className="text-xl font-bold text-gray-900">{dailyProtein}g</div>
          <div className="text-xs text-gray-500 mt-0.5">protein/dan</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 text-center">
          <div className="text-xl font-bold text-green-600">{Math.round(totalCost).toLocaleString('sr')}</div>
          <div className="text-xs text-gray-500 mt-0.5">RSD ukupno</div>
        </div>
      </div>

      {/* Meal plan */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="font-bold text-gray-900">Plan obroka</h2>
        </div>

        {plan.type === 'WEEKLY' && (
          <div>
            {Object.entries(mealsByDay).map(([day, meals]) => {
              const dayCals = meals.reduce((sum, m) => sum + m.recipe.calories, 0)
              return (
                <div key={day} className="border-b border-gray-100 last:border-b-0">
                  <div className="flex items-center justify-between px-5 py-3 bg-gray-50">
                    <span className="text-sm font-semibold text-gray-700">{DAY_NAMES[Number(day) - 1]}</span>
                    <span className="text-xs text-gray-500">{dayCals} kcal</span>
                  </div>
                  <div className="divide-y divide-gray-50">
                    {meals.map(meal => (
                      <div key={meal.id} className="px-5 py-3 flex items-start justify-between hover:bg-gray-50 transition group">
                        <Link href={`/recipe/${meal.recipe.id}`} className="flex-1">
                          <span className="text-xs font-medium text-green-600">{MEAL_LABEL[meal.mealType] ?? meal.mealType}</span>
                          <div className="text-sm font-medium text-gray-900 mt-0.5">{meal.recipe.name}</div>
                          <div className="flex gap-3 mt-1 text-xs text-gray-400">
                            <span>{meal.recipe.calories} kcal</span>
                            <span>{meal.recipe.protein}g P</span>
                            <span>{meal.recipe.fat}g M</span>
                            <span>{meal.recipe.carbs}g U</span>
                          </div>
                        </Link>
                        <div className="flex items-center gap-2 ml-4">
                          <span className="text-xs text-gray-400 whitespace-nowrap">{meal.recipe.prepTime} min</span>
                          <MealSwapButton planId={plan.id} mealId={meal.id} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {(plan.type === 'DAILY' || plan.type === 'SINGLE') && (
          <div className="divide-y divide-gray-100">
            {plan.meals.map(meal => (
              <div key={meal.id} className="px-5 py-4 flex items-start justify-between group">
                <Link href={`/recipe/${meal.recipe.id}`} className="flex-1">
                  <span className="text-xs font-medium text-green-600">{MEAL_LABEL[meal.mealType] ?? meal.mealType}</span>
                  <div className="text-sm font-medium text-gray-900 mt-0.5">{meal.recipe.name}</div>
                  <div className="flex gap-3 mt-1 text-xs text-gray-400">
                    <span>{meal.recipe.calories} kcal</span>
                    <span>{meal.recipe.protein}g P</span>
                    <span>{meal.recipe.fat}g M</span>
                    <span>{meal.recipe.carbs}g U</span>
                  </div>
                </Link>
                <div className="flex items-center gap-2 ml-4">
                  <span className="text-xs text-gray-400 whitespace-nowrap">{meal.recipe.prepTime} min</span>
                  <MealSwapButton planId={plan.id} mealId={meal.id} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Budget alert */}
      {plan.budget && totalCost > plan.budget && (
        <div className="bg-orange-50 border border-orange-200 rounded-2xl px-5 py-4 flex items-start gap-3">
          <span className="text-xl">⚠️</span>
          <div>
            <p className="text-sm font-semibold text-orange-800">Prekoracen budzet</p>
            <p className="text-xs text-orange-600 mt-0.5">
              Procenjena cena je <span className="font-bold">{Math.round(totalCost).toLocaleString('sr')} RSD</span>,
              a budzet je <span className="font-bold">{Math.round(plan.budget).toLocaleString('sr')} RSD</span>{' '}
              (razlika: +{Math.round(totalCost - plan.budget).toLocaleString('sr')} RSD).
              Zameni skuplje obroke ili povecaj budzet.
            </p>
          </div>
        </div>
      )}

      {/* Shopping list */}
      <ShoppingList
        items={shoppingItems}
        totalCost={totalCost}
        planId={plan.id}
        budget={plan.budget}
      />
    </div>
  )
}
