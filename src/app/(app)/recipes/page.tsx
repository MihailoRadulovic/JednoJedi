import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { RecipeGrid } from './recipe-grid'

export default async function RecipesPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect('/login')

  const [recipes, favorites] = await Promise.all([
    prisma.recipe.findMany({
      orderBy: { name: 'asc' },
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
    }),
    prisma.favoriteRecipe.findMany({
      where: { userId: session.user.id },
      select: { recipeId: true },
    }),
  ])

  const favoritedIds = new Set(favorites.map(f => f.recipeId))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Recepti</h1>
          <p className="text-gray-500 text-sm mt-1">{recipes.length} recepata u bazi</p>
        </div>
        <Link
          href="/favorites"
          className="text-sm text-gray-500 hover:text-red-500 transition flex items-center gap-1.5"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
          Omiljeni
        </Link>
      </div>

      <RecipeGrid recipes={recipes} favoritedIds={favoritedIds} />
    </div>
  )
}
