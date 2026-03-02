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
      {(() => {
        const bmi = user.weight && user.height ? +(user.weight / ((user.height / 100) ** 2)).toFixed(1) : null
        const bmiLabel = bmi === null ? '' : bmi < 18.5 ? 'Pothranjeno' : bmi < 25 ? 'Normalno' : bmi < 30 ? 'Prekomerno' : 'Gojaznost'
        const bmiColor = bmi === null ? '' : bmi < 18.5 ? 'text-blue-600' : bmi < 25 ? 'text-green-600' : bmi < 30 ? 'text-orange-500' : 'text-red-500'
        return (
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white rounded-2xl border border-gray-100 p-4 text-center">
              <div className="text-2xl font-bold text-gray-900">{user.weight} kg</div>
              <div className="text-xs text-gray-500 mt-1">Tezina</div>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 p-4 text-center">
              <div className="text-2xl font-bold text-gray-900">{user.height} cm</div>
              <div className="text-xs text-gray-500 mt-1">Visina</div>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 p-4 text-center">
              <div className={`text-2xl font-bold ${bmiColor}`}>{bmi ?? '–'}</div>
              <div className="text-xs text-gray-500 mt-1">BMI · {bmiLabel}</div>
            </div>
          </div>
        )
      })()}

      {/* Weight chart */}
      <WeightChart logs={weightLogsForChart} currentWeight={user.weight!} />

      {/* Active plan */}
      {!activePlan ? (
        <div className="space-y-3">
          <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-8 text-center">
            <div className="text-4xl mb-3">🍽️</div>
            <h3 className="font-semibold text-gray-900 mb-1">Nemaš aktivni plan ishrane</h3>
            <p className="text-sm text-gray-500 mb-6">Izaberi tip plana i mi ćemo automatski generisati obroke za tebe.</p>
            <div className="grid grid-cols-3 gap-3 mb-6">
              {[
                { type: 'WEEKLY', emoji: '📅', label: 'Nedeljni', desc: '7 dana obroka' },
                { type: 'DAILY', emoji: '🌤️', label: 'Dnevni', desc: '4 obroka' },
                { type: 'SINGLE', emoji: '🍽️', label: 'Jedan obrok', desc: 'Brzo' },
              ].map(opt => (
                <Link
                  key={opt.type}
                  href={`/plan/new`}
                  className="bg-gray-50 hover:bg-green-50 border border-gray-100 hover:border-green-200 rounded-xl p-3 text-center transition"
                >
                  <div className="text-2xl mb-1">{opt.emoji}</div>
                  <div className="text-xs font-semibold text-gray-800">{opt.label}</div>
                  <div className="text-xs text-gray-400">{opt.desc}</div>
                </Link>
              ))}
            </div>
            <Link
              href="/plan/new"
              className="inline-block bg-green-600 text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-green-700 transition"
            >
              Kreiraj plan →
            </Link>
          </div>
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
            <Link
              href={`/plan/${activePlan.id}`}
              className="text-xs text-green-600 hover:text-green-700 font-medium"
            >
              Vidi ceo plan →
            </Link>
          </div>

          {/* Kalorijski progress */}
          {activePlan.targetCals && totalCalsTodayPlan > 0 && (
            <div className="mb-4 p-3 bg-gray-50 rounded-xl">
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-gray-500">Kalorije danas</span>
                <span className="font-semibold text-gray-900">
                  {totalCalsTodayPlan} / {Math.round(activePlan.targetCals)} kcal
                </span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    totalCalsTodayPlan > activePlan.targetCals ? 'bg-orange-400' : 'bg-green-500'
                  }`}
                  style={{ width: `${Math.min(100, (totalCalsTodayPlan / activePlan.targetCals) * 100)}%` }}
                />
              </div>
              {totalCalsTodayPlan > activePlan.targetCals && (
                <p className="text-xs text-orange-500 mt-1">+{totalCalsTodayPlan - Math.round(activePlan.targetCals)} kcal iznad cilja</p>
              )}
            </div>
          )}

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
