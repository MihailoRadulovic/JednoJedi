'use client'

import { useState } from 'react'

type ShoppingItem = {
  name: string
  unit: string
  category: string
  totalAmount: number
  nationalPrice: number
  estimatedCost: number
}

const CATEGORY_LABEL: Record<string, string> = {
  meso: '🥩 Meso i riba',
  mlecni: '🥛 Mlečni i jaja',
  zitarice: '🌾 Žitarice',
  povrce: '🥦 Povrće i voće',
  zacini: '🫙 Začini i ulja',
  ostalo: '🛒 Ostalo',
}

type Props = {
  items: ShoppingItem[]
  totalCost: number
  planId: string
  budget?: number | null
}

function formatAmount(amount: number, unit: string): string {
  if (unit === 'kg') {
    return amount >= 1
      ? `${amount.toFixed(amount % 1 === 0 ? 0 : 2)} kg`
      : `${Math.round(amount * 1000)} g`
  }
  if (unit === 'litar') {
    return amount >= 1
      ? `${amount.toFixed(amount % 1 === 0 ? 0 : 2)} l`
      : `${Math.round(amount * 1000)} ml`
  }
  return `${amount % 1 === 0 ? amount : amount.toFixed(1)} ${unit}`
}

export function ShoppingList({ items, totalCost, planId, budget }: Props) {
  const storageKey = `shopping-checked-${planId}`
  const [checked, setChecked] = useState<Set<string>>(() => {
    if (typeof window === 'undefined') return new Set()
    try {
      const stored = localStorage.getItem(storageKey)
      return stored ? new Set(JSON.parse(stored)) : new Set()
    } catch {
      return new Set()
    }
  })

  function toggle(name: string) {
    setChecked(prev => {
      const next = new Set(prev)
      if (next.has(name)) next.delete(name)
      else next.add(name)
      try { localStorage.setItem(storageKey, JSON.stringify([...next])) } catch {}
      return next
    })
  }

  function clearAll() {
    setChecked(new Set())
    try { localStorage.removeItem(storageKey) } catch {}
  }

  const byCategory = items.reduce<Record<string, ShoppingItem[]>>((acc, item) => {
    if (!acc[item.category]) acc[item.category] = []
    acc[item.category].push(item)
    return acc
  }, {})

  const checkedCount = items.filter(i => checked.has(i.name)).length
  const remaining = items.length - checkedCount

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <div>
          <h2 className="font-bold text-gray-900">Lista kupovine</h2>
          {checkedCount > 0 && (
            <p className="text-xs text-gray-500 mt-0.5">{checkedCount}/{items.length} stavki kupljeno</p>
          )}
        </div>
        <div className="flex items-center gap-3">
          {checkedCount > 0 && (
            <button onClick={clearAll} className="text-xs text-gray-400 hover:text-gray-600">
              Resetuj
            </button>
          )}
          <span className="text-sm font-semibold text-green-600">≈ {Math.round(totalCost).toLocaleString('sr')} RSD</span>
        </div>
      </div>

      {budget && totalCost > budget && (
        <div className="mx-5 mt-4 p-3 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-700">
          ⚠️ Procenjena cena ({Math.round(totalCost).toLocaleString('sr')} RSD) premašuje tvoj budžet ({budget.toLocaleString('sr')} RSD)
        </div>
      )}

      {remaining === 0 && items.length > 0 && (
        <div className="mx-5 mt-4 p-3 bg-green-50 border border-green-200 rounded-xl text-sm text-green-700 text-center">
          ✓ Sve namirnice kupljene!
        </div>
      )}

      <div className="divide-y divide-gray-100">
        {Object.entries(byCategory)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([category, categoryItems]) => (
            <div key={category}>
              <div className="px-5 py-2.5 bg-gray-50">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  {CATEGORY_LABEL[category] ?? category}
                </span>
              </div>
              {categoryItems.sort((a, b) => a.name.localeCompare(b.name)).map(item => {
                const isChecked = checked.has(item.name)
                return (
                  <button
                    key={item.name}
                    onClick={() => toggle(item.name)}
                    className={`w-full px-5 py-3 flex items-center justify-between text-left transition ${
                      isChecked ? 'bg-gray-50' : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded flex-shrink-0 border-2 flex items-center justify-center transition ${
                        isChecked ? 'bg-green-500 border-green-500' : 'border-gray-300'
                      }`}>
                        {isChecked && (
                          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      <div>
                        <span className={`text-sm transition ${isChecked ? 'line-through text-gray-400' : 'text-gray-900'}`}>
                          {item.name}
                        </span>
                        <span className="text-xs text-gray-500 ml-2">{formatAmount(item.totalAmount, item.unit)}</span>
                      </div>
                    </div>
                    <span className={`text-sm font-medium transition ${isChecked ? 'text-gray-300' : 'text-gray-600'}`}>
                      ≈ {Math.round(item.estimatedCost).toLocaleString('sr')} RSD
                    </span>
                  </button>
                )
              })}
            </div>
          ))}
      </div>

      <div className="px-5 py-4 border-t border-gray-100 flex justify-between">
        <span className="text-sm font-medium text-gray-700">Ukupno</span>
        <span className="text-base font-bold text-gray-900">≈ {Math.round(totalCost).toLocaleString('sr')} RSD</span>
      </div>
    </div>
  )
}
