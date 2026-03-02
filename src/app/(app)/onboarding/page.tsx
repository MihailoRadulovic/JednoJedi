'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'

const REGIONS = ['Beograd', 'Novi Sad', 'Niš', 'Kragujevac', 'Subotica', 'Ostalo']

const GOALS = [
  { value: 'DEFICIT', label: 'Mršavljenje', desc: 'Kalorijskii deficit za gubitak telesne mase', emoji: '🔥' },
  { value: 'MAINTAIN', label: 'Održavanje', desc: 'Zdrava ishrana bez promene kilaže', emoji: '⚖️' },
  { value: 'SURPLUS', label: 'Masa', desc: 'Kalorijski suficit za povećanje mišićne mase', emoji: '💪' },
]

export default function OnboardingPage() {
  const router = useRouter()
  const { update } = useSession()

  const [step, setStep] = useState(1)
  const [form, setForm] = useState({
    height: '',
    weight: '',
    birthYear: '',
    region: 'Beograd',
    goal: 'MAINTAIN',
    mode: 'RELAXED',
  })
  const [loading, setLoading] = useState(false)

  function set(key: string, value: string) {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  async function handleSubmit() {
    setLoading(true)
    try {
      await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          height: form.height,
          weight: form.weight,
          birthYear: form.birthYear,
          region: form.region,
          mode: form.mode,
        }),
      })
      await update()
      router.push('/dashboard')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 w-full max-w-md">
        {/* Progress */}
        <div className="flex gap-1.5 mb-8">
          {[1, 2, 3].map(n => (
            <div
              key={n}
              className={`h-1.5 flex-1 rounded-full transition-colors ${n <= step ? 'bg-green-500' : 'bg-gray-100'}`}
            />
          ))}
        </div>

        {/* Step 1 – Fizički podaci */}
        {step === 1 && (
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-1">Fizički podaci</h2>
            <p className="text-gray-500 text-sm mb-6">Ovo nam pomaže da izračunamo tvoje dnevne potrebe.</p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Visina (cm)</label>
                <input
                  type="number"
                  value={form.height}
                  onChange={e => set('height', e.target.value)}
                  placeholder="175"
                  min="140"
                  max="220"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Težina (kg)</label>
                <input
                  type="number"
                  value={form.weight}
                  onChange={e => set('weight', e.target.value)}
                  placeholder="75"
                  min="40"
                  max="200"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Godina rođenja</label>
                <input
                  type="number"
                  value={form.birthYear}
                  onChange={e => set('birthYear', e.target.value)}
                  placeholder="1990"
                  min="1940"
                  max="2010"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>

            <button
              onClick={() => setStep(2)}
              disabled={!form.height || !form.weight || !form.birthYear}
              className="mt-6 w-full bg-green-600 text-white px-4 py-3 rounded-xl font-medium hover:bg-green-700 transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Dalje →
            </button>
          </div>
        )}

        {/* Step 2 – Cilj */}
        {step === 2 && (
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-1">Koji je tvoj cilj?</h2>
            <p className="text-gray-500 text-sm mb-6">Plan ishrane ćemo prilagoditi tvojim ciljevima.</p>

            <div className="space-y-3">
              {GOALS.map(g => (
                <button
                  key={g.value}
                  onClick={() => set('goal', g.value)}
                  className={`w-full text-left p-4 rounded-xl border-2 transition ${
                    form.goal === g.value ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{g.emoji}</span>
                    <div>
                      <div className="font-semibold text-gray-900">{g.label}</div>
                      <div className="text-xs text-gray-500">{g.desc}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setStep(1)}
                className="flex-1 border border-gray-200 text-gray-700 px-4 py-3 rounded-xl font-medium hover:bg-gray-50 transition"
              >
                ← Nazad
              </button>
              <button
                onClick={() => setStep(3)}
                className="flex-1 bg-green-600 text-white px-4 py-3 rounded-xl font-medium hover:bg-green-700 transition"
              >
                Dalje →
              </button>
            </div>
          </div>
        )}

        {/* Step 3 – Region i podešavanja */}
        {step === 3 && (
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-1">Lokacija i mod</h2>
            <p className="text-gray-500 text-sm mb-6">Koristimo lokalne cene namirnica za tačnije planove.</p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Grad / region</label>
                <select
                  value={form.region}
                  onChange={e => set('region', e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  {REGIONS.map(r => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Mod planiranja</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => set('mode', 'RELAXED')}
                    className={`p-3 rounded-xl border-2 text-sm transition ${
                      form.mode === 'RELAXED' ? 'border-green-500 bg-green-50' : 'border-gray-200'
                    }`}
                  >
                    <div className="font-medium text-gray-900">Opušteno</div>
                    <div className="text-xs text-gray-500 mt-0.5">Pribl. makroi</div>
                  </button>
                  <button
                    onClick={() => set('mode', 'PRECISE')}
                    className={`p-3 rounded-xl border-2 text-sm transition ${
                      form.mode === 'PRECISE' ? 'border-green-500 bg-green-50' : 'border-gray-200'
                    }`}
                  >
                    <div className="font-medium text-gray-900">Precizno</div>
                    <div className="text-xs text-gray-500 mt-0.5">Tačni makroi</div>
                  </button>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setStep(2)}
                className="flex-1 border border-gray-200 text-gray-700 px-4 py-3 rounded-xl font-medium hover:bg-gray-50 transition"
              >
                ← Nazad
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1 bg-green-600 text-white px-4 py-3 rounded-xl font-medium hover:bg-green-700 transition disabled:opacity-60"
              >
                {loading ? 'Čuvam...' : 'Završi →'}
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
