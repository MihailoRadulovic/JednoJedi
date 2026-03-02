import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'

const GOAL_LABEL: Record<string, string> = { DEFICIT: 'Mršavljenje 🔥', MAINTAIN: 'Održavanje ⚖️', SURPLUS: 'Masa 💪' }
const TYPE_LABEL: Record<string, string> = { WEEKLY: 'Nedeljni plan', DAILY: 'Dnevni plan', SINGLE: 'Jedan obrok' }
const MEAL_LABEL: Record<string, string> = { dorucak: 'Doručak', uzina: 'Užina', rucak: 'Ručak', vecera: 'Večera' }
const DAY_NAMES = ['Ponedeljak', 'Utorak', 'Sreda', 'Četvrtak', 'Petak', 'Subota', 'Nedelja']
const CATEGORY_LABEL: Record<string, string> = {
  meso: '🥩 Meso i riba', mlecni: '🥛 Mlečni i jaja', zitarice: '🌾 Žitarice',
  povrce: '🥦 Povrće i voće', zacini: '🫙 Začini i ulja', ostalo: '🛒 Ostalo',
}

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
            <Link href="/dashboard" className="hover:text-gray-700">← Dashboard</Link>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">{TYPE_LABEL[plan.type]}</h1>
          <p className="text-gray-500 text-sm">{GOAL_LABEL[plan.goal]} · {plan.persons} {plan.persons === 1 ? 'osoba' : 'osobe'}</p>
        </div>
        <Link
          href="/plan/new"
          className="text-sm text-green-600 hover:text-green-700 font-medium"
        >
          + Novi plan
        </Link>
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
                      <div key={meal.id} className="px-5 py-3 flex items-start justify-between hover:bg-gray-50 transition">
                        <div>
                          <span className="text-xs font-medium text-green-600">{MEAL_LABEL[meal.mealType] ?? meal.mealType}</span>
                          <div className="text-sm font-medium text-gray-900 mt-0.5">{meal.recipe.name}</div>
                          <div className="flex gap-3 mt-1 text-xs text-gray-400">
                            <span>{meal.recipe.calories} kcal</span>
                            <span>{meal.recipe.protein}g P</span>
                            <span>{meal.recipe.fat}g M</span>
                            <span>{meal.recipe.carbs}g U</span>
                          </div>
                        </div>
                        <span className="text-xs text-gray-400 ml-4 whitespace-nowrap">{meal.recipe.prepTime} min</span>
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
              <div key={meal.id} className="px-5 py-4 flex items-start justify-between">
                <div>
                  <span className="text-xs font-medium text-green-600">{MEAL_LABEL[meal.mealType] ?? meal.mealType}</span>
                  <div className="text-sm font-medium text-gray-900 mt-0.5">{meal.recipe.name}</div>
                  <div className="flex gap-3 mt-1 text-xs text-gray-400">
                    <span>{meal.recipe.calories} kcal</span>
                    <span>{meal.recipe.protein}g P</span>
                    <span>{meal.recipe.fat}g M</span>
                    <span>{meal.recipe.carbs}g U</span>
                  </div>
                </div>
                <span className="text-xs text-gray-400 ml-4 whitespace-nowrap">{meal.recipe.prepTime} min</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Shopping list */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="font-bold text-gray-900">Lista kupovine</h2>
          <span className="text-sm font-semibold text-green-600">≈ {Math.round(totalCost).toLocaleString('sr')} RSD</span>
        </div>

        {plan.budget && totalCost > plan.budget && (
          <div className="mx-5 mt-4 p-3 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-700">
            ⚠️ Procenjena cena ({Math.round(totalCost).toLocaleString('sr')} RSD) premašuje tvoj budžet ({plan.budget.toLocaleString('sr')} RSD)
          </div>
        )}

        <div className="divide-y divide-gray-100">
          {Object.entries(byCategory)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([category, items]) => (
              <div key={category}>
                <div className="px-5 py-2.5 bg-gray-50">
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    {CATEGORY_LABEL[category] ?? category}
                  </span>
                </div>
                {items.sort((a, b) => a.name.localeCompare(b.name)).map(item => {
                  const displayAmount = item.unit === 'kg'
                    ? item.totalAmount >= 1
                      ? `${item.totalAmount.toFixed(item.totalAmount % 1 === 0 ? 0 : 2)} kg`
                      : `${Math.round(item.totalAmount * 1000)} g`
                    : item.unit === 'litar'
                    ? item.totalAmount >= 1
                      ? `${item.totalAmount.toFixed(item.totalAmount % 1 === 0 ? 0 : 2)} l`
                      : `${Math.round(item.totalAmount * 100) * 10} ml`
                    : `${item.totalAmount % 1 === 0 ? item.totalAmount : item.totalAmount.toFixed(1)} ${item.unit}`

                  return (
                    <div key={item.name} className="px-5 py-3 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-4 h-4 rounded border-2 border-gray-300 flex-shrink-0" />
                        <div>
                          <span className="text-sm text-gray-900">{item.name}</span>
                          <span className="text-xs text-gray-500 ml-2">{displayAmount}</span>
                        </div>
                      </div>
                      <span className="text-sm text-gray-600 font-medium">
                        ≈ {Math.round(item.estimatedCost).toLocaleString('sr')} RSD
                      </span>
                    </div>
                  )
                })}
              </div>
            ))}
        </div>

        <div className="px-5 py-4 border-t border-gray-100 flex justify-between">
          <span className="text-sm font-medium text-gray-700">Ukupno</span>
          <span className="text-base font-bold text-gray-900">≈ {Math.round(totalCost).toLocaleString('sr')} RSD</span>
        </div>
      </div>
    </div>
  )
}
