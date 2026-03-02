import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'

const MEAL_LABEL: Record<string, string> = { dorucak: 'Doručak', uzina: 'Užina', rucak: 'Ručak', vecera: 'Večera' }
const DIFFICULTY_LABEL: Record<string, string> = { lako: 'Lako', srednje: 'Srednje', tesko: 'Teško' }
const DIFFICULTY_COLOR: Record<string, string> = {
  lako: 'bg-green-50 text-green-700',
  srednje: 'bg-amber-50 text-amber-700',
  tesko: 'bg-red-50 text-red-700',
}

export default async function RecipePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect('/login')

  const recipe = await prisma.recipe.findUnique({
    where: { id },
    include: {
      ingredients: {
        include: { ingredient: true },
        orderBy: { amount: 'desc' },
      },
    },
  })

  if (!recipe) notFound()

  // Estimate total cost
  const estimatedCost = recipe.ingredients.reduce(
    (sum, ri) => sum + ri.amount * ri.ingredient.nationalPrice,
    0
  )

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Back */}
      <div className="text-sm text-gray-500">
        <button onClick={() => history.back()} className="hover:text-gray-700">← Nazad</button>
      </div>

      {/* Header */}
      <div>
        <div className="flex flex-wrap gap-2 mb-3">
          {recipe.mealTypes.map(mt => (
            <span key={mt} className="text-xs bg-green-50 text-green-700 px-2.5 py-1 rounded-full font-medium">
              {MEAL_LABEL[mt] ?? mt}
            </span>
          ))}
          <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${DIFFICULTY_COLOR[recipe.difficulty] ?? 'bg-gray-100 text-gray-600'}`}>
            {DIFFICULTY_LABEL[recipe.difficulty] ?? recipe.difficulty}
          </span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">{recipe.name}</h1>
        <p className="text-sm text-gray-500 mt-1">{recipe.prepTime} min pripreme</p>
      </div>

      {/* Makroi */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Kalorije', value: `${recipe.calories}`, unit: 'kcal', color: 'text-orange-600' },
          { label: 'Proteini', value: `${recipe.protein}`, unit: 'g', color: 'text-blue-600' },
          { label: 'Masti', value: `${recipe.fat}`, unit: 'g', color: 'text-yellow-600' },
          { label: 'Ugljeni hid.', value: `${recipe.carbs}`, unit: 'g', color: 'text-purple-600' },
        ].map(m => (
          <div key={m.label} className="bg-white rounded-xl border border-gray-100 p-3 text-center">
            <div className={`text-lg font-bold ${m.color}`}>{m.value}<span className="text-xs font-normal text-gray-500 ml-0.5">{m.unit}</span></div>
            <div className="text-xs text-gray-500 mt-0.5">{m.label}</div>
          </div>
        ))}
      </div>

      {/* Sastojci */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="font-bold text-gray-900">Sastojci</h2>
          <span className="text-sm text-gray-500">≈ {Math.round(estimatedCost).toLocaleString('sr')} RSD</span>
        </div>
        <div className="divide-y divide-gray-100">
          {recipe.ingredients.map(ri => {
            const { ingredient, amount } = ri
            const displayAmount = ingredient.unit === 'kg'
              ? amount >= 1
                ? `${amount % 1 === 0 ? amount : amount.toFixed(2)} kg`
                : `${Math.round(amount * 1000)} g`
              : ingredient.unit === 'litar'
              ? amount >= 1
                ? `${amount % 1 === 0 ? amount : amount.toFixed(2)} l`
                : `${Math.round(amount * 1000)} ml`
              : `${amount % 1 === 0 ? amount : amount.toFixed(1)} ${ingredient.unit}`

            const itemCost = amount * ingredient.nationalPrice

            return (
              <div key={ri.id} className="px-5 py-3 flex items-center justify-between">
                <div>
                  <span className="text-sm font-medium text-gray-900">{ingredient.name}</span>
                  <span className="text-xs text-gray-500 ml-2">{displayAmount}</span>
                </div>
                <span className="text-xs text-gray-500">≈ {Math.round(itemCost)} RSD</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Koraci */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="font-bold text-gray-900">Priprema</h2>
        </div>
        <div className="p-5 space-y-4">
          {recipe.steps.map((step, i) => (
            <div key={i} className="flex gap-4">
              <div className="flex-shrink-0 w-7 h-7 rounded-full bg-green-100 text-green-700 text-sm font-bold flex items-center justify-center">
                {i + 1}
              </div>
              <p className="text-sm text-gray-700 pt-1 leading-relaxed">{step}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tags */}
      {recipe.tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {recipe.tags.map(tag => (
            <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full">
              #{tag.replace('_', ' ')}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
