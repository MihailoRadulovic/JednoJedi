import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { RecipeGrid } from './recipe-grid'

export default async function RecipesPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect('/login')

  const recipes = await prisma.recipe.findMany({
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
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Recepti</h1>
          <p className="text-gray-500 text-sm mt-1">{recipes.length} recepata u bazi</p>
        </div>
      </div>

      <RecipeGrid recipes={recipes} />
    </div>
  )
}
