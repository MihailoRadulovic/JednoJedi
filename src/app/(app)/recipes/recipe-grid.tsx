'use client'

import { useState } from 'react'
import Link from 'next/link'
import { FavoriteButton } from '@/components/favorite-button'

type Recipe = {
  id: string
  name: string
  mealTypes: string[]
  prepTime: number
  difficulty: string
  calories: number
  protein: number
  fat: number
  carbs: number
  tags: string[]
}

const MEAL_FILTERS = [
  { value: 'sve', label: 'Sve' },
  { value: 'dorucak', label: 'Doručak' },
  { value: 'uzina', label: 'Užina' },
  { value: 'rucak', label: 'Ručak' },
  { value: 'vecera', label: 'Večera' },
]

const DIFF_COLOR: Record<string, string> = {
  lako: 'bg-green-50 text-green-700',
  srednje: 'bg-amber-50 text-amber-700',
  tesko: 'bg-red-50 text-red-700',
}
const DIFF_LABEL: Record<string, string> = { lako: 'Lako', srednje: 'Srednje', tesko: 'Teško' }

const DIFF_FILTERS = [
  { value: 'sve', label: 'Sva' },
  { value: 'lako', label: 'Lako' },
  { value: 'srednje', label: 'Srednje' },
  { value: 'tesko', label: 'Tesko' },
]

const TAG_FILTERS = [
  { value: 'brzo', label: '⚡ Brzo' },
  { value: 'visoko_proteinski', label: '💪 Visoko proteinski' },
  { value: 'veganski', label: '🌱 Veganski' },
  { value: 'bez_glutena', label: '🌾 Bez glutena' },
  { value: 'fit', label: '🎯 Fit' },
  { value: 'srpska_kuhinja', label: '🇷🇸 Srpska kuhinja' },
  { value: 'ekonomican', label: '💰 Ekonomičan' },
  { value: 'porodicni', label: '👨‍👩‍👧 Porodični' },
]

export function RecipeGrid({ recipes, favoritedIds = new Set() }: { recipes: Recipe[], favoritedIds?: Set<string> }) {
  const [filter, setFilter] = useState('sve')
  const [diffFilter, setDiffFilter] = useState('sve')
  const [activeTags, setActiveTags] = useState<Set<string>>(new Set())
  const [search, setSearch] = useState('')

  function toggleTag(tag: string) {
    setActiveTags(prev => {
      const next = new Set(prev)
      if (next.has(tag)) next.delete(tag)
      else next.add(tag)
      return next
    })
  }

  const visible = recipes.filter(r => {
    const matchesMeal = filter === 'sve' || r.mealTypes.includes(filter)
    const matchesDiff = diffFilter === 'sve' || r.difficulty === diffFilter
    const matchesSearch = !search || r.name.toLowerCase().includes(search.toLowerCase())
    const matchesTags = activeTags.size === 0 || [...activeTags].every(t => r.tags.includes(t))
    return matchesMeal && matchesDiff && matchesSearch && matchesTags
  })

  return (
    <div className="space-y-4">
      {/* Search */}
      <input
        type="text"
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="Pretraži recepte..."
        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500"
      />

      {/* Meal type filter chips */}
      <div className="flex gap-2 flex-wrap">
        {MEAL_FILTERS.map(f => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`px-3.5 py-1.5 rounded-full text-sm font-medium transition ${
              filter === f.value
                ? 'bg-green-600 text-white'
                : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Difficulty filter */}
      <div className="flex gap-2 flex-wrap">
        {DIFF_FILTERS.map(f => (
          <button
            key={f.value}
            onClick={() => setDiffFilter(f.value)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition ${
              diffFilter === f.value
                ? 'bg-gray-700 text-white'
                : 'bg-white border border-gray-200 text-gray-500 hover:border-gray-300'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Tag filter */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Tagovi</span>
          {activeTags.size > 0 && (
            <button
              onClick={() => setActiveTags(new Set())}
              className="text-xs text-green-600 hover:text-green-700 font-medium"
            >
              Resetuj ({activeTags.size})
            </button>
          )}
        </div>
        <div className="flex gap-2 flex-wrap">
          {TAG_FILTERS.map(t => (
            <button
              key={t.value}
              onClick={() => toggleTag(t.value)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition ${
                activeTags.has(t.value)
                  ? 'bg-green-100 text-green-800 border border-green-300'
                  : 'bg-white border border-gray-200 text-gray-500 hover:border-gray-300'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Results count */}
      <p className="text-xs text-gray-400">{visible.length} {visible.length === 1 ? 'recept' : 'recepata'}</p>

      {/* Grid */}
      {visible.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <div className="text-3xl mb-2">🔍</div>
          <p className="text-sm">Nema recepata za ovaj filter</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {visible.map(recipe => (
            <Link
              key={recipe.id}
              href={`/recipe/${recipe.id}`}
              className="bg-white rounded-2xl border border-gray-100 p-4 hover:border-gray-200 hover:shadow-sm transition block"
            >
              <div className="flex items-start justify-between mb-2">
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${DIFF_COLOR[recipe.difficulty] ?? 'bg-gray-100 text-gray-600'}`}>
                  {DIFF_LABEL[recipe.difficulty] ?? recipe.difficulty}
                </span>
                <div className="flex items-center gap-1">
                  <span className="text-xs text-gray-400">{recipe.prepTime} min</span>
                  <span onClick={e => e.preventDefault()}>
                    <FavoriteButton recipeId={recipe.id} initialFavorited={favoritedIds.has(recipe.id)} />
                  </span>
                </div>
              </div>

              <h3 className="font-semibold text-gray-900 text-sm mb-3 leading-snug">{recipe.name}</h3>

              {/* Macros */}
              <div className="grid grid-cols-4 gap-1 mb-3">
                {[
                  { label: 'kcal', value: recipe.calories, color: 'text-orange-600' },
                  { label: 'P', value: `${recipe.protein}g`, color: 'text-blue-600' },
                  { label: 'M', value: `${recipe.fat}g`, color: 'text-yellow-600' },
                  { label: 'U', value: `${recipe.carbs}g`, color: 'text-purple-600' },
                ].map(m => (
                  <div key={m.label} className="text-center">
                    <div className={`text-xs font-bold ${m.color}`}>{m.value}</div>
                    <div className="text-xs text-gray-400">{m.label}</div>
                  </div>
                ))}
              </div>

              {/* Meal type badges */}
              <div className="flex gap-1 flex-wrap">
                {recipe.mealTypes.map(mt => (
                  <span key={mt} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                    {mt === 'dorucak' ? 'Doručak' : mt === 'uzina' ? 'Užina' : mt === 'rucak' ? 'Ručak' : 'Večera'}
                  </span>
                ))}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
