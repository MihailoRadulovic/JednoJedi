'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'

type Props = {
  planId: string
  currentStatus: string
}

export function PlanActions({ planId, currentStatus }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [confirm, setConfirm] = useState<string | null>(null)

  async function setStatus(status: string) {
    await fetch(`/api/plan/${planId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    setConfirm(null)
    startTransition(() => router.refresh())
  }

  if (currentStatus === 'archived') {
    return (
      <button
        onClick={() => setStatus('active')}
        disabled={isPending}
        className="text-xs text-green-600 hover:text-green-700 font-medium disabled:opacity-50"
      >
        Aktiviraj ponovo
      </button>
    )
  }

  return (
    <div className="flex items-center gap-3">
      {currentStatus === 'active' && (
        <>
          {confirm === 'completed' ? (
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">Završiti plan?</span>
              <button onClick={() => setStatus('completed')} className="text-xs text-blue-600 font-medium hover:underline">Da</button>
              <button onClick={() => setConfirm(null)} className="text-xs text-gray-400 hover:underline">Ne</button>
            </div>
          ) : (
            <button
              onClick={() => setConfirm('completed')}
              disabled={isPending}
              className="text-xs text-blue-600 hover:text-blue-700 font-medium disabled:opacity-50"
            >
              Označi kao završen
            </button>
          )}
        </>
      )}

      {confirm === 'archived' ? (
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">Arhivirati?</span>
          <button onClick={() => setStatus('archived')} className="text-xs text-red-500 font-medium hover:underline">Da</button>
          <button onClick={() => setConfirm(null)} className="text-xs text-gray-400 hover:underline">Ne</button>
        </div>
      ) : (
        <button
          onClick={() => setConfirm('archived')}
          disabled={isPending}
          className="text-xs text-gray-400 hover:text-gray-600 disabled:opacity-50"
        >
          Arhiviraj
        </button>
      )}
    </div>
  )
}
