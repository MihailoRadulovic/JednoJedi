'use client'

import { useState } from 'react'

type Ingredient = {
  id: string
  name: string
  nationalPrice: number
  unit: string
}

type Props = {
  ingredients: Ingredient[]
  recipeId: string
  initialPrices: Record<string, number>
}

export function PriceInput({ ingredients, recipeId, initialPrices }: Props) {
  const [open, setOpen] = useState(false)
  const [prices, setPrices] = useState<Record<string, string>>(
    Object.fromEntries(ingredients.map(ing => [ing.id, initialPrices[ing.id]?.toString() ?? '']))
  )
  const [saving, setSaving] = useState<string | null>(null)
  const [saved, setSaved] = useState<Record<string, boolean>>({})

  async function savePrice(ingredientId: string) {
    const val = parseFloat(prices[ingredientId])
    if (!val || val <= 0) return
    setSaving(ingredientId)
    const res = await fetch('/api/prices', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ingredientId, price: val }),
    })
    setSaving(null)
    if (res.ok) {
      setSaved(prev => ({ ...prev, [ingredientId]: true }))
      setTimeout(() => setSaved(prev => ({ ...prev, [ingredientId]: false })), 2000)
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      <button
        onClick={() => setOpen(prev => !prev)}
        className="w-full flex items-center justify-between px-5 py-4 border-b border-gray-100 hover:bg-gray-50 transition"
      >
        <div className="text-left">
          <div className="font-bold text-gray-900 text-sm">Moje cene</div>
          <div className="text-xs text-gray-500">Unesi stvarne cene iz tvoje prodavnice</div>
        </div>
        <svg
          className={`w-4 h-4 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="divide-y divide-gray-100">
          {ingredients.map(ing => (
            <div key={ing.id} className="px-5 py-3 flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-900 truncate">{ing.name}</div>
                <div className="text-xs text-gray-400">Prosek: {ing.nationalPrice} RSD/{ing.unit}</div>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={prices[ing.id]}
                  onChange={e => setPrices(prev => ({ ...prev, [ing.id]: e.target.value }))}
                  onBlur={() => savePrice(ing.id)}
                  placeholder={ing.nationalPrice.toString()}
                  min="1"
                  className="w-20 border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs text-right focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <span className="text-xs text-gray-400">RSD</span>
                {saving === ing.id && (
                  <span className="text-xs text-gray-400">...</span>
                )}
                {saved[ing.id] && (
                  <span className="text-xs text-green-600">✓</span>
                )}
              </div>
            </div>
          ))}
          <div className="px-5 py-3 bg-gray-50">
            <p className="text-xs text-gray-400">Cene se čuvaju automatski kad izađeš iz polja.</p>
          </div>
        </div>
      )}
    </div>
  )
}
