'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

type WeightLog = {
  weight: number
  loggedAt: string
}

type Props = {
  logs: WeightLog[]
  currentWeight: number
}

function formatDate(iso: string) {
  const d = new Date(iso)
  return `${d.getDate()}.${d.getMonth() + 1}.`
}

export function WeightChart({ logs, currentWeight }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [input, setInput] = useState('')
  const [error, setError] = useState('')

  const chartData = logs.map(l => ({
    date: formatDate(l.loggedAt),
    weight: l.weight,
  }))

  const hasData = logs.length >= 2
  const first = logs[0]?.weight
  const last = logs[logs.length - 1]?.weight
  const diff = hasData ? +(last - first).toFixed(1) : null

  async function handleLog(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    const val = parseFloat(input.replace(',', '.'))
    if (isNaN(val) || val < 30 || val > 300) {
      setError('Uneси vrednost između 30 i 300 kg')
      return
    }

    const res = await fetch('/api/weight', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ weight: val }),
    })

    if (res.ok) {
      setInput('')
      startTransition(() => router.refresh())
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="font-bold text-gray-900">Praćenje težine</h2>
          {diff !== null && (
            <p className={`text-xs mt-0.5 ${diff < 0 ? 'text-green-600' : diff > 0 ? 'text-orange-500' : 'text-gray-500'}`}>
              {diff > 0 ? '+' : ''}{diff} kg od prvog merenja
            </p>
          )}
        </div>
        <span className="text-2xl font-bold text-gray-900">{currentWeight} kg</span>
      </div>

      {hasData ? (
        <div className="h-40">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="weightGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#16a34a" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#9ca3af' }} tickLine={false} axisLine={false} />
              <YAxis
                domain={['dataMin - 2', 'dataMax + 2']}
                tick={{ fontSize: 11, fill: '#9ca3af' }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb', boxShadow: 'none' }}
                formatter={(v: number | undefined) => [v != null ? `${v} kg` : '', 'Težina']}
                labelStyle={{ color: '#6b7280' }}
              />
              <Area
                type="monotone"
                dataKey="weight"
                stroke="#16a34a"
                strokeWidth={2}
                fill="url(#weightGrad)"
                dot={{ r: 3, fill: '#16a34a', strokeWidth: 0 }}
                activeDot={{ r: 5, fill: '#16a34a' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="h-20 flex items-center justify-center text-sm text-gray-400">
          Uneси bar 2 merenja da vidiš grafikon
        </div>
      )}

      <form onSubmit={handleLog} className="flex gap-2 mt-4">
        <div className="flex-1">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="npr. 74.5"
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
        </div>
        <button
          type="submit"
          disabled={isPending || !input}
          className="bg-green-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-green-700 transition disabled:opacity-50"
        >
          {isPending ? '...' : 'Zapiši'}
        </button>
      </form>
    </div>
  )
}
