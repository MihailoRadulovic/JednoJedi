'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const MEAL_TYPES = [
  { value: 'dorucak', label: 'Doručak' },
  { value: 'uzina', label: 'Užina' },
  { value: 'rucak', label: 'Ručak' },
  { value: 'vecera', label: 'Večera' },
]

const DIFFICULTIES = [
  { value: 'lako', label: 'Lako', color: 'border-green-600 bg-green-50 text-green-800' },
  { value: 'srednje', label: 'Srednje', color: 'border-amber-500 bg-amber-50 text-amber-800' },
  { value: 'tesko', label: 'Teško', color: 'border-red-500 bg-red-50 text-red-800' },
]

const AVAILABLE_TAGS = [
  { value: 'brzo', label: '⚡ Brzo' },
  { value: 'visoko_proteinski', label: '💪 Visoko proteinski' },
  { value: 'veganski', label: '🌱 Veganski' },
  { value: 'bez_glutena', label: '🌾 Bez glutena' },
  { value: 'fit', label: '🎯 Fit' },
  { value: 'srpska_kuhinja', label: '🇷🇸 Srpska kuhinja' },
  { value: 'ekonomican', label: '💰 Ekonomičan' },
  { value: 'porodicni', label: '👨‍👩‍👧 Porodični' },
]

const inputClass = "w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-700 focus:border-transparent bg-white transition-all"
const labelClass = "block text-sm font-semibold text-gray-700 mb-1.5"

export default function NewRecipePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [name, setName] = useState('')
  const [mealTypes, setMealTypes] = useState<string[]>([])
  const [difficulty, setDifficulty] = useState('lako')
  const [prepTime, setPrepTime] = useState('')
  const [calories, setCalories] = useState('')
  const [protein, setProtein] = useState('')
  const [fat, setFat] = useState('')
  const [carbs, setCarbs] = useState('')
  const [steps, setSteps] = useState([''])
  const [tags, setTags] = useState<string[]>([])

  function toggleMealType(val: string) {
    setMealTypes(prev =>
      prev.includes(val) ? prev.filter(v => v !== val) : [...prev, val]
    )
  }

  function toggleTag(val: string) {
    setTags(prev => prev.includes(val) ? prev.filter(v => v !== val) : [...prev, val])
  }

  function addStep() {
    setSteps(prev => [...prev, ''])
  }

  function updateStep(i: number, val: string) {
    setSteps(prev => prev.map((s, idx) => idx === i ? val : s))
  }

  function removeStep(i: number) {
    if (steps.length === 1) return
    setSteps(prev => prev.filter((_, idx) => idx !== i))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/recipe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          mealTypes,
          difficulty,
          prepTime: Number(prepTime),
          calories: Number(calories),
          protein: Number(protein || 0),
          fat: Number(fat || 0),
          carbs: Number(carbs || 0),
          steps,
          tags,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'Greška pri čuvanju recepta.')
        return
      }

      router.push(`/recipe/${data.id}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Back */}
      <div className="mb-5">
        <Link href="/recipes" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition font-medium">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Recepti
        </Link>
      </div>

      {/* Header */}
      <div className="mb-7">
        <div className="inline-flex items-center gap-1.5 bg-green-100 text-green-800 text-xs font-bold px-3 py-1 rounded-full mb-3 border border-green-200">
          <span className="w-1.5 h-1.5 rounded-full bg-green-600 inline-block"></span>
          Moj recept
        </div>
        <h1 className="font-serif text-2xl font-bold text-gray-900">Kreiraj recept</h1>
        <p className="text-gray-500 text-sm mt-1 font-medium">Dodaj sopstveni recept u svoju kolekciju.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Naziv */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
          <h2 className="font-bold text-gray-900 text-sm uppercase tracking-wide text-gray-500">Osnovne informacije</h2>

          <div>
            <label className={labelClass}>Naziv recepta *</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="npr. Pileća čorba sa povrćem"
              required
              className={inputClass}
            />
          </div>

          {/* Meal types */}
          <div>
            <label className={labelClass}>Tip obroka *</label>
            <div className="flex gap-2 flex-wrap">
              {MEAL_TYPES.map(mt => (
                <button
                  key={mt.value}
                  type="button"
                  onClick={() => toggleMealType(mt.value)}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold border-2 transition-all ${
                    mealTypes.includes(mt.value)
                      ? 'border-green-700 bg-green-50 text-green-800'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300 bg-white'
                  }`}
                >
                  {mt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Difficulty + PrepTime */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Težina pripreme *</label>
              <div className="flex gap-2">
                {DIFFICULTIES.map(d => (
                  <button
                    key={d.value}
                    type="button"
                    onClick={() => setDifficulty(d.value)}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold border-2 transition-all ${
                      difficulty === d.value ? d.color : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className={labelClass}>Vreme pripreme (min) *</label>
              <input
                type="number"
                value={prepTime}
                onChange={e => setPrepTime(e.target.value)}
                placeholder="30"
                min="1"
                required
                className={inputClass}
              />
            </div>
          </div>
        </div>

        {/* Makroi */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
          <h2 className="font-bold text-gray-900 text-sm uppercase tracking-wide text-gray-500">Nutritivne vrednosti (po obroku)</h2>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>
                <span className="text-orange-600">●</span> Kalorije (kcal) *
              </label>
              <input
                type="number"
                value={calories}
                onChange={e => setCalories(e.target.value)}
                placeholder="450"
                min="1"
                required
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>
                <span className="text-blue-600">●</span> Proteini (g)
              </label>
              <input
                type="number"
                value={protein}
                onChange={e => setProtein(e.target.value)}
                placeholder="35"
                min="0"
                step="0.1"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>
                <span className="text-amber-600">●</span> Masti (g)
              </label>
              <input
                type="number"
                value={fat}
                onChange={e => setFat(e.target.value)}
                placeholder="12"
                min="0"
                step="0.1"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>
                <span className="text-purple-600">●</span> Ugljeni hidrati (g)
              </label>
              <input
                type="number"
                value={carbs}
                onChange={e => setCarbs(e.target.value)}
                placeholder="30"
                min="0"
                step="0.1"
                className={inputClass}
              />
            </div>
          </div>
        </div>

        {/* Koraci pripreme */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
          <h2 className="font-bold text-gray-900 text-sm uppercase tracking-wide text-gray-500">Koraci pripreme *</h2>

          <div className="space-y-3">
            {steps.map((step, i) => (
              <div key={i} className="flex gap-3 items-start">
                <div className="flex-shrink-0 w-7 h-7 rounded-full bg-green-700 text-white text-xs font-bold flex items-center justify-center mt-2.5 shadow-sm">
                  {i + 1}
                </div>
                <textarea
                  value={step}
                  onChange={e => updateStep(i, e.target.value)}
                  placeholder={`Korak ${i + 1}...`}
                  rows={2}
                  className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-700 focus:border-transparent resize-none transition-all"
                />
                {steps.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeStep(i)}
                    className="mt-2.5 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={addStep}
            className="flex items-center gap-2 text-sm font-semibold text-green-700 hover:text-green-800 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
            Dodaj korak
          </button>
        </div>

        {/* Tagovi */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-3">
          <h2 className="font-bold text-gray-900 text-sm uppercase tracking-wide text-gray-500">Tagovi <span className="text-gray-400 font-normal normal-case">(opciono)</span></h2>

          <div className="flex gap-2 flex-wrap">
            {AVAILABLE_TAGS.map(t => (
              <button
                key={t.value}
                type="button"
                onClick={() => toggleTag(t.value)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                  tags.includes(t.value)
                    ? 'bg-green-100 text-green-800 border-green-300 shadow-sm'
                    : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-center gap-2">
            <span className="text-red-500 text-lg">⚠️</span>
            <p className="text-sm text-red-700 font-medium">{error}</p>
          </div>
        )}

        {/* Submit */}
        <div className="flex gap-3 pb-6">
          <Link
            href="/recipes"
            className="flex-1 text-center border border-gray-200 text-gray-700 px-4 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-all text-sm"
          >
            Otkaži
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-green-700 text-white px-4 py-3 rounded-xl font-semibold hover:bg-green-800 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm text-sm"
          >
            {loading ? (
              <>
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Čuvam...
              </>
            ) : (
              <>
                Sačuvaj recept
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
