'use client'

export function BackButton({ label = '← Nazad' }: { label?: string }) {
  return (
    <button
      onClick={() => window.history.back()}
      className="text-sm text-gray-500 hover:text-gray-700 transition"
    >
      {label}
    </button>
  )
}
