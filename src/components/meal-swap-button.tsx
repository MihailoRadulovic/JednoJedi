'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/components/toast'

type Props = {
  planId: string
  mealId: string
}

export function MealSwapButton({ planId, mealId }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const { toast } = useToast()

  async function handleSwap() {
    const res = await fetch(`/api/plan/${planId}/meal/${mealId}`, { method: 'PATCH' })
    if (res.ok) {
      toast('Obrok zamenjen')
      startTransition(() => router.refresh())
    } else {
      const data = await res.json()
      toast(data.error ?? 'Greška pri zameni', 'error')
    }
  }

  return (
    <button
      onClick={handleSwap}
      disabled={isPending}
      title="Zameni obrok"
      className="text-gray-300 hover:text-green-500 transition disabled:opacity-40"
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
    </button>
  )
}
