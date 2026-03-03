'use client'

import { useState, useTransition } from 'react'

type Props = {
  recipeId: string
  initialFavorited: boolean
}

export function FavoriteButton({ recipeId, initialFavorited }: Props) {
  const [favorited, setFavorited] = useState(initialFavorited)
  const [isPending, startTransition] = useTransition()

  function toggle() {
    startTransition(async () => {
      const res = await fetch('/api/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipeId }),
      })
      if (res.ok) {
        const data = await res.json()
        setFavorited(data.favorited)
      }
    })
  }

  return (
    <button
      onClick={toggle}
      disabled={isPending}
      aria-label={favorited ? 'Ukloni iz omiljenih' : 'Dodaj u omiljene'}
      className={`p-2 rounded-full transition ${
        favorited
          ? 'text-red-500 hover:text-red-600'
          : 'text-gray-300 hover:text-red-400'
      } disabled:opacity-50`}
    >
      <svg className="w-5 h-5" fill={favorited ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    </button>
  )
}
