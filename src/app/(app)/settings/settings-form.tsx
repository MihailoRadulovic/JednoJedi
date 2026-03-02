'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'

const REGIONS = ['Beograd', 'Novi Sad', 'Niš', 'Kragujevac', 'Subotica', 'Ostalo']

type Props = {
  initialValues: {
    height?: number
    weight?: number
    birthYear?: number
    region: string
    mode: string
  }
}

export function SettingsForm({ initialValues }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [saved, setSaved] = useState(false)
  const [form, setForm] = useState({
    height: initialValues.height?.toString() ?? '',
    weight: initialValues.weight?.toString() ?? '',
    birthYear: initialValues.birthYear?.toString() ?? '',
    region: initialValues.region,
    mode: initialValues.mode,
  })

  function set(key: string, value: string) {
    setForm(prev => ({ ...prev, [key]: value }))
    setSaved(false)
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    const res = await fetch('/api/user/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        height: form.height ? Number(form.height) : undefined,
        weight: form.weight ? Number(form.weight) : undefined,
        birthYear: form.birthYear ? Number(form.birthYear) : undefined,
        region: form.region,
        mode: form.mode,
      }),
    })
    if (res.ok) {
      setSaved(true)
      startTransition(() => router.refresh())
    }
  }

  return (
    <form onSubmit={handleSave} className="bg-white rounded-2xl border border-gray-100 p-5 space-y-5">
      <h2 className="font-bold text-gray-900">Fizički podaci</h2>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Visina (cm)</label>
          <input
            type="number"
            value={form.height}
            onChange={e => set('height', e.target.value)}
            placeholder="175"
            min="140" max="220"
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Težina (kg)</label>
          <input
            type="number"
            value={form.weight}
            onChange={e => set('weight', e.target.value)}
            placeholder="75"
            min="40" max="200"
            step="0.1"
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Godina rođenja</label>
          <input
            type="number"
            value={form.birthYear}
            onChange={e => set('birthYear', e.target.value)}
            placeholder="1990"
            min="1940" max="2010"
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Region</label>
          <select
            value={form.region}
            onChange={e => set('region', e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Mod planiranja</label>
        <div className="grid grid-cols-2 gap-3">
          {[
            { value: 'RELAXED', label: 'Opušteno', desc: 'Pribl. makroi' },
            { value: 'PRECISE', label: 'Precizno', desc: 'Tačni makroi' },
          ].map(m => (
            <button
              key={m.value}
              type="button"
              onClick={() => set('mode', m.value)}
              className={`p-3 rounded-xl border-2 text-sm text-left transition ${
                form.mode === m.value ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="font-medium text-gray-900">{m.label}</div>
              <div className="text-xs text-gray-500 mt-0.5">{m.desc}</div>
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-3 pt-1">
        <button
          type="submit"
          disabled={isPending}
          className="bg-green-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-green-700 transition disabled:opacity-60"
        >
          {isPending ? 'Čuvam...' : 'Sačuvaj'}
        </button>
        {saved && (
          <span className="text-sm text-green-600 font-medium">✓ Sačuvano</span>
        )}
      </div>
    </form>
  )
}
