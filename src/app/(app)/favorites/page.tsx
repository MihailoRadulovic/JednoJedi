import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { FavoriteButton } from '@/components/favorite-button'

const DIFF_COLOR: Record<string, string> = {
  lako: 'bg-green-50 text-green-700 border-green-200',
  srednje: 'bg-amber-50 text-amber-700 border-amber-200',
  tesko: 'bg-red-50 text-red-700 border-red-200',
}
const DIFF_LABEL: Record<string, string> = { lako: 'Lako', srednje: 'Srednje', tesko: 'Teško' }

const MEAL_TYPE_LABEL: Record<string, string> = {
  dorucak: 'Doručak', uzina: 'Užina', rucak: 'Ručak', vecera: 'Večera',
}

export default async function FavoritesPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect('/login')

  const favorites = await prisma.favoriteRecipe.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
    include: {
      recipe: {
        select: {
          id: true,
          name: true,
          mealTypes: true,
          prepTime: true,
          difficulty: true,
          calories: true,
          protein: true,
          fat: true,
          carbs: true,
          tags: true,
        },
      },
    },
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold text-gray-900">Omiljeni recepti</h1>
          <p className="text-gray-500 text-sm mt-1 font-medium">{favorites.length} sačuvanih recepata</p>
        </div>
        <Link href="/recipes" className="text-sm text-green-700 hover:text-green-800 font-semibold">
          Svi recepti →
        </Link>
      </div>

      {favorites.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-5xl mb-4">🤍</div>
          <h2 className="font-serif text-xl font-bold text-gray-800 mb-2">Nema omiljenih recepata</h2>
          <p className="text-gray-500 text-sm mb-7 leading-relaxed max-w-xs mx-auto">
            Klikni na srce na receptu da ga sačuvaš ovde.
          </p>
          <Link
            href="/recipes"
            className="inline-flex items-center gap-2 bg-green-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-green-800 transition-all"
          >
            Pregledaj recepte
          </Link>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {favorites.map(({ recipe }) => (
            <Link
              key={recipe.id}
              href={`/recipe/${recipe.id}`}
              className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:border-gray-200 hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)] transition-all block"
            >
              {/* Difficulty top bar */}
              <div className={`h-1 w-full ${
                recipe.difficulty === 'lako' ? 'bg-green-500' :
                recipe.difficulty === 'srednje' ? 'bg-amber-500' :
                'bg-red-400'
              }`} />

              <div className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-semibold border ${DIFF_COLOR[recipe.difficulty] ?? 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                    {DIFF_LABEL[recipe.difficulty] ?? recipe.difficulty}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-gray-400 font-medium">{recipe.prepTime} min</span>
                    <span onClick={e => e.preventDefault()}>
                      <FavoriteButton recipeId={recipe.id} initialFavorited={true} />
                    </span>
                  </div>
                </div>

                <h3 className="font-bold text-gray-900 text-sm mb-3 leading-snug group-hover:text-green-700 transition-colors">
                  {recipe.name}
                </h3>

                <div className="grid grid-cols-4 gap-1 mb-3 bg-gray-50 rounded-lg p-2">
                  {[
                    { label: 'kcal', value: recipe.calories, color: 'text-orange-600' },
                    { label: 'P', value: `${recipe.protein}g`, color: 'text-blue-600' },
                    { label: 'M', value: `${recipe.fat}g`, color: 'text-amber-600' },
                    { label: 'U', value: `${recipe.carbs}g`, color: 'text-purple-600' },
                  ].map(m => (
                    <div key={m.label} className="text-center">
                      <div className={`text-xs font-bold ${m.color}`}>{m.value}</div>
                      <div className="text-xs text-gray-400 font-medium">{m.label}</div>
                    </div>
                  ))}
                </div>

                <div className="flex gap-1 flex-wrap">
                  {recipe.mealTypes.map(mt => (
                    <span key={mt} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-medium">
                      {MEAL_TYPE_LABEL[mt] ?? mt}
                    </span>
                  ))}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
