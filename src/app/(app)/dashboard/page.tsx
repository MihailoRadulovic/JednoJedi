import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { WeightChart } from '@/components/weight-chart'

const GOAL_LABEL: Record<string, string> = {
  DEFICIT: 'Mršavljenje 🔥',
  MAINTAIN: 'Održavanje ⚖️',
  SURPLUS: 'Masa 💪',
}

const MEAL_TYPE_LABEL: Record<string, string> = {
  dorucak: 'Doručak',
  uzina: 'Užina',
  rucak: 'Ručak',
  vecera: 'Večera',
}

// Today's ISO weekday: 1=Mon … 7=Sun (matching our day field)
function todayDay() {
  const d = new Date().getDay() // 0=Sun,1=Mon,...,6=Sat
  return d === 0 ? 7 : d
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect('/login')

  const [user, activePlan, weightLogs] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { name: true, height: true, weight: true, birthYear: true, region: true, mode: true },
    }),
    prisma.mealPlan.findFirst({
      where: { userId: session.user.id, status: 'active' },
      orderBy: { createdAt: 'desc' },
      include: {
        meals: {
          include: { recipe: { select: { id: true, name: true, calories: true, prepTime: true } } },
          orderBy: [{ day: 'asc' }, { mealType: 'asc' }],
        },
      },
    }),
    prisma.weightLog.findMany({
      where: { userId: session.user.id },
      orderBy: { loggedAt: 'asc' },
      take: 60,
      select: { weight: true, loggedAt: true },
    }),
  ])

  if (!user?.height || !user?.weight || !user?.birthYear) {
    redirect('/onboarding')
  }

  // For WEEKLY plan – show only today's meals
  const today = todayDay()
  const todayMeals = activePlan?.type === 'WEEKLY'
    ? activePlan.meals.filter(m => m.day === today)
    : activePlan?.meals ?? []

  const totalCalsTodayPlan = todayMeals.reduce((sum, m) => sum + m.recipe.calories, 0)

  const weightLogsForChart = weightLogs.map(l => ({
    weight: l.weight,
    loggedAt: l.loggedAt.toISOString(),
  }))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Zdravo, {user.name?.split(' ')[0] ?? 'korisniče'} 👋
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {user.region} · {user.mode === 'PRECISE' ? 'Precizni mod' : 'Opušteni mod'}
          </p>
        </div>
        <Link
          href="/plan/new"
          className="bg-green-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-green-700 transition"
        >
          + Novi plan
        </Link>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 p-4 text-center">
          <div className="text-2xl font-bold text-gray-900">{user.height} cm</div>
          <div className="text-xs text-gray-500 mt-1">Visina</div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-4 text-center">
          <div className="text-2xl font-bold text-gray-900">{new Date().getFullYear() - user.birthYear!}</div>
          <div className="text-xs text-gray-500 mt-1">Godina</div>
        </div>
      </div>

      {/* Weight chart */}
      <WeightChart logs={weightLogsForChart} currentWeight={user.weight!} />

      {/* Active plan */}
      {!activePlan ? (
        <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-10 text-center">
          <div className="text-4xl mb-3">🍽️</div>
          <h3 className="font-semibold text-gray-900 mb-2">Nemaš aktivni plan</h3>
          <p className="text-sm text-gray-500 mb-6">Kreiraj nedeljni, dnevni ili pojedinačni obrok plan.</p>
          <Link
            href="/plan/new"
            className="inline-block bg-green-600 text-white px-6 py-3 rounded-xl text-sm font-medium hover:bg-green-700 transition"
          >
            Kreiraj plan →
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-bold text-gray-900">
                {activePlan.type === 'WEEKLY'
                  ? 'Danas'
                  : activePlan.type === 'DAILY'
                  ? 'Dnevni plan'
                  : 'Obrok'}
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">{GOAL_LABEL[activePlan.goal]}</p>
            </div>
            <div className="flex items-center gap-3">
              {totalCalsTodayPlan > 0 && (
                <span className="text-xs text-gray-500">{totalCalsTodayPlan} kcal</span>
              )}
              <Link
                href={`/plan/${activePlan.id}`}
                className="text-xs text-green-600 hover:text-green-700 font-medium"
              >
                Vidi plan →
              </Link>
            </div>
          </div>

          <div className="divide-y divide-gray-100">
            {todayMeals.map(meal => (
              <Link
                key={meal.id}
                href={`/recipe/${meal.recipe.id}`}
                className="py-3 flex items-center justify-between hover:bg-gray-50 -mx-2 px-2 rounded-lg transition"
              >
                <div>
                  <span className="text-xs text-green-600 font-medium">{MEAL_TYPE_LABEL[meal.mealType] ?? meal.mealType}</span>
                  <div className="text-sm font-medium text-gray-900 mt-0.5">{meal.recipe.name}</div>
                </div>
                <div className="text-right ml-4">
                  <div className="text-xs text-gray-500">{meal.recipe.calories} kcal</div>
                  <div className="text-xs text-gray-400">{meal.recipe.prepTime} min</div>
                </div>
              </Link>
            ))}
            {todayMeals.length === 0 && (
              <p className="text-sm text-gray-400 py-3">Nema obroka za danas u planu.</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
