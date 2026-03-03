'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

const PLAN_TYPES = [
  { value: 'WEEKLY', label: 'Nedeljni plan', desc: '7 dana × 4 obroka (28 obroka ukupno)', emoji: '📅' },
  { value: 'DAILY', label: 'Dnevni plan', desc: 'Doručak, užina, ručak i večera za 1 dan', emoji: '🌤️' },
  { value: 'SINGLE', label: 'Jedan obrok', desc: 'Izaberi jedan obrok koji želiš', emoji: '🍽️' },
]

const GOALS = [
  { value: 'DEFICIT', label: 'Mršavljenje', desc: 'Niži kalorijski unos za -400 kcal', emoji: '🔥', offset: -400 },
  { value: 'MAINTAIN', label: 'Održavanje', desc: 'Uravnotežena ishrana', emoji: '⚖️', offset: 0 },
  { value: 'SURPLUS', label: 'Masa', desc: 'Viši kalorijski unos za +400 kcal', emoji: '💪', offset: 400 },
]

const MEAL_TYPES = [
  { value: 'dorucak', label: 'Doručak' },
  { value: 'uzina', label: 'Užina' },
  { value: 'rucak', label: 'Ručak' },
  { value: 'vecera', label: 'Večera' },
]

function calcTDEE(height: number, weight: number, birthYear: number, goalOffset: number): number {
  const age = new Date().getFullYear() - birthYear
  const bmr = 10 * weight + 6.25 * height - 5 * age - 78
  const tdee = Math.round(bmr * 1.55)
  return Math.max(1200, tdee + goalOffset)
}

export default function NewPlanPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [suggestedCals, setSuggestedCals] = useState<number | null>(null)
  const [form, setForm] = useState({
    type: 'WEEKLY',
    goal: 'MAINTAIN',
    persons: '1',
    budget: '',
    targetCals: '',
    mealType: 'rucak',
  })

  useEffect(() => {
    if (step !== 3) return
    fetch('/api/user/profile')
      .then(r => r.json())
      .then(user => {
        if (user.height && user.weight && user.birthYear) {
          const goalOffset = GOALS.find(g => g.value === form.goal)?.offset ?? 0
          const tdee = calcTDEE(user.height, user.weight, user.birthYear, goalOffset)
          setSuggestedCals(tdee)
          setForm(prev => prev.targetCals ? prev : { ...prev, targetCals: String(tdee) })
        }
      })
      .catch(() => {})
  }, [step, form.goal])

  function set(key: string, value: string) {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  async function handleCreate() {
    setLoading(true)
    try {
      const res = await fetch('/api/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: form.type,
          goal: form.goal,
          persons: Number(form.persons),
          budget: form.budget ? Number(form.budget) : undefined,
          targetCals: form.targetCals ? Number(form.targetCals) : undefined,
          mealType: form.type === 'SINGLE' ? form.mealType : undefined,
        }),
      })
      const data = await res.json()
      if (data.id) router.push(`/plan/${data.id}`)
    } finally {
      setLoading(false)
    }
  }

  const STEP_LABELS = ['Tip plana', 'Cilj', 'Detalji']

  return (
    <div className="max-w-lg mx-auto">
      <div className="mb-7">
        <h1 className="font-serif text-2xl font-bold text-gray-900">Novi plan ishrane</h1>
        <p className="text-gray-500 text-sm mt-1 font-medium">Odaberi parametre i mi ćemo generisati plan za tebe.</p>
      </div>

      {/* Progress */}
      <div className="flex items-center gap-2 mb-8">
        {[1, 2, 3].map(n => (
          <div key={n} className="flex items-center gap-2 flex-1">
            <div className={`flex-1 h-1.5 rounded-full transition-all ${n <= step ? 'bg-green-700' : 'bg-gray-200'}`} />
          </div>
        ))}
      </div>

      {/* Step label */}
      <p className="text-xs font-bold tracking-widest uppercase text-gray-400 mb-4">
        Korak {step} od 3 — {STEP_LABELS[step - 1]}
      </p>

      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">

        {/* Step 1 – Tip plana */}
        {step === 1 && (
          <div>
            <h2 className="font-serif font-bold text-gray-900 text-lg mb-1">Koji tip plana želiš?</h2>
            <p className="text-gray-500 text-sm mb-5">Odaberi vremenski okvir planiranja.</p>
            <div className="space-y-3">
              {PLAN_TYPES.map(pt => (
                <button
                  key={pt.value}
                  onClick={() => set('type', pt.value)}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                    form.type === pt.value
                      ? 'border-green-700 bg-green-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{pt.emoji}</span>
                    <div>
                      <div className="font-bold text-gray-900 text-sm">{pt.label}</div>
                      <div className="text-xs text-gray-500 font-medium mt-0.5">{pt.desc}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {form.type === 'SINGLE' && (
              <div className="mt-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Koji obrok?</label>
                <div className="grid grid-cols-2 gap-2">
                  {MEAL_TYPES.map(mt => (
                    <button
                      key={mt.value}
                      onClick={() => set('mealType', mt.value)}
                      className={`p-3 rounded-xl border-2 text-sm font-semibold transition-all ${
                        form.mealType === mt.value
                          ? 'border-green-700 bg-green-50 text-green-800'
                          : 'border-gray-200 text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      {mt.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={() => setStep(2)}
              className="mt-6 w-full bg-green-700 text-white px-4 py-3 rounded-xl font-semibold hover:bg-green-800 transition-all shadow-sm"
            >
              Dalje →
            </button>
          </div>
        )}

        {/* Step 2 – Cilj */}
        {step === 2 && (
          <div>
            <h2 className="font-serif font-bold text-gray-900 text-lg mb-1">Koji je tvoj cilj?</h2>
            <p className="text-gray-500 text-sm mb-5">Recepti će biti prilagođeni kalorijskim ciljevima.</p>
            <div className="space-y-3">
              {GOALS.map(g => (
                <button
                  key={g.value}
                  onClick={() => set('goal', g.value)}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                    form.goal === g.value
                      ? 'border-green-700 bg-green-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{g.emoji}</span>
                    <div>
                      <div className="font-bold text-gray-900 text-sm">{g.label}</div>
                      <div className="text-xs text-gray-500 font-medium mt-0.5">{g.desc}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setStep(1)}
                className="flex-1 border border-gray-200 text-gray-700 px-4 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-all"
              >
                ← Nazad
              </button>
              <button
                onClick={() => { setSuggestedCals(null); setForm(p => ({ ...p, targetCals: '' })); setStep(3) }}
                className="flex-1 bg-green-700 text-white px-4 py-3 rounded-xl font-semibold hover:bg-green-800 transition-all shadow-sm"
              >
                Dalje →
              </button>
            </div>
          </div>
        )}

        {/* Step 3 – Detalji */}
        {step === 3 && (
          <div>
            <h2 className="font-serif font-bold text-gray-900 text-lg mb-1">Detalji plana</h2>
            <p className="text-gray-500 text-sm mb-5">Opciona podešavanja – možeš ostaviti prazno.</p>
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Broj osoba</label>
                <div className="flex gap-2">
                  {['1', '2', '3', '4'].map(n => (
                    <button
                      key={n}
                      onClick={() => set('persons', n)}
                      className={`flex-1 py-2.5 rounded-xl border-2 text-sm font-bold transition-all ${
                        form.persons === n
                          ? 'border-green-700 bg-green-50 text-green-800'
                          : 'border-gray-200 text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Budžet{form.type === 'WEEKLY' ? ' za nedelju' : ''} (RSD){' '}
                  <span className="text-gray-400 font-normal">– opciono</span>
                </label>
                <input
                  type="number"
                  value={form.budget}
                  onChange={e => set('budget', e.target.value)}
                  placeholder={form.type === 'WEEKLY' ? 'npr. 8000' : 'npr. 1200'}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-700 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-sm font-semibold text-gray-700">
                    Ciljani kalorijski unos (kcal/dan)
                  </label>
                  {suggestedCals && (
                    <button
                      type="button"
                      onClick={() => set('targetCals', String(suggestedCals))}
                      className="text-xs text-green-700 hover:text-green-800 font-semibold"
                    >
                      ↩ Vrati preporuku
                    </button>
                  )}
                </div>
                <input
                  type="number"
                  value={form.targetCals}
                  onChange={e => set('targetCals', e.target.value)}
                  placeholder="npr. 2000"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-700 focus:border-transparent transition-all"
                />
                {suggestedCals && (
                  <p className="text-xs text-gray-400 mt-2 leading-relaxed">
                    Preporučeno na osnovu tvog profila:{' '}
                    <span className="text-green-700 font-bold">{suggestedCals.toLocaleString('sr')} kcal/dan</span>
                    {' '}(TDEE formula, umerena aktivnost)
                  </p>
                )}
                {!suggestedCals && (
                  <p className="text-xs text-gray-400 mt-2">
                    Popuni profil (visina, težina, godina) da dobiješ automatsku preporuku.
                  </p>
                )}
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setStep(2)}
                className="flex-1 border border-gray-200 text-gray-700 px-4 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-all"
              >
                ← Nazad
              </button>
              <button
                onClick={handleCreate}
                disabled={loading}
                className="flex-1 bg-green-700 text-white px-4 py-3 rounded-xl font-semibold hover:bg-green-800 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    Generišem...
                  </>
                ) : 'Generiši plan ✨'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
