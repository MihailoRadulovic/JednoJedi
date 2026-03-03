'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useToast } from './toast'

export function DeleteRecipeButton({ recipeId }: { recipeId: string }) {
  const [confirming, setConfirming] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  async function handleDelete() {
    setLoading(true)
    try {
      const res = await fetch(`/api/recipe/${recipeId}`, { method: 'DELETE' })
      if (res.ok) {
        toast('Recept obrisan', 'success')
        router.push('/recipes')
        router.refresh()
      } else {
        const data = await res.json()
        toast(data.error ?? 'Greška pri brisanju', 'error')
        setConfirming(false)
      }
    } finally {
      setLoading(false)
    }
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-500 font-medium">Sigurno?</span>
        <button
          onClick={handleDelete}
          disabled={loading}
          className="text-xs bg-red-500 text-white px-3 py-1.5 rounded-lg font-semibold hover:bg-red-600 transition-all disabled:opacity-60"
        >
          {loading ? 'Brišem...' : 'Obriši'}
        </button>
        <button
          onClick={() => setConfirming(false)}
          className="text-xs border border-gray-200 text-gray-600 px-3 py-1.5 rounded-lg font-semibold hover:bg-gray-50 transition-all"
        >
          Otkaži
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-red-500 transition-colors font-medium"
    >
      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
      </svg>
      Obriši recept
    </button>
  )
}
