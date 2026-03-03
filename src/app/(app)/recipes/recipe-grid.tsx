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
  isCustom: boolean
  createdBy: string | null
}

const MEAL_FILTERS = [
  { value: 'sve', label: 'Sve' },
  { value: 'dorucak', label: 'Doručak' },
  { value: 'uzina', label: 'Užina' },
  { value: 'rucak', label: 'Ručak' },
  { value: 'vecera', label: 'Večera' },
]

const DIFF_COLOR: Record<string, string> = {
  lako: 'bg-green-50 text-green-700 border-green-200',
  srednje: 'bg-amber-50 text-amber-700 border-amber-200',
  tesko: 'bg-red-50 text-red-700 border-red-200',
}
const DIFF_LABEL: Record<string, string> = { lako: 'Lako', srednje: 'Srednje', tesko: 'Teško' }

const DIFF_FILTERS = [
  { value: 'sve', label: 'Sva' },
  { value: 'lako', label: 'Lako' },
  { value: 'srednje', label: 'Srednje' },
  { value: 'tesko', label: 'Teško' },
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

const MEAL_TYPE_LABEL: Record<string, string> = {
  dorucak: 'Doručak', uzina: 'Užina', rucak: 'Ručak', vecera: 'Večera',
}

export function RecipeGrid({
  recipes,
  favoritedIds = new Set(),
  myRecipeIds = new Set(),
}: {
  recipes: Recipe[]
  favoritedIds?: Set<string>
  myRecipeIds?: Set<string>
}) {
  const [filter, setFilter] = useState('sve')
  const [diffFilter, setDiffFilter] = useState('sve')
  const [activeTags, setActiveTags] = useState<Set<string>>(new Set())
  const [search, setSearch] = useState('')
  const [onlyMine, setOnlyMine] = useState(false)

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
    const matchesMine = !onlyMine || myRecipeIds.has(r.id)
    return matchesMeal && matchesDiff && matchesSearch && matchesTags && matchesMine
  })

  return (
    <div className="space-y-5">
      {/* Search */}
      <div className="relative">
        <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Pretraži recepte..."
          className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent bg-white transition-all"
        />
      </div>

      {/* Mine toggle + Meal type filter */}
      <div className="flex gap-2 flex-wrap items-center">
        {myRecipeIds.size > 0 && (
          <button
            onClick={() => setOnlyMine(prev => !prev)}
            className={`px-3.5 py-1.5 rounded-full text-sm font-semibold transition-all border-2 ${
              onlyMine
                ? 'border-green-700 bg-green-700 text-white shadow-sm'
                : 'border-green-700 text-green-700 bg-white hover:bg-green-50'
            }`}
          >
            ✦ Moji recepti
          </button>
        )}
        {MEAL_FILTERS.map(f => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`px-3.5 py-1.5 rounded-full text-sm font-semibold transition-all ${
              filter === f.value
                ? 'bg-green-700 text-white shadow-sm'
                : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300 hover:text-gray-900'
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
            className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
              diffFilter === f.value
                ? 'bg-gray-800 text-white shadow-sm'
                : 'bg-white border border-gray-200 text-gray-500 hover:border-gray-300 hover:text-gray-800'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Tag filter */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold tracking-widest uppercase text-gray-400">Tagovi</span>
          {activeTags.size > 0 && (
            <button
              onClick={() => setActiveTags(new Set())}
              className="text-xs text-green-700 hover:text-green-800 font-semibold"
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
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all border ${
                activeTags.has(t.value)
                  ? 'bg-green-100 text-green-800 border-green-300 shadow-sm'
                  : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300 hover:text-gray-700'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Results count */}
      <p className="text-xs text-gray-400 font-medium">
        {visible.length} {visible.length === 1 ? 'recept' : 'recepata'}
      </p>

      {/* Grid */}
      {visible.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <div className="text-4xl mb-3">🔍</div>
          <p className="text-sm font-medium">Nema recepata za ovaj filter</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {visible.map(recipe => (
            <Link
              key={recipe.id}
              href={`/recipe/${recipe.id}`}
              className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:border-gray-200 hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)] transition-all block"
            >
              {/* Colored top accent bar by difficulty */}
              <div className={`h-1 w-full ${
                recipe.difficulty === 'lako' ? 'bg-green-500' :
                recipe.difficulty === 'srednje' ? 'bg-amber-500' :
                'bg-red-400'
              }`} />

              <div className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {myRecipeIds.has(recipe.id) && (
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full font-bold border border-green-200">
                        Moj
                      </span>
                    )}
                    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold border ${DIFF_COLOR[recipe.difficulty] ?? 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                      {DIFF_LABEL[recipe.difficulty] ?? recipe.difficulty}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-gray-400 font-medium">{recipe.prepTime} min</span>
                    <span onClick={e => e.preventDefault()}>
                      <FavoriteButton recipeId={recipe.id} initialFavorited={favoritedIds.has(recipe.id)} />
                    </span>
                  </div>
                </div>

                <h3 className="font-bold text-gray-900 text-sm mb-3 leading-snug group-hover:text-green-700 transition-colors">
                  {recipe.name}
                </h3>

                {/* Macros */}
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

                {/* Meal type badges */}
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
