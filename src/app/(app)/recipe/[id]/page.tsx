import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { BackButton } from '@/components/back-button'
import { FavoriteButton } from '@/components/favorite-button'
import { PriceInput } from '@/components/price-input'
import { DeleteRecipeButton } from '@/components/delete-recipe-button'

const MEAL_LABEL: Record<string, string> = { dorucak: 'Doručak', uzina: 'Užina', rucak: 'Ručak', vecera: 'Večera' }
const DIFFICULTY_LABEL: Record<string, string> = { lako: 'Lako', srednje: 'Srednje', tesko: 'Teško' }
const DIFFICULTY_COLOR: Record<string, string> = {
  lako: 'bg-green-50 text-green-700 border-green-200',
  srednje: 'bg-amber-50 text-amber-700 border-amber-200',
  tesko: 'bg-red-50 text-red-700 border-red-200',
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

  const [favorited, userPrices] = await Promise.all([
    prisma.favoriteRecipe.findUnique({
      where: { userId_recipeId: { userId: session.user.id, recipeId: id } },
    }),
    prisma.userPrice.findMany({
      where: {
        userId: session.user.id,
        ingredientId: { in: recipe.ingredients.map(ri => ri.ingredientId) },
      },
      select: { ingredientId: true, price: true },
    }),
  ])

  const userPriceMap = Object.fromEntries(userPrices.map(p => [p.ingredientId, p.price]))

  const estimatedCost = recipe.ingredients.reduce(
    (sum, ri) => sum + ri.amount * ri.ingredient.nationalPrice,
    0
  )

  const isOwner = recipe.createdBy === session.user.id

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Back */}
      <div className="flex items-center justify-between">
        <BackButton />
        {isOwner && <DeleteRecipeButton recipeId={id} />}
      </div>

      {/* Header */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <div className="flex flex-wrap gap-2 mb-4">
          {recipe.isCustom && (
            <span className="text-xs bg-green-100 text-green-800 px-2.5 py-1 rounded-full font-bold border border-green-200">
              Moj recept
            </span>
          )}
          {recipe.mealTypes.map(mt => (
            <span key={mt} className="text-xs bg-green-50 text-green-700 px-2.5 py-1 rounded-full font-semibold border border-green-200">
              {MEAL_LABEL[mt] ?? mt}
            </span>
          ))}
          <span className={`text-xs px-2.5 py-1 rounded-full font-semibold border ${DIFFICULTY_COLOR[recipe.difficulty] ?? 'bg-gray-100 text-gray-600 border-gray-200'}`}>
            {DIFFICULTY_LABEL[recipe.difficulty] ?? recipe.difficulty}
          </span>
        </div>

        <div className="flex items-start justify-between gap-3">
          <h1 className="font-serif text-2xl font-bold text-gray-900 leading-tight">{recipe.name}</h1>
          <FavoriteButton recipeId={id} initialFavorited={!!favorited} />
        </div>

        <div className="flex items-center gap-2 mt-2">
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-sm text-gray-500 font-medium">{recipe.prepTime} min pripreme</p>
        </div>
      </div>

      {/* Makroi */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Kalorije', value: `${recipe.calories}`, unit: 'kcal', color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-100' },
          { label: 'Proteini', value: `${recipe.protein}`, unit: 'g', color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' },
          { label: 'Masti', value: `${recipe.fat}`, unit: 'g', color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100' },
          { label: 'Ugljeni hid.', value: `${recipe.carbs}`, unit: 'g', color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-100' },
        ].map(m => (
          <div key={m.label} className={`${m.bg} rounded-xl border ${m.border} p-3 text-center`}>
            <div className={`text-lg font-bold ${m.color}`}>
              {m.value}
              <span className="text-xs font-normal text-gray-500 ml-0.5">{m.unit}</span>
            </div>
            <div className="text-xs text-gray-500 mt-0.5 font-medium">{m.label}</div>
          </div>
        ))}
      </div>

      {/* Sastojci */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-gray-50">
          <h2 className="font-bold text-gray-900">Sastojci</h2>
          <span className="text-sm font-semibold text-green-700">≈ {Math.round(estimatedCost).toLocaleString('sr')} RSD</span>
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
              <div key={ri.id} className="px-5 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors">
                <div className="flex items-baseline gap-2">
                  <span className="text-sm font-semibold text-gray-900">{ingredient.name}</span>
                  <span className="text-xs text-gray-400 font-medium">{displayAmount}</span>
                </div>
                <span className="text-xs text-gray-500 font-medium">≈ {Math.round(itemCost)} RSD</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Moje cene */}
      <PriceInput
        recipeId={id}
        ingredients={recipe.ingredients.map(ri => ({
          id: ri.ingredient.id,
          name: ri.ingredient.name,
          nationalPrice: ri.ingredient.nationalPrice,
          unit: ri.ingredient.unit,
        }))}
        initialPrices={userPriceMap}
      />

      {/* Koraci */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 bg-gray-50">
          <h2 className="font-bold text-gray-900">Priprema</h2>
        </div>
        <div className="p-5 space-y-5">
          {recipe.steps.map((step, i) => (
            <div key={i} className="flex gap-4">
              <div className="flex-shrink-0 w-7 h-7 rounded-full bg-green-700 text-white text-xs font-bold flex items-center justify-center shadow-sm">
                {i + 1}
              </div>
              <p className="text-sm text-gray-700 pt-1 leading-relaxed">{step}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tags */}
      {recipe.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 pb-4">
          {recipe.tags.map(tag => (
            <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full font-medium border border-gray-200">
              #{tag.replace('_', ' ')}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
