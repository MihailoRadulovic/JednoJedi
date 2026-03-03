import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'

const GOAL_LABEL: Record<string, string> = { DEFICIT: 'Mršavljenje 🔥', MAINTAIN: 'Održavanje ⚖️', SURPLUS: 'Masa 💪' }
const TYPE_LABEL: Record<string, string> = { WEEKLY: 'Nedeljni', DAILY: 'Dnevni', SINGLE: 'Jedan obrok' }
const STATUS_STYLE: Record<string, string> = {
  active: 'bg-green-50 text-green-700 border-green-200',
  archived: 'bg-gray-100 text-gray-500 border-gray-200',
  completed: 'bg-blue-50 text-blue-700 border-blue-200',
}
const STATUS_LABEL: Record<string, string> = { active: 'Aktivan', archived: 'Arhiviran', completed: 'Završen' }

function formatDate(d: Date) {
  return d.toLocaleDateString('sr-Latn-RS', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default async function PlansPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect('/login')

  const plans = await prisma.mealPlan.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
    include: {
      _count: { select: { meals: true } },
      meals: {
        include: { recipe: { select: { calories: true } } },
        take: 100,
      },
    },
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold text-gray-900">Istorija planova</h1>
          <p className="text-gray-500 text-sm mt-1 font-medium">{plans.length} {plans.length === 1 ? 'plan' : 'planova'} ukupno</p>
        </div>
        <Link
          href="/plan/new"
          className="bg-green-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-green-800 transition-all shadow-sm"
        >
          + Novi plan
        </Link>
      </div>

      {plans.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-10 text-center">
          <div className="text-4xl mb-3">📋</div>
          <h3 className="font-serif text-lg font-bold text-gray-900 mb-2">Još nema planova</h3>
          <p className="text-sm text-gray-500 mb-6">Kreiraj prvi plan ishrane.</p>
          <Link
            href="/plan/new"
            className="inline-block bg-green-700 text-white px-6 py-3 rounded-xl text-sm font-semibold hover:bg-green-800 transition-all"
          >
            Kreiraj plan →
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {plans.map(plan => {
            const totalCals = plan.meals.reduce((sum, m) => sum + m.recipe.calories, 0)
            const days = plan.type === 'WEEKLY' ? 7 : 1
            const dailyCals = Math.round(totalCals / days)

            return (
              <Link
                key={plan.id}
                href={`/plan/${plan.id}`}
                className="group block bg-white rounded-2xl border border-gray-100 p-5 hover:border-gray-200 hover:shadow-[0_2px_12px_rgba(0,0,0,0.06)] transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-gray-900 group-hover:text-green-700 transition-colors">
                        {TYPE_LABEL[plan.type]} plan
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-semibold border ${STATUS_STYLE[plan.status] ?? 'bg-gray-100 text-gray-500 border-gray-200'}`}>
                        {STATUS_LABEL[plan.status] ?? plan.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 font-medium">{GOAL_LABEL[plan.goal]}</p>
                  </div>
                  <span className="text-xs text-gray-400 ml-4 whitespace-nowrap font-medium">{formatDate(plan.createdAt)}</span>
                </div>

                <div className="flex gap-4 mt-3">
                  {[
                    plan._count.meals > 0 && `${plan._count.meals} obroka`,
                    dailyCals > 0 && `~${dailyCals} kcal/dan`,
                    plan.budget && `${plan.budget.toLocaleString('sr')} RSD`,
                    plan.persons > 1 && `${plan.persons} osobe`,
                  ].filter(Boolean).map((item, i) => (
                    <span key={i} className="text-xs text-gray-500 font-medium">{item}</span>
                  ))}
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
